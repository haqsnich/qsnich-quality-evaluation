/*
========================================================
ระบบประเมินผลงาน
Category Page
Version : 2.0.1
========================================================
*/


/* =====================================================
   GAS API
   ===================================================== */

const GAS_URL =
    APP_CONFIG.API_URL;


/* =====================================================
   เมื่อหน้าโหลด
   โหลดข้อมูลใหม่ทุกครั้ง
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /*
         * โหลดข้อมูลใหม่จาก GAS
         */

        loadCategoryData();

    }
);

/* =====================================================
   CATEGORY LOADING
   ===================================================== */

function showCategoryLoading() {

    const loading =
        document.getElementById(
            "categoryLoading"
        );


    if (loading) {

        loading.hidden =
            false;


        loading.classList.remove(
            "hide"
        );

    }


    /* -----------------------------------------------
       ระหว่างโหลด
       ห้ามแสดงจำนวนจากรอบก่อน
       ----------------------------------------------- */

    const workCount =
        document.getElementById(
            "workCount"
        );


    const evaluatedCount =
        document.getElementById(
            "evaluatedCount"
        );


    if (workCount) {

        workCount.textContent =
            "...";

    }


    if (evaluatedCount) {

        evaluatedCount.textContent =
            "...";

    }

}


function hideCategoryLoading() {

    const workList =
        document.getElementById(
            "workList"
        );


    if (!workList) {

        return;

    }


    workList.classList.remove(
        "content-enter"
    );


    void workList.offsetWidth;


    setTimeout(
        function () {

            workList.classList.add(
                "content-enter"
            );

        },
        80
    );

}

/* =====================================================
   โหลดข้อมูล Category
   โหลดข้อมูลใหม่ทุกครั้ง
   รอข้อมูลคะแนนให้พร้อมก่อนแสดงหน้า
   ===================================================== */

async function loadCategoryData() {

    try {

        /* -----------------------------------------------
           1. อ่านข้อมูลกรรมการจาก Session
           ----------------------------------------------- */

        const storedJudge =
            sessionStorage.getItem(
                "judge"
            );


        if (!storedJudge) {

            throw new Error(
                "ไม่พบข้อมูลกรรมการ กรุณาเข้าสู่ระบบใหม่"
            );

        }


        const loginData =
            JSON.parse(
                storedJudge
            );


        if (
            !loginData ||
            !loginData.judge
        ) {

            throw new Error(
                "ข้อมูลกรรมการไม่ถูกต้อง"
            );

        }


        const judge =
            loginData.judge;


        /* -----------------------------------------------
           2. แสดงชื่อกรรมการ
           ----------------------------------------------- */

        displayJudge(
            judge
        );


        /* -----------------------------------------------
   3. โหลดผลงานจาก Static JSON

   ไม่ยิง GAS
   ไม่อ่าน Google Sheet
   ----------------------------------------------- */

        const response =
            await fetch(
                "./data/works.json?_t=" +
                Date.now(),
                {
                    method:
                        "GET",

                    cache:
                        "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "ไม่สามารถโหลดข้อมูลผลงานได้"
            );

        }


        /* -----------------------------------------------
           4. อ่าน JSON
           ----------------------------------------------- */

        const result =
            await response.json();


        console.log(
            "STATIC WORKS RESULT =",
            result
        );


        /* -----------------------------------------------
           5. ตรวจข้อมูล Works
           ----------------------------------------------- */

        let allWorks =
            [];


        if (
            Array.isArray(
                result
            )
        ) {

            allWorks =
                result;

        }
        else if (
            result &&
            Array.isArray(
                result.works
            )
        ) {

            allWorks =
                result.works;

        }


        if (
            !Array.isArray(
                allWorks
            )
        ) {

            throw new Error(
                "รูปแบบข้อมูล works.json ไม่ถูกต้อง"
            );

        }

        /* -----------------------------------------------
           6. หา ID กรรมการ
           ----------------------------------------------- */

        const judgeId =
            String(
                judge.id ||
                judge.judge_id ||
                judge.code ||
                ""
            ).trim();


        if (!judgeId) {

            throw new Error(
                "ไม่พบรหัสกรรมการ"
            );

        }


        /* -----------------------------------------------
           7. กรองผลงานตามกรรมการ

           สำคัญ:
           ใช้ let เพราะข้อ 9 จะนำ works
           ไปอัปเดตสถานะคะแนนใหม่
           ----------------------------------------------- */

        let works =
            allWorks.filter(

                function (
                    work
                ) {

                    if (!work) {

                        return false;

                    }


                    const active =
                        String(
                            work.active
                        )
                            .trim()
                            .toLowerCase();


                    if (
                        active === "false" ||
                        active === "0" ||
                        active === "no"
                    ) {

                        return false;

                    }


                    const judgeIds =
                        String(
                            work.judge_ids ||
                            work.judgeIds ||
                            work.judges ||
                            ""
                        )
                            .split(",")
                            .map(

                                function (
                                    id
                                ) {

                                    return String(
                                        id
                                    ).trim();

                                }

                            )
                            .filter(
                                Boolean
                            );


                    return judgeIds.includes(
                        judgeId
                    );

                }

            );


        /* -----------------------------------------------
           8. เรียงผลงานตาม order
           ----------------------------------------------- */

        works.sort(

            function (
                a,
                b
            ) {

                return (

                    Number(
                        a.order ||
                        0
                    )

                    -

                    Number(
                        b.order ||
                        0
                    )

                );

            }

        );


        /* -----------------------------------------------
    9. ตั้งค่าเริ่มต้น

    รายชื่อผลงานแสดงทันที
    ส่วนจำนวน "ประเมินแล้ว"
    โหลดสถานะคะแนนเบื้องหลัง
    ----------------------------------------------- */

        works.forEach(
            function (
                work
            ) {

                if (work) {

                    work.hasSubmitted =
                        false;

                }

            }
        );


        /* -----------------------------------------------
           10. เก็บ Works ลง Session ก่อน
           ----------------------------------------------- */

        sessionStorage.setItem(
            "works",
            JSON.stringify(
                works
            )
        );


        sessionStorage.setItem(
            "worksCacheJudgeId",
            judgeId
        );


        /* -----------------------------------------------
           11. อัปเดตข้อมูล Login
           ----------------------------------------------- */

        const updatedSession = {

            success:
                true,

            judge:
                judge,

            works:
                works,

            criteria:
                Array.isArray(
                    loginData.criteria
                )
                    ? loginData.criteria
                    : []

        };


        sessionStorage.setItem(
            "judge",
            JSON.stringify(
                updatedSession
            )
        );


        /* -----------------------------------------------
   12. แสดงรายชื่อผลงานทันที
   ----------------------------------------------- */

        displayWorks(
            works
        );

        displayWorkCount(
            works.length
        );


        /* -----------------------------------------------
           จำนวน "ประเมินแล้ว"
           แสดง ... ระหว่างรอ GAS
           ----------------------------------------------- */

        const evaluatedElement =
            document.getElementById(
                "evaluatedCount"
            );


        if (
            evaluatedElement
        ) {

            evaluatedElement.textContent =
                "...";

        }


        /* -----------------------------------------------
           เล่น Animation รายการ
           ----------------------------------------------- */

        hideCategoryLoading();


        /* -----------------------------------------------
           13. ตรวจคะแนนเบื้องหลัง

           สำคัญ:
           ไม่มี await
           จึงไม่บล็อกรายชื่อผลงาน
           ----------------------------------------------- */

        checkExistingScores(
            judgeId,
            works
        )
            .then(
                function (
                    checkedWorks
                ) {

                    if (
                        !Array.isArray(
                            checkedWorks
                        )
                    ) {

                        return;

                    }


                    /* ---------------------------------------
                       เก็บ Works ที่มีสถานะคะแนนจริง
                       --------------------------------------- */

                    sessionStorage.setItem(
                        "works",
                        JSON.stringify(
                            checkedWorks
                        )
                    );


                    /* ---------------------------------------
                       อัปเดต Judge Session
                       --------------------------------------- */

                    const currentSession =
                        JSON.parse(
                            sessionStorage.getItem(
                                "judge"
                            ) ||
                            "{}"
                        );


                    currentSession.works =
                        checkedWorks;


                    sessionStorage.setItem(
                        "judge",
                        JSON.stringify(
                            currentSession
                        )
                    );


                    /* ---------------------------------------
                       อัปเดตเฉพาะเลขประเมินแล้ว
                       ไม่ Render รายการผลงานใหม่
                       --------------------------------------- */

                    displayEvaluatedCount();


                    console.log(
                        "SCORE STATUS READY =",
                        checkedWorks
                    );

                }
            )
            .catch(
                function (
                    error
                ) {

                    console.warn(
                        "ตรวจสถานะคะแนนเบื้องหลังไม่สำเร็จ:",
                        error
                    );


                    if (
                        evaluatedElement
                    ) {

                        evaluatedElement.textContent =
                            "-";

                    }

                }
            );


        /* -----------------------------------------------
           Debug
           ----------------------------------------------- */

        console.log(
            "กรรมการ =",
            judge.name
        );


        console.log(
            "รหัสกรรมการ =",
            judgeId
        );


        console.log(
            "ผลงานที่ได้รับมอบหมาย =",
            works.length
        );


        console.log(
            "CATEGORY READY"
        );

    }
    catch (
    error
    ) {

        console.error(
            "Category Error =",
            error
        );


        showCategoryError(
            error &&
                error.message
                ? error.message
                : "เกิดข้อผิดพลาดในการโหลดข้อมูล"
        );

    }

}


/* =====================================================
   แสดงชื่อกรรมการ
   ===================================================== */

function displayJudge(
    judge
) {

    const element =
        document.getElementById(
            "judgeName"
        );


    if (!element) {

        return;

    }


    element.textContent =
        judge.name || "-";

}


/* =====================================================
   แสดงจำนวนผลงาน
   ===================================================== */

function displayWorkCount(
    count
) {

    const element =
        document.getElementById(
            "workCount"
        );


    if (!element) {

        return;

    }


    element.textContent =
        String(
            count
        );

}

/* =====================================================
   แสดงจำนวนผลงานที่ประเมินแล้ว
   ใช้สถานะคะแนนจริงจาก Work
   ===================================================== */

function displayEvaluatedCount() {

    const element =
        document.getElementById(
            "evaluatedCount"
        );


    if (!element) {

        return;

    }


    let works =
        [];


    try {

        const raw =
            sessionStorage.getItem(
                "works"
            );


        if (raw) {

            works =
                JSON.parse(
                    raw
                );

        }

    }
    catch (
    error
    ) {

        console.warn(
            "อ่าน Works ไม่ได้:",
            error
        );

        works =
            [];

    }


    if (
        !Array.isArray(
            works
        )
    ) {

        works =
            [];

    }


    let evaluatedCount =
        0;


    works.forEach(

        function (
            work
        ) {

            if (
                work &&
                work.hasSubmitted === true
            ) {

                evaluatedCount++;

            }

        }

    );


    element.textContent =
        String(
            evaluatedCount
        );

}

/* =====================================================
   แสดงรายการผลงาน
   ===================================================== */

function displayWorks(
    works
) {

    const workList =
        document.getElementById(
            "workList"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (!workList) {

        return;

    }


    workList.innerHTML =
        "";


    /* -----------------------------------------------
       ไม่มีผลงาน
       ----------------------------------------------- */

    if (
        !Array.isArray(works) ||
        works.length === 0
    ) {

        if (emptyState) {

            emptyState.hidden =
                false;

        }

        return;

    }


    /* -----------------------------------------------
       มีผลงาน
       ----------------------------------------------- */

    if (emptyState) {

        emptyState.hidden =
            true;

    }


    // -----------------------------------------------
    // จัดกลุ่มผลงานตามประเภท
    // -----------------------------------------------

    const groupedWorks = {};

    works.forEach(
        function (work) {

            const category =
                String(
                    work.category || "ผลงาน"
                ).trim();

            if (!groupedWorks[category]) {

                groupedWorks[category] = [];

            }

            groupedWorks[category].push(
                work
            );

        }
    );


    // -----------------------------------------------
    // แสดงผลงานแยกตามประเภท
    // -----------------------------------------------

    Object.keys(
        groupedWorks
    ).forEach(
        function (categoryName) {

            // หัวข้อประเภท

            const categoryTitle =
                document.createElement(
                    "div"
                );

            categoryTitle.className =
                "work-category-group-title";

            categoryTitle.textContent =
                categoryName;


            workList.appendChild(
                categoryTitle
            );


            // ผลงานในประเภทนั้น

            groupedWorks[
                categoryName
            ].forEach(
                function (
                    work,
                    index
                ) {

                    const card =
                        createWorkCard(
                            work,
                            index
                        );

                    workList.appendChild(
                        card
                    );

                }
            );

        }
    );

}

/* =====================================================
   สร้าง Card ผลงาน
   ===================================================== */

function createWorkCard(
    work,
    index
) {

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "work-card";


    /* -----------------------------------------------
       หมายเลข
       ----------------------------------------------- */

    const number =
        document.createElement(
            "div"
        );

    number.className =
        "work-order";

    number.textContent =
        work.id ||
        "-";


    /* -----------------------------------------------
       Content
       ----------------------------------------------- */

    const content =
        document.createElement(
            "div"
        );

    content.className =
        "work-content";


    /* -----------------------------------------------
       Category
       ----------------------------------------------- */

    const category =
        document.createElement(
            "div"
        );

    category.className =
        "work-category";

    category.textContent =
        work.category ||
        "ผลงาน";


    /* -----------------------------------------------
       Title
       ----------------------------------------------- */

    const title =
        document.createElement(
            "div"
        );

    title.className =
        "work-title";

    title.textContent =
        work.title ||
        "ไม่ระบุชื่อผลงาน";


    /* -----------------------------------------------
       Presenter
       ----------------------------------------------- */

    const presenter =
        document.createElement(
            "div"
        );

    presenter.className =
        "work-presenter";

    const presenterText =
        String(
            work.presenter ||
            ""
        );

    presenter.innerHTML = `
        <span class="presenter-desktop">
            ${presenterText}
        </span>

        <span class="presenter-ipad-portrait">
            ${presenterText.replace(
        /,\s*/g,
        "<br>"
    )}
        </span>
    `;


    /* -----------------------------------------------
       Department
       ----------------------------------------------- */

    const department =
        document.createElement(
            "div"
        );

    department.className =
        "work-department";

    department.textContent =
        work.department ||
        "";


    /* -----------------------------------------------
       ใส่ข้อมูลลง Content
       ----------------------------------------------- */

    content.appendChild(
        category
    );

    content.appendChild(
        title
    );


    if (
        work.presenter
    ) {

        content.appendChild(
            presenter
        );

    }


    if (
        work.department
    ) {

        content.appendChild(
            department
        );

    }


    /* =================================================
       ACTION BUTTONS
       ================================================= */

    const actionArea =
        document.createElement(
            "div"
        );

    actionArea.className =
        "work-actions";


    /* =================================================
       สร้างปุ่มมาตรฐาน
       ================================================= */

    function createActionButton(
        icon,
        text,
        className,
        onClick
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.type =
            "button";

        button.className =
            "work-action-button" +
            (
                className
                    ? ` ${className}`
                    : ""
            );

        button.innerHTML = `
            <span class="work-action-icon">
                ${icon}
            </span>

            <span class="work-action-text">
                ${text}
            </span>
        `;

        button.addEventListener(
            "click",
            function (
                event
            ) {

                event.stopPropagation();

                onClick();

            }
        );

        return button;

    }


    /* =================================================
       ดูบทคัดย่อ
       ================================================= */

    const abstractButton =
        createActionButton(
            "📄",
            "ดูบทคัดย่อ",
            "",
            function () {

                openWorkFileModal(
                    work,
                    "abstract"
                );

            }
        );


    actionArea.appendChild(
        abstractButton
    );


    /* =================================================
       ดูโปสเตอร์
       ================================================= */

    const posterCategories = [
        "CQI Poster Presentation",
        "CQI Digital Poster presentation",
        "KM"
    ];


    const hasPoster =
        posterCategories.includes(
            String(
                work.category ||
                ""
            ).trim()
        );


    if (
        hasPoster
    ) {

        const posterButton =
            createActionButton(
                "🖼️",
                "ดูโปสเตอร์",
                "",
                function () {

                    openWorkFileModal(
                        work,
                        "poster"
                    );

                }
            );


        actionArea.appendChild(
            posterButton
        );

    }


    /* =================================================
   ลงคะแนน
   ใช้ปุ่มรูปแบบเดียวตลอด
   ไม่เปลี่ยนเป็น "แก้ไขคะแนน"
   ================================================= */

    const scoreButton =
        createActionButton(
            "📝",
            "ลงคะแนน",
            "is-primary",
            function () {

                selectWork(
                    work
                );

            }
        );


    actionArea.appendChild(
        scoreButton
    );


    /* =================================================
       รวม Card
       ================================================= */

    card.appendChild(
        number
    );

    card.appendChild(
        content
    );

    card.appendChild(
        actionArea
    );


    return card;

}


/* =====================================================
   เลือกผลงาน
   ไปหน้าลงคะแนนแบบ Smooth
   ===================================================== */

function selectWork(
    work
) {

    if (!work) {

        console.error(
            "ไม่พบข้อมูลผลงาน"
        );

        return;

    }


    /*
     * เก็บผลงานที่เลือก
     */

    sessionStorage.setItem(
        "selectedWork",
        JSON.stringify(
            work
        )
    );


    console.log(
        "เลือกผลงาน =",
        work
    );


    /*
     * -----------------------------------------------
     * Animation ก่อนเปลี่ยนหน้า
     * -----------------------------------------------
     */

    document.body.classList.add(
        "page-leaving"
    );


    /*
     * รอ Animation เล่นก่อน
     * แล้วค่อยเปลี่ยนหน้า
     */

    setTimeout(
        function () {

            window.location.href =
                "./evaluation.html";

        },
        280
    );

}


/* =====================================================
   แสดง Error
   ===================================================== */

function showCategoryError(
    message
) {

    const workList =
        document.getElementById(
            "workList"
        );


    if (!workList) {
        return;
    }


    workList.innerHTML = "";


    const error =
        document.createElement(
            "div"
        );

    error.className =
        "category-error";


    /* -----------------------------------------------
       รูปเศร้า
       ----------------------------------------------- */

    const image =
        document.createElement(
            "img"
        );

    image.className =
        "error-mascot";

    image.src =
        "./assets/images/qsnich-sad.png";

    image.alt =
        "ไม่สามารถโหลดข้อมูลได้";


    /* -----------------------------------------------
       หัวข้อ
       ----------------------------------------------- */

    const title =
        document.createElement(
            "div"
        );

    title.className =
        "category-error-title";

    title.textContent =
        "ไม่สามารถโหลดข้อมูลได้";


    /* -----------------------------------------------
       ข้อความ
       ----------------------------------------------- */

    const text =
        document.createElement(
            "div"
        );

    text.className =
        "category-error-message";

    text.textContent =
        message ||
        "กรุณากด refresh หน้านี้ หรือเข้าสู่ระบบใหม่อีกครั้ง";


    /* -----------------------------------------------
       รวม
       ----------------------------------------------- */

    error.appendChild(
        image
    );

    error.appendChild(
        title
    );

    error.appendChild(
        text
    );


    workList.appendChild(
        error
    );

}

/* =====================================================
   LOGOUT
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        if (!logoutButton) {
            return;
        }


        logoutButton.addEventListener(
            "click",
            function () {

                /*
                 * =========================================
                 * ล้างข้อมูลกรรมการ
                 * =========================================
                 */

                sessionStorage.removeItem(
                    "judge"
                );


                /*
                 * =========================================
                 * ล้าง Works Cache
                 *
                 * สำคัญมาก
                 *
                 * เพื่อให้ Login ใหม่ต้องโหลดใหม่
                 * =========================================
                 */

                sessionStorage.removeItem(
                    "works"
                );


                sessionStorage.removeItem(
                    "worksCacheJudgeId"
                );


                /*
                 * =========================================
                 * ล้างผลงานที่เลือกค้างไว้
                 * =========================================
                 */

                sessionStorage.removeItem(
                    "selectedWork"
                );


                /*
                 * =========================================
                 * ล้าง Criteria Cache
                 *
                 * ป้องกันข้อมูลจาก Login รอบก่อน
                 * =========================================
                 */

                sessionStorage.removeItem(
                    "criteria"
                );


                /*
                 * =========================================
                 * กลับหน้า Login
                 * =========================================
                 */

                window.location.href =
                    "./index.html";

            }
        );

    }
);

/* =====================================================
   PRELOAD POSTER IMAGE
   ===================================================== */

function preloadPosterImage(
    url
) {

    return new Promise(
        function (
            resolve
        ) {

            if (
                !url
            ) {

                resolve();

                return;

            }


            const image =
                new Image();


            image.onload =
                function () {

                    resolve();

                };


            image.onerror =
                function () {

                    resolve();

                };


            image.src =
                String(
                    url
                ).trim();

        }
    );

}

/* =====================================================
   PRELOAD WORK FILES

   Abstract = PDF
   Poster   = JPG

   โหลดล่วงหน้าแค่ 3 ไฟล์แรก
   ===================================================== */

function preloadWorkFiles(
    works
) {

    if (
        !Array.isArray(
            works
        ) ||
        works.length === 0
    ) {

        return;

    }


    setTimeout(
        async function () {

            const preloadQueue =
                [];


            for (
                const work of works
            ) {

                if (!work) {

                    continue;

                }


                const abstractUrl =
                    String(
                        work.pdf_url ||
                        ""
                    ).trim();


                const posterUrl =
                    String(
                        work.poster_url ||
                        ""
                    ).trim();


                if (
                    abstractUrl
                ) {

                    preloadQueue.push({

                        type:
                            "pdf",

                        url:
                            abstractUrl

                    });

                }


                if (
                    posterUrl
                ) {

                    preloadQueue.push({

                        type:
                            "image",

                        url:
                            posterUrl

                    });

                }

            }


            const limitedQueue =
                preloadQueue.slice(
                    0,
                    3
                );


            for (
                const item of limitedQueue
            ) {

                if (
                    item.type === "pdf"
                ) {

                    await cachePdfFile(
                        item.url
                    );

                }


                else if (
                    item.type === "image"
                ) {

                    await preloadPosterImage(
                        item.url
                    );

                }


                await new Promise(
                    function (
                        resolve
                    ) {

                        setTimeout(
                            resolve,
                            80
                        );

                    }
                );

            }

        },
        800
    );

}

/* =====================================================
   POSTER ZOOM + PAN
 
   iPad pinch zoom + drag
   Desktop mouse wheel zoom
 
   แยก State จาก PDF โดยสมบูรณ์
   ===================================================== */

let posterScale = 1;

let posterTranslateX = 0;
let posterTranslateY = 0;

let posterPinchDistance = 0;

let posterDragX = 0;
let posterDragY = 0;


/* =====================================================
   POSTER — ระยะระหว่าง 2 นิ้ว
   ===================================================== */

function getPosterTouchDistance(
    touches
) {

    if (
        !touches ||
        touches.length < 2
    ) {

        return 0;

    }


    const dx =
        touches[0].clientX -
        touches[1].clientX;


    const dy =
        touches[0].clientY -
        touches[1].clientY;


    return Math.hypot(
        dx,
        dy
    );

}


/* =====================================================
   POSTER — จุดกึ่งกลางระหว่าง 2 นิ้ว
   ===================================================== */

function getPosterTouchMidpoint(
    touches
) {

    return {

        x:
            (
                touches[0].clientX +
                touches[1].clientX
            ) / 2,

        y:
            (
                touches[0].clientY +
                touches[1].clientY
            ) / 2

    };

}


/* =====================================================
   APPLY POSTER TRANSFORM
   ===================================================== */

function applyPosterTransform(
    poster
) {

    if (!poster) {

        return;

    }


    poster.style.transform =
        "translate3d(" +
        posterTranslateX +
        "px, " +
        posterTranslateY +
        "px, 0) scale(" +
        posterScale +
        ")";


    poster.style.transformOrigin =
        "center center";

}


/* =====================================================
   RESET POSTER
   ===================================================== */

function resetPosterZoom(
    poster
) {

    posterScale =
        1;


    posterTranslateX =
        0;


    posterTranslateY =
        0;


    posterPinchDistance =
        0;


    posterDragX =
        0;


    posterDragY =
        0;


    if (poster) {

        poster.style.transform =
            "translate3d(0, 0, 0) scale(1)";


        poster.style.transformOrigin =
            "center center";

    }

}


/* =====================================================
   ZOOM POSTER AT POINT
   ===================================================== */

function zoomPosterAtPoint(
    poster,
    newScale,
    pointX,
    pointY
) {

    if (!poster) {

        return;

    }


    const oldScale =
        posterScale;


    newScale =
        Math.min(
            5,
            Math.max(
                1,
                newScale
            )
        );


    /* -----------------------------------------
       กลับถึง 1x
       ----------------------------------------- */

    if (
        newScale <= 1
    ) {

        resetPosterZoom(
            poster
        );


        return;

    }


    /* -----------------------------------------
       ตำแหน่ง Poster ปัจจุบัน
       ----------------------------------------- */

    const rect =
        poster.getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;


    const centerY =
        rect.top +
        rect.height / 2;


    const offsetX =
        pointX -
        centerX;


    const offsetY =
        pointY -
        centerY;


    const scaleRatio =
        newScale /
        oldScale;


    /* -----------------------------------------
       ขยายจากตำแหน่งนิ้ว
       ----------------------------------------- */

    posterTranslateX -=
        offsetX *
        (
            scaleRatio - 1
        );


    posterTranslateY -=
        offsetY *
        (
            scaleRatio - 1
        );


    posterScale =
        newScale;


    applyPosterTransform(
        poster
    );

}


/* =====================================================
   SETUP POSTER ZOOM
   ===================================================== */

function setupPosterZoom(
    poster,
    modal
) {

    if (
        !poster ||
        !modal ||
        poster.dataset.zoomReady
    ) {

        return;

    }


    poster.dataset.zoomReady =
        "true";


    /* =================================================
       ป้องกัน Safari Native Zoom
       เฉพาะ Poster
       ================================================= */

    poster.style.touchAction =
        "none";


    poster.addEventListener(
        "gesturestart",
        function (
            event
        ) {

            event.preventDefault();

            event.stopPropagation();

        },
        {
            passive:
                false
        }
    );


    poster.addEventListener(
        "gesturechange",
        function (
            event
        ) {

            event.preventDefault();

            event.stopPropagation();

        },
        {
            passive:
                false
        }
    );


    poster.addEventListener(
        "gestureend",
        function (
            event
        ) {

            event.preventDefault();

            event.stopPropagation();

        },
        {
            passive:
                false
        }
    );


    /* =================================================
       อนุญาต Zoom เฉพาะตอน
       Popup เปิด + Poster แสดงอยู่
       ================================================= */

    function canZoom() {

        return (
            !modal.hidden &&
            !poster.hidden
        );

    }


    /* =================================================
       DESKTOP — MOUSE WHEEL
       ================================================= */

    poster.addEventListener(
        "wheel",
        function (
            event
        ) {

            if (
                !canZoom()
            ) {

                return;

            }


            event.preventDefault();


            const factor =
                event.deltaY < 0
                    ? 1.15
                    : 0.87;


            zoomPosterAtPoint(
                poster,
                posterScale * factor,
                event.clientX,
                event.clientY
            );

        },
        {
            passive:
                false
        }
    );


    /* =================================================
       TOUCH START
       ================================================= */

    poster.addEventListener(
        "touchstart",
        function (
            event
        ) {

            if (
                !canZoom()
            ) {

                return;

            }


            /* -----------------------------------------
               2 นิ้ว = เริ่ม Pinch
               ----------------------------------------- */

            if (
                event.touches.length === 2
            ) {

                event.preventDefault();

                event.stopPropagation();


                posterPinchDistance =
                    getPosterTouchDistance(
                        event.touches
                    );


                return;

            }


            /* -----------------------------------------
               1 นิ้ว = Drag
               เฉพาะเมื่อ Zoom > 1
               ----------------------------------------- */

            if (
                event.touches.length === 1 &&
                posterScale > 1
            ) {

                event.preventDefault();

                event.stopPropagation();


                posterDragX =
                    event.touches[0].clientX;


                posterDragY =
                    event.touches[0].clientY;

            }

        },
        {
            passive:
                false
        }
    );


    /* =================================================
       TOUCH MOVE
       ================================================= */

    poster.addEventListener(
        "touchmove",
        function (
            event
        ) {

            if (
                !canZoom()
            ) {

                return;

            }


            /* -----------------------------------------
               2 นิ้ว = Pinch Zoom
               ----------------------------------------- */

            if (
                event.touches.length === 2
            ) {

                event.preventDefault();

                event.stopPropagation();


                const newDistance =
                    getPosterTouchDistance(
                        event.touches
                    );


                if (
                    !posterPinchDistance
                ) {

                    posterPinchDistance =
                        newDistance;


                    return;

                }


                const midpoint =
                    getPosterTouchMidpoint(
                        event.touches
                    );


                const ratio =
                    newDistance /
                    posterPinchDistance;


                zoomPosterAtPoint(
                    poster,
                    posterScale * ratio,
                    midpoint.x,
                    midpoint.y
                );


                posterPinchDistance =
                    newDistance;


                return;

            }


            /* -----------------------------------------
               1 นิ้ว = Drag
               ----------------------------------------- */

            if (
                event.touches.length === 1 &&
                posterScale > 1
            ) {

                event.preventDefault();

                event.stopPropagation();


                const touch =
                    event.touches[0];


                posterTranslateX +=
                    touch.clientX -
                    posterDragX;


                posterTranslateY +=
                    touch.clientY -
                    posterDragY;


                posterDragX =
                    touch.clientX;


                posterDragY =
                    touch.clientY;


                applyPosterTransform(
                    poster
                );

            }

        },
        {
            passive:
                false
        }
    );


    /* =================================================
       TOUCH END
       ================================================= */

    poster.addEventListener(
        "touchend",
        function (
            event
        ) {

            posterPinchDistance =
                0;


            if (
                event.touches.length === 1 &&
                posterScale > 1
            ) {

                posterDragX =
                    event.touches[0].clientX;


                posterDragY =
                    event.touches[0].clientY;

            }
            else {

                posterDragX =
                    0;


                posterDragY =
                    0;

            }


            if (
                posterScale <= 1
            ) {

                resetPosterZoom(
                    poster
                );

            }

        },
        {
            passive:
                false
        }
    );


    /* =================================================
       TOUCH CANCEL
       ================================================= */

    poster.addEventListener(
        "touchcancel",
        function () {

            posterPinchDistance =
                0;


            posterDragX =
                0;


            posterDragY =
                0;

        },
        {
            passive:
                false
        }
    );

}

/* =====================================================
   PDF ZOOM + PAN
   Adapt จากระบบ Poster
   แยกทำงานเฉพาะบทคัดย่อ
   ไม่กระทบระบบ Poster
   ===================================================== */

let pdfScale = 1;

let pdfTranslateX = 0;
let pdfTranslateY = 0;

let pdfPinchDistance = 0;

let pdfDragX = 0;
let pdfDragY = 0;


/* =====================================================
   PDF — ระยะระหว่าง 2 นิ้ว
   แยกจาก Poster โดยเฉพาะ
   ===================================================== */

function getPdfTouchDistance(
    touches
) {

    if (
        !touches ||
        touches.length < 2
    ) {

        return 0;

    }


    const dx =
        touches[0].clientX -
        touches[1].clientX;


    const dy =
        touches[0].clientY -
        touches[1].clientY;


    return Math.hypot(
        dx,
        dy
    );

}


/* =====================================================
   PDF — จุดกึ่งกลางระหว่าง 2 นิ้ว
   แยกจาก Poster โดยเฉพาะ
   ===================================================== */

function getPdfTouchMidpoint(
    touches
) {

    return {

        x:
            (
                touches[0].clientX +
                touches[1].clientX
            ) / 2,

        y:
            (
                touches[0].clientY +
                touches[1].clientY
            ) / 2

    };

}


/* =====================================================
   APPLY PDF TRANSFORM
   ===================================================== */

function applyPdfTransform(
    pages
) {

    if (!pages) {

        return;

    }


    pages.style.transform =
        "translate3d(" +
        pdfTranslateX +
        "px, " +
        pdfTranslateY +
        "px, 0) scale(" +
        pdfScale +
        ")";


    pages.style.transformOrigin =
        "center center";

}


/* =====================================================
   RESET PDF ZOOM
   ===================================================== */

function resetPdfZoom(
    pages
) {

    pdfScale =
        1;


    pdfTranslateX =
        0;


    pdfTranslateY =
        0;


    pdfPinchDistance =
        0;


    pdfDragX =
        0;


    pdfDragY =
        0;


    if (pages) {

        pages.style.transform =
            "translate3d(0, 0, 0) scale(1)";


        pages.style.transformOrigin =
            "center center";

    }

}


/* =====================================================
   ZOOM PDF AT POINT
   ใช้หลักเดียวกับ Poster
   ===================================================== */

function zoomPdfAtPoint(
    pages,
    newScale,
    pointX,
    pointY
) {

    if (!pages) {

        return;

    }


    const oldScale =
        pdfScale;


    newScale =
        Math.min(
            5,
            Math.max(
                1,
                newScale
            )
        );


    /* -----------------------------------------
       หุบกลับถึง 1x
       ให้กลับตรงกลาง
       ----------------------------------------- */

    if (
        newScale <= 1
    ) {

        resetPdfZoom(
            pages
        );


        return;

    }


    /* -----------------------------------------
       ตำแหน่ง PDF ปัจจุบัน
       ----------------------------------------- */

    const rect =
        pages.getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;


    const centerY =
        rect.top +
        rect.height / 2;


    /* -----------------------------------------
       ตำแหน่งนิ้วเทียบกับกลาง PDF
       ----------------------------------------- */

    const offsetX =
        pointX -
        centerX;


    const offsetY =
        pointY -
        centerY;


    /* -----------------------------------------
       อัตราการเปลี่ยน Scale
       ----------------------------------------- */

    const scaleRatio =
        newScale /
        oldScale;


    /* -----------------------------------------
       ชดเชยตำแหน่ง
       ให้ขยายจากบริเวณระหว่างสองนิ้ว
       ----------------------------------------- */

    pdfTranslateX -=
        offsetX *
        (
            scaleRatio - 1
        );


    pdfTranslateY -=
        offsetY *
        (
            scaleRatio - 1
        );


    pdfScale =
        newScale;


    applyPdfTransform(
        pages
    );

}


/* =====================================================
   SETUP PDF ZOOM
   ===================================================== */

function setupPdfZoom(
    viewer,
    pages,
    modal
) {

    if (
        !viewer ||
        !pages ||
        !modal ||
        viewer.dataset.zoomReady
    ) {

        return;

    }


    viewer.dataset.zoomReady =
        "true";


    /* =================================================
       สำคัญมาก
 
       กัน Safari ใช้ Native Zoom
       เฉพาะพื้นที่ PDF
       ================================================= */

    viewer.style.touchAction =
        "pan-x pan-y";

    pages.style.touchAction =
        "pan-x pan-y";


    /* =================================================
       Safari Gesture Events
 
       กันการซูมทั้งหน้า / ทั้ง Popup
       ================================================= */

    viewer.addEventListener(
        "gesturestart",
        function (
            event
        ) {

            event.preventDefault();

            event.stopPropagation();

        },
        {
            passive:
                false
        }
    );


    viewer.addEventListener(
        "gesturechange",
        function (
            event
        ) {

            event.preventDefault();

            event.stopPropagation();

        },
        {
            passive:
                false
        }
    );


    viewer.addEventListener(
        "gestureend",
        function (
            event
        ) {

            event.preventDefault();

            event.stopPropagation();

        },
        {
            passive:
                false
        }
    );


    /* =================================================
       อนุญาต Custom Zoom เฉพาะเมื่อ
 
       - Popup เปิด
       - PDF Viewer แสดงอยู่
       ================================================= */

    function canZoom() {

        return (
            !modal.hidden &&
            !viewer.hidden
        );

    }


    /* =================================================
       TOUCH START
       ================================================= */

    viewer.addEventListener(
        "touchstart",
        function (
            event
        ) {

            if (
                !canZoom()
            ) {

                return;

            }


            /* -----------------------------------------
               2 นิ้ว = เริ่ม Pinch
               ----------------------------------------- */

            if (
                event.touches.length === 2
            ) {

                event.preventDefault();

                event.stopPropagation();


                pdfPinchDistance =
                    getPdfTouchDistance(
                        event.touches
                    );


                return;

            }


            /* -----------------------------------------
               1 นิ้ว = เริ่มลาก
               ลากได้เมื่อขยายเกิน 1x
               ----------------------------------------- */

            if (
                event.touches.length === 1 &&
                pdfScale > 1
            ) {

                event.preventDefault();

                event.stopPropagation();


                pdfDragX =
                    event.touches[0].clientX;


                pdfDragY =
                    event.touches[0].clientY;

            }

        },
        {
            passive:
                false
        }
    );


    /* =================================================
       TOUCH MOVE
       ================================================= */

    viewer.addEventListener(
        "touchmove",
        function (
            event
        ) {

            if (
                !canZoom()
            ) {

                return;

            }


            /* -----------------------------------------
               2 นิ้ว = Pinch Zoom
               ----------------------------------------- */

            if (
                event.touches.length === 2
            ) {

                event.preventDefault();

                event.stopPropagation();


                const newDistance =
                    getPdfTouchDistance(
                        event.touches
                    );


                if (
                    !pdfPinchDistance
                ) {

                    pdfPinchDistance =
                        newDistance;


                    return;

                }


                const midpoint =
                    getPdfTouchMidpoint(
                        event.touches
                    );


                const ratio =
                    newDistance /
                    pdfPinchDistance;


                zoomPdfAtPoint(
                    pages,
                    pdfScale * ratio,
                    midpoint.x,
                    midpoint.y
                );


                pdfPinchDistance =
                    newDistance;


                return;

            }


            /* -----------------------------------------
               1 นิ้ว = Drag
               ----------------------------------------- */

            if (
                event.touches.length === 1 &&
                pdfScale > 1
            ) {

                event.preventDefault();

                event.stopPropagation();


                const touch =
                    event.touches[0];


                pdfTranslateX +=
                    touch.clientX -
                    pdfDragX;


                pdfTranslateY +=
                    touch.clientY -
                    pdfDragY;


                pdfDragX =
                    touch.clientX;


                pdfDragY =
                    touch.clientY;


                applyPdfTransform(
                    pages
                );

            }

        },
        {
            passive:
                false
        }
    );


    /* =================================================
       TOUCH END
       ================================================= */

    viewer.addEventListener(
        "touchend",
        function (
            event
        ) {

            pdfPinchDistance =
                0;


            /* -----------------------------------------
               เหลือ 1 นิ้วหลัง Pinch
               ให้ต่อเป็น Drag ได้เลย
               ----------------------------------------- */

            if (
                event.touches.length === 1 &&
                pdfScale > 1
            ) {

                pdfDragX =
                    event.touches[0].clientX;


                pdfDragY =
                    event.touches[0].clientY;

            }
            else {

                pdfDragX =
                    0;


                pdfDragY =
                    0;

            }


            /* -----------------------------------------
               กลับถึง 1x
               Reset ให้อยู่กลางเหมือน Poster
               ----------------------------------------- */

            if (
                pdfScale <= 1
            ) {

                resetPdfZoom(
                    pages
                );

            }

        },
        {
            passive:
                false
        }
    );


    /* =================================================
       TOUCH CANCEL
 
       กันนิ้วหลุด / Safari ยกเลิก Gesture
       แล้ว State ค้าง
       ================================================= */

    viewer.addEventListener(
        "touchcancel",
        function () {

            pdfPinchDistance =
                0;


            pdfDragX =
                0;


            pdfDragY =
                0;

        },
        {
            passive:
                false
        }
    );

}

/* =====================================================
   PDF.JS LOADER FOR iPAD ABSTRACT
   ===================================================== */

const PDFJS_FALLBACK_VERSION =
    "3.11.174";


function setupPdfJsWorker(
    lib
) {

    if (
        !lib ||
        !lib.GlobalWorkerOptions
    ) {

        return;

    }


    if (
        lib.GlobalWorkerOptions.workerSrc
    ) {

        return;

    }


    lib.GlobalWorkerOptions.workerSrc =
        "./assets/js/pdf.worker.min.js?v=" +
        DEV_VERSION;

}


async function ensurePdfJsForIPad() {

    if (
        window.pdfjsLib
    ) {

        setupPdfJsWorker(
            window.pdfjsLib
        );


        return true;

    }


    if (
        window.__pdfJsLoadingPromise
    ) {

        return window.__pdfJsLoadingPromise;

    }


    window.__pdfJsLoadingPromise =
        new Promise(
            function (
                resolve
            ) {

                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    "./assets/js/pdf.min.js?v=" +
                    DEV_VERSION;


                script.async =
                    true;


                script.onload =
                    function () {

                        if (
                            window.pdfjsLib
                        ) {

                            setupPdfJsWorker(
                                window.pdfjsLib
                            );


                            resolve(
                                true
                            );


                            return;

                        }


                        resolve(
                            false
                        );

                    };


                script.onerror =
                    function () {

                        resolve(
                            false
                        );

                    };


                document.head.appendChild(
                    script
                );

            }
        );


    return window.__pdfJsLoadingPromise;

}

/* =====================================================
   PDF FILE CACHE
   เก็บ PDF ที่โหลดแล้วไว้ใน Memory
   ===================================================== */

const PDF_CACHE_LIMIT =
    3;


const pdfFileCache =
    new Map();


function setPdfCache(
    key,
    arrayBuffer
) {

    if (
        !key ||
        !arrayBuffer
    ) {

        return;

    }


    /*
     * ถ้ามีไฟล์นี้อยู่แล้ว
     * ลบก่อนแล้วใส่ใหม่
     * เพื่อเลื่อนไปเป็นไฟล์ล่าสุด
     */

    if (
        pdfFileCache.has(
            key
        )
    ) {

        pdfFileCache.delete(
            key
        );

    }


    pdfFileCache.set(
        key,
        arrayBuffer
    );


    /*
     * เก็บใน Memory สูงสุด 3 ไฟล์
     */

    while (
        pdfFileCache.size >
        PDF_CACHE_LIMIT
    ) {

        const oldestKey =
            pdfFileCache.keys()
                .next()
                .value;


        pdfFileCache.delete(
            oldestKey
        );

    }

}

/* =====================================================
LOAD PDF INTO MEMORY CACHE

โหลด PDF ไว้ล่วงหน้า
เมื่อกดเปิดจะไม่ต้องรอ Download ใหม่
===================================================== */

async function cachePdfFile(
    url
) {

    if (
        !url
    ) {

        return;

    }


    try {

        const fileUrl =
            new URL(
                String(
                    url
                ).trim(),
                window.location.href
            ).href;


        /* มีอยู่แล้ว ไม่ต้องโหลดซ้ำ */

        if (
            pdfFileCache.has(
                fileUrl
            )
        ) {

            return;

        }


        const response =
            await fetch(
                fileUrl,
                {
                    method:
                        "GET",

                    cache:
                        "force-cache"
                }
            );


        if (
            !response.ok
        ) {

            return;

        }


        const arrayBuffer =
            await response.arrayBuffer();


        if (
            !arrayBuffer ||
            arrayBuffer.byteLength === 0
        ) {

            return;

        }


        setPdfCache(
            fileUrl,
            arrayBuffer
        );


        console.log(
            "PDF PRELOADED TO CACHE =",
            fileUrl
        );

    }
    catch (
    error
    ) {

        /*
         * preload พลาดไม่ทำให้หน้าเว็บพัง
         * ตอนกดเปิด renderPdfForIPad()
         * จะลองโหลดอีกครั้งเอง
         */

        console.warn(
            "PDF PRELOAD FAILED =",
            url,
            error
        );

    }

}

/* =====================================================
   LOCAL PDF CANVAS VIEWER — FAST FIRST PAGE

   หลักการ:
   1. โหลด PDF
   2. Render หน้า 1 ก่อน
   3. แสดงให้กรรมการดูทันที
   4. หน้า 2 เป็นต้นไปค่อย Render เบื้องหลัง

   ใช้ได้ทั้ง Abstract + Poster
   ===================================================== */

async function renderPdfForIPad(
    source
) {

    const viewer =
        document.getElementById(
            "workFilePdfViewer"
        );


    const pages =
        document.getElementById(
            "workFilePdfPages"
        );


    if (
        !viewer ||
        !pages
    ) {

        return false;

    }


    const pdfJsReady =
        await ensurePdfJsForIPad();


    if (
        !pdfJsReady ||
        !window.pdfjsLib
    ) {

        throw new Error(
            "ไม่สามารถโหลด PDF Viewer ได้"
        );

    }


    if (
        !source ||
        !source.url
    ) {

        throw new Error(
            "ไม่พบที่อยู่ไฟล์ PDF"
        );

    }


    try {

        /* =============================================
           RESET
           ============================================= */

        pages.innerHTML =
            "";


        viewer.scrollTop =
            0;


        viewer.scrollLeft =
            0;


        /* =============================================
           URL
           ============================================= */

        const fileUrl =
            new URL(
                String(
                    source.url
                ).trim(),
                window.location.href
            );


        /*
         * ใช้ Token ป้องกันไฟล์เก่า
         * Render แทรกเข้ามาหลังเปลี่ยนไฟล์
         */

        const renderToken =
            String(
                Date.now()
            ) +
            "-" +
            Math.random();


        viewer.dataset.pdfRenderToken =
            renderToken;


        console.log(
            "LOCAL PDF FETCH =",
            fileUrl.href
        );


        /* =============================================
           MEMORY CACHE
           ============================================= */

        let arrayBuffer =
            pdfFileCache.get(
                fileUrl.href
            );


        if (
            !arrayBuffer
        ) {

            const response =
                await fetch(
                    fileUrl.href,
                    {
                        method:
                            "GET",

                        cache:
                            "force-cache"
                    }
                );


            console.log(
                "PDF RESPONSE =",
                response.status,
                response.url
            );


            if (
                !response.ok
            ) {

                throw new Error(
                    "หาไฟล์ PDF ไม่เจอ" +
                    " | HTTP " +
                    response.status
                );

            }


            arrayBuffer =
                await response.arrayBuffer();


            if (
                !arrayBuffer ||
                arrayBuffer.byteLength === 0
            ) {

                throw new Error(
                    "ไฟล์ PDF ว่างเปล่า"
                );

            }


            setPdfCache(
                fileUrl.href,
                arrayBuffer
            );


            console.log(
                "PDF STORED IN CACHE =",
                fileUrl.href
            );

        }
        else {

            console.log(
                "PDF FROM CACHE =",
                fileUrl.href
            );

        }


        /* =============================================
           PDF.JS
           ============================================= */

        const loadingTask =
            window.pdfjsLib.getDocument({

                data:
                    new Uint8Array(
                        arrayBuffer
                    )

            });


        const pdfDocument =
            await loadingTask.promise;


        /* =============================================
           Render Scale
           ============================================= */

        const isIPadDevice =
            /iPad|Macintosh/.test(
                navigator.userAgent
            ) &&
            navigator.maxTouchPoints > 1;


        const renderScale =
            isIPadDevice
                ? 1.25
                : 2;


        /* =============================================
           ฟังก์ชัน Render ทีละหน้า
           ============================================= */

        async function renderPage(
            pageNumber
        ) {

            /*
             * ถ้ามีการเปิด PDF ตัวใหม่แล้ว
             * หยุด Render ตัวเก่าทันที
             */

            if (
                viewer.dataset.pdfRenderToken !==
                renderToken
            ) {

                return false;

            }


            const page =
                await pdfDocument.getPage(
                    pageNumber
                );


            if (
                viewer.dataset.pdfRenderToken !==
                renderToken
            ) {

                return false;

            }


            const viewport =
                page.getViewport({

                    scale:
                        renderScale

                });


            const canvas =
                document.createElement(
                    "canvas"
                );


            canvas.className =
                "work-file-pdf-page";


            canvas.width =
                Math.floor(
                    viewport.width
                );


            canvas.height =
                Math.floor(
                    viewport.height
                );


            const context =
                canvas.getContext(
                    "2d",
                    {
                        alpha:
                            false
                    }
                );


            pages.appendChild(
                canvas
            );


            await page.render({

                canvasContext:
                    context,

                viewport:
                    viewport

            }).promise;


            return true;

        }


        /* =============================================
           หน้า 1 — Render ก่อนทันที
           ============================================= */

        const firstPageReady =
            await renderPage(
                1
            );


        if (
            !firstPageReady
        ) {

            return false;

        }


        /* =============================================
           เปิด Viewer ทันทีหลังหน้าแรกเสร็จ
           ============================================= */

        viewer.hidden =
            false;


        viewer.scrollTop =
            0;


        viewer.scrollLeft =
            0;


        requestAnimationFrame(
            function () {

                viewer.scrollTop =
                    0;


                viewer.scrollLeft =
                    0;

            }
        );


        console.log(
            "PDF FIRST PAGE READY"
        );


        /* =============================================
           หน้า 2 เป็นต้นไป
           Render เบื้องหลัง

           ไม่ await ตรงนี้
           เพื่อให้ Popup แสดงหน้าแรกได้ทันที
           ============================================= */

        if (
            pdfDocument.numPages > 1
        ) {

            (
                async function () {

                    for (
                        let pageNumber = 2;
                        pageNumber <= pdfDocument.numPages;
                        pageNumber++
                    ) {

                        /*
                         * ถ้าปิด / เปิดไฟล์อื่น
                         * หยุดงานเก่า
                         */

                        if (
                            viewer.dataset.pdfRenderToken !==
                            renderToken
                        ) {

                            return;

                        }


                        const rendered =
                            await renderPage(
                                pageNumber
                            );


                        if (
                            !rendered
                        ) {

                            return;

                        }


                        /*
                         * คืนเวลาให้ Safari
                         * ไม่ให้ Render รัวจน UI ค้าง
                         */

                        await new Promise(
                            function (
                                resolve
                            ) {

                                requestAnimationFrame(
                                    resolve
                                );

                            }
                        );

                    }


                    console.log(
                        "PDF ALL PAGES READY =",
                        pdfDocument.numPages
                    );

                }
            )();

        }


        /*
         * สำคัญ:
         * Return ตั้งแต่หน้าแรกพร้อม
         * openWorkFileModal จะซ่อน Loading ได้เลย
         */

        return true;

    }
    catch (
    error
    ) {

        console.error(
            "LOCAL PDF ERROR =",
            error
        );


        pages.innerHTML =
            "";


        throw new Error(
            error &&
                error.message
                ? error.message
                : "ไม่สามารถโหลด PDF ได้"
        );

    }

}

/* =====================================================
   LOCK NATIVE PINCH ZOOM INSIDE FILE POPUP
 
   หน้าที่:
   - ห้าม Safari ซูมทั้งหน้า / ทั้ง popup
   - custom zoom ของ Poster / PDF ยังทำงานได้
   ===================================================== */

function setupWorkFileModalZoomLock(
    modal
) {

    if (
        !modal ||
        modal.dataset.zoomLockReady
    ) {

        return;

    }


    modal.dataset.zoomLockReady =
        "true";


    /* =================================================
       Safari gesture events
       กัน Browser Page Zoom
       ================================================= */

    modal.addEventListener(
        "gesturestart",
        function (
            event
        ) {

            event.preventDefault();

        },
        {
            passive:
                false
        }
    );


    modal.addEventListener(
        "gesturechange",
        function (
            event
        ) {

            event.preventDefault();

        },
        {
            passive:
                false
        }
    );


    modal.addEventListener(
        "gestureend",
        function (
            event
        ) {

            event.preventDefault();

        },
        {
            passive:
                false
        }
    );


    /* =================================================
       Touch Pinch
 
       ถ้ามีมากกว่า 1 นิ้ว
       ห้าม Safari เอา gesture ไป Zoom หน้าเว็บ
 
       แต่ event ยังเดินผ่านระบบ custom zoom
       ของ Poster / PDF ตามปกติ
       ================================================= */

    modal.addEventListener(
        "touchmove",
        function (
            event
        ) {

            if (
                event.touches &&
                event.touches.length > 1
            ) {

                event.preventDefault();

            }

        },
        {
            passive:
                false
        }
    );

}

function hideWorkFileEmpty(
    empty
) {

    if (!empty) {
        return;
    }


    empty.hidden =
        true;


    empty.style.display =
        "none";

}


function showWorkFileEmpty(
    empty,
    message
) {

    if (!empty) {
        return;
    }


    empty.textContent =
        message ||
        "ยังไม่มีไฟล์สำหรับผลงานนี้";


    empty.hidden =
        false;


    empty.style.display =
        "flex";

}

/* =====================================================
   OPEN WORK FILE MODAL
   Local PDF Only
   - Abstract = PDF หลายหน้า
   - Poster   = PDF
   ===================================================== */

async function openWorkFileModal(
    work,
    type
) {

    /* =================================================
       ELEMENTS
       ================================================= */

    const modal =
        document.getElementById(
            "workFileModal"
        );


    const title =
        document.getElementById(
            "workFileModalTitle"
        );


    const pdf =
        document.getElementById(
            "workFilePdf"
        );


    const pdfViewer =
        document.getElementById(
            "workFilePdfViewer"
        );


    const pdfPages =
        document.getElementById(
            "workFilePdfPages"
        );


    const poster =
        document.getElementById(
            "workFilePoster"
        );


    const empty =
        document.getElementById(
            "workFileModalEmpty"
        );


    const loading =
        document.getElementById(
            "workFileLoading"
        );


    const score =
        document.getElementById(
            "workFileScore"
        );


    if (
        !modal ||
        !title ||
        !pdf ||
        !pdfViewer ||
        !pdfPages ||
        !poster ||
        !empty ||
        !loading ||
        !score
    ) {

        console.error(
            "WORK FILE MODAL: ไม่พบ Element ที่จำเป็น"
        );


        return;

    }


    /* =================================================
       SETUP
       ================================================= */

    setupWorkFileModalZoomLock(
        modal
    );


    setupPdfZoom(
        pdfViewer,
        pdfPages,
        modal
    );


    /* =================================================
       RESET
       ================================================= */

    resetPdfZoom(
        pdfPages
    );

    pdfViewer.scrollTop =
        0;


    pdfViewer.scrollLeft =
        0;


    pdf.hidden =
        true;


    pdf.src =
        "";


    poster.hidden =
        true;


    poster.src =
        "";


    pdfViewer.hidden =
        true;


    pdfPages.innerHTML =
        "";


    hideWorkFileEmpty(
        empty
    );


    loading.hidden =
        false;


    /* =================================================
       TITLE
       ================================================= */

    title.textContent =
        type === "poster"
            ? "ดูโปสเตอร์"
            : "ดูบทคัดย่อ";


    /* =================================================
       OPEN MODAL
       ================================================= */

    modal.hidden =
        false;


    document.body.classList.add(
        "work-file-modal-open"
    );


    /* =================================================
       SCORE BUTTON
       ================================================= */

    score.onclick =
        function () {

            selectWork(
                work
            );

        };


    /* =================================================
   หา Google Drive File ID จาก works.json
   ================================================= */

    let driveFileId =
        "";


    /* -----------------------------------------------
       บทคัดย่อ
       ----------------------------------------------- */

    if (
        type === "abstract"
    ) {

        driveFileId =
            String(
                work &&
                    work.abstract_file_id
                    ? work.abstract_file_id
                    : ""
            ).trim();

    }


    /* -----------------------------------------------
       โปสเตอร์
       ----------------------------------------------- */

    else if (
        type === "poster"
    ) {

        driveFileId =
            String(
                work &&
                    work.poster_file_id
                    ? work.poster_file_id
                    : ""
            ).trim();

    }


    /* -----------------------------------------------
       ไม่มีไฟล์
       ----------------------------------------------- */

    if (
        !driveFileId
    ) {

        loading.hidden =
            true;


        showWorkFileEmpty(
            empty
        );


        return;

    }


    /* =================================================
       Google Drive Preview URL
       ================================================= */

    const fileUrl =
        "https://drive.google.com/file/d/" +
        encodeURIComponent(
            driveFileId
        ) +
        "/preview";


    /* -----------------------------------------------
       ไม่มีไฟล์
       ----------------------------------------------- */

    if (
        !fileUrl
    ) {

        loading.hidden =
            true;


        showWorkFileEmpty(
            empty
        );


        return;

    }

    /* =================================================
   GOOGLE DRIVE PREVIEW
   ใช้ iframe เดิมสำหรับแสดงทั้งบทคัดย่อและโปสเตอร์
   ================================================= */

    try {

        /* ซ่อนตัว viewer เก่า */

        pdfViewer.hidden =
            true;


        pdfPages.innerHTML =
            "";


        poster.hidden =
            true;


        poster.src =
            "";


        /* ใช้ iframe เดิม */

        pdf.hidden =
            false;


        pdf.onload =
            function () {

                loading.hidden =
                    true;

            };


        pdf.onerror =
            function () {

                loading.hidden =
                    true;


                pdf.hidden =
                    true;


                showWorkFileEmpty(
                    empty,
                    "โหลดไฟล์จาก Google Drive ไม่สำเร็จ"
                );

            };


        pdf.src =
            fileUrl;


        return;

    }
    catch (
    error
    ) {

        console.error(
            "Google Drive Preview Error:",
            error
        );


        loading.hidden =
            true;


        pdf.hidden =
            true;


        pdfViewer.hidden =
            true;


        poster.hidden =
            true;


        showWorkFileEmpty(
            empty,
            "โหลดไฟล์ไม่สำเร็จ"
        );

    }

}

/* =====================================================
   WORK FILE POPUP — CLOSE
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const modal =
            document.getElementById(
                "workFileModal"
            );

        const closeButton =
            document.getElementById(
                "workFileModalClose"
            );

        if (!modal) {
            return;
        }


        function closeWorkFileModal() {

            modal.hidden = true;

            modal.classList.remove(
                "is-ipad-fullscreen"
            );

            const pdf =
                document.getElementById(
                    "workFilePdf"
                );

            const poster =
                document.getElementById(
                    "workFilePoster"
                );

            resetPosterZoom(
                poster
            );

            const pdfViewer =
                document.getElementById(
                    "workFilePdfViewer"
                );


            const pdfPages =
                document.getElementById(
                    "workFilePdfPages"
                );


            resetPdfZoom(
                pdfPages
            );


            if (
                pdfViewer
            ) {

                pdfViewer.scrollTop =
                    0;


                pdfViewer.scrollLeft =
                    0;


                pdfViewer.hidden =
                    true;

            }


            if (
                pdfPages
            ) {

                pdfPages.innerHTML =
                    "";

            }

            if (pdf) {
                pdf.src = "";
            }

            if (poster) {
                poster.src = "";
            }

            document.body.classList.remove(
                "work-file-modal-open"
            );
        }


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeWorkFileModal
            );

        }


        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target.hasAttribute(
                        "data-modal-close"
                    )
                ) {

                    closeWorkFileModal();

                }

            }
        );


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape" &&
                    !modal.hidden
                ) {

                    closeWorkFileModal();

                }

            }
        );

    }
);


/* =====================================================
   CHECK EXISTING SCORES
   ตรวจคะแนนจริงจากชีทก่อนแสดง Category
   ===================================================== */

async function checkExistingScores(
    judgeId,
    works
) {

    /* -----------------------------------------------
       ตรวจข้อมูลเบื้องต้น
       ----------------------------------------------- */

    if (
        !Array.isArray(works) ||
        works.length === 0
    ) {

        return Array.isArray(works)
            ? works
            : [];

    }


    judgeId =
        String(
            judgeId || ""
        ).trim();


    /* -----------------------------------------------
       ตั้งค่าเริ่มต้น
       ----------------------------------------------- */

    works.forEach(
        function (work) {

            if (work) {

                work.hasSubmitted =
                    false;

            }

        }
    );


    if (!judgeId) {

        console.warn(
            "ไม่พบรหัสกรรมการสำหรับตรวจสอบคะแนน"
        );

        return works;

    }


    /* -----------------------------------------------
       Timeout
       ----------------------------------------------- */

    const controller =
        new AbortController();


    const timeout =
        setTimeout(
            function () {

                controller.abort();

            },
            12000
        );


    try {

        /* -----------------------------------------------
           โหลดสถานะคะแนนจาก GAS
           ----------------------------------------------- */

        const response =
            await fetch(
                GAS_URL +
                "?action=scoreStatusByJudge" +
                "&judge=" +
                encodeURIComponent(
                    judgeId
                ) +
                "&_t=" +
                Date.now(),
                {
                    method:
                        "GET",

                    cache:
                        "no-store",

                    signal:
                        controller.signal
                }
            );


        if (!response.ok) {

            throw new Error(
                "โหลดสถานะคะแนนไม่สำเร็จ"
            );

        }


        const result =
            await response.json();


        console.log(
            "SCORE STATUS RESULT =",
            result
        );


        /* -----------------------------------------------
           ตรวจ Response
           ----------------------------------------------- */

        if (
            !result ||
            result.success === false
        ) {

            throw new Error(
                result &&
                    result.message
                    ? result.message
                    : "โหลดสถานะคะแนนไม่สำเร็จ"
            );

        }


        /* -----------------------------------------------
           รายการผลงานที่ลงคะแนนแล้ว
           ----------------------------------------------- */

        const submittedSet =
            new Set(

                Array.isArray(
                    result.work_ids
                )
                    ? result.work_ids
                        .map(
                            function (id) {

                                return String(
                                    id
                                ).trim();

                            }
                        )
                        .filter(
                            Boolean
                        )
                    : []

            );


        /* -----------------------------------------------
           ใส่สถานะลงใน Works
           ----------------------------------------------- */

        works.forEach(
            function (work) {

                if (!work) {

                    return;

                }


                const workId =
                    String(
                        work.id ||
                        work.work_id ||
                        ""
                    ).trim();


                work.hasSubmitted =
                    submittedSet.has(
                        workId
                    );

            }
        );


        console.log(
            "SUBMITTED WORK IDS =",
            Array.from(
                submittedSet
            )
        );


        console.log(
            "WORKS AFTER SCORE CHECK =",
            works
        );


        return works;

    }
    catch (
    error
    ) {

        /* -----------------------------------------------
           สำคัญมาก
 
           เช็กคะแนนไม่ได้
           ห้ามทำให้ Category พัง
           ----------------------------------------------- */

        if (
            error &&
            error.name === "AbortError"
        ) {

            console.warn(
                "ตรวจสถานะคะแนน Timeout"
            );

        }
        else {

            console.warn(
                "ตรวจสถานะคะแนนไม่ได้:",
                error
            );

        }


        /*
         * คืน Works กลับไป
         * เพื่อให้หน้า Category แสดงต่อได้
         */

        return works;

    }
    finally {

        clearTimeout(
            timeout
        );

    }

}

/* =====================================================
   iPAD — LOCK PAGE ZOOM
   ห้ามซูมหน้าเว็บ
   ยกเว้นตอนดูไฟล์ Full View
   ===================================================== */

(function () {

    function allowFileZoom() {

        const modal =
            document.getElementById(
                "workFileModal"
            );


        return (
            modal &&
            modal.classList.contains(
                "is-ipad-fullscreen"
            )
        );

    }


    /* -----------------------------------------
       Safari Gesture Zoom
       ----------------------------------------- */

    document.addEventListener(
        "gesturestart",
        function (event) {

            if (
                !allowFileZoom()
            ) {

                event.preventDefault();

            }

        },
        {
            passive: false
        }
    );


    document.addEventListener(
        "gesturechange",
        function (event) {

            if (
                !allowFileZoom()
            ) {

                event.preventDefault();

            }

        },
        {
            passive: false
        }
    );


    document.addEventListener(
        "gestureend",
        function (event) {

            if (
                !allowFileZoom()
            ) {

                event.preventDefault();

            }

        },
        {
            passive: false
        }
    );


    /* -----------------------------------------
       กัน Pinch จาก Touch โดยตรง
       ----------------------------------------- */

    document.addEventListener(
        "touchmove",
        function (event) {

            if (
                event.touches.length > 1 &&
                !allowFileZoom()
            ) {

                event.preventDefault();

            }

        },
        {
            passive: false
        }
    );

})();