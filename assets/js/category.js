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
         * แสดงตัววิ่งทุกครั้ง
         */

        showCategoryLoading();


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

    const loading =
        document.getElementById(
            "categoryLoading"
        );


    if (!loading) {
        return;
    }


    loading.classList.add(
        "hide"
    );


    /*
     * รอให้ตัววิ่งเริ่มหายก่อน
     * แล้วค่อยให้เนื้อหาเลื่อนขึ้น
     */

    const workList =
        document.getElementById(
            "workList"
        );


    if (!workList) {
        return;
    }


    /*
     * เอา animation เดิมออกก่อน
     * กันกรณีเรียกฟังก์ชันซ้ำ
     */

    workList.classList.remove(
        "content-enter"
    );


    /*
     * บังคับให้ Browser วาดรอบใหม่
     * ก่อนเริ่ม Animation
     */

    void workList.offsetWidth;


    /*
     * รอให้ตัววิ่งเริ่มยุบ
     * แล้วค่อยปล่อย Content ขึ้นมา
     */

    setTimeout(
        function () {

            workList.classList.add(
                "content-enter"
            );

        },
        600
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
           3. โหลดผลงานจาก GAS
           ----------------------------------------------- */

        const response =
            await fetch(
                GAS_URL +
                "?action=works&_t=" +
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
                "ไม่สามารถเชื่อมต่อระบบข้อมูลผลงานได้"
            );

        }


        const result =
            await response.json();


        console.log(
            "WORKS API RESULT =",
            result
        );


        /* -----------------------------------------------
           4. ตรวจ Response
           ----------------------------------------------- */

        if (
            !result ||
            result.success === false
        ) {

            throw new Error(
                result &&
                    result.message
                    ? result.message
                    : "ไม่สามารถโหลดผลงานได้"
            );

        }


        /* -----------------------------------------------
           5. ดึง Array ผลงาน
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
            Array.isArray(
                result.works
            )
        ) {

            allWorks =
                result.works;

        }
        else if (
            Array.isArray(
                result.data
            )
        ) {

            allWorks =
                result.data;

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
           9. ตรวจคะแนนจริงจากชีท

           ต้องรอให้ตรวจเสร็จก่อน
           จึงค่อยแสดงรายการผลงาน

           เพื่อป้องกัน:
           - สถานะประเมินแล้วขึ้นช้า
           - หน้าเว็บกระพริบ
           - จำนวนประเมินแล้วคลาดเคลื่อน
           ----------------------------------------------- */

        works =
            await checkExistingScores(
                judgeId,
                works
            );


        /* -----------------------------------------------
           9.1 ตรวจผลลัพธ์จาก checkExistingScores

           ป้องกันกรณีฟังก์ชันไม่ได้ return Array
           ----------------------------------------------- */

        if (
            !Array.isArray(
                works
            )
        ) {

            throw new Error(
                "ไม่สามารถตรวจสอบสถานะคะแนนได้"
            );

        }


        /* -----------------------------------------------
           10. เก็บ Works หลังตรวจสถานะคะแนนแล้ว
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
           11. อัปเดตข้อมูล Login ใน Session

           ให้ข้อมูล works ใน judge session
           เป็นชุดเดียวกับที่ตรวจคะแนนแล้ว
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
           12. ข้อมูลพร้อมแล้ว
           ค่อยแสดงทุกอย่างพร้อมกัน
           ----------------------------------------------- */

        displayWorks(
            works
        );


        displayWorkCount(
            works.length
        );


        displayEvaluatedCount();


        /* -----------------------------------------------
           13. ทุกอย่างเสร็จแล้ว
           ค่อยซ่อน Loading
           ----------------------------------------------- */

        hideCategoryLoading();


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
            "WORKS AFTER SCORE CHECK =",
            works
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


        hideCategoryLoading();


        showCategoryError(
            error.message ||
            "เกิดข้อผิดพลาดในการโหลดข้อมูล"
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
   PRELOAD WORK FILES
   โหลดไฟล์รอเบื้องหลัง
   ===================================================== */

function preloadWorkFiles(
    works
) {

    if (
        !Array.isArray(works) ||
        works.length === 0
    ) {

        return;

    }


    /*
     * รอให้หน้า Category แสดงเสร็จก่อน
     * ไม่แย่งเน็ตตอนกำลังโหลดรายชื่อ/คะแนน
     */

    setTimeout(
        function () {

            works.forEach(
                function (
                    work
                ) {

                    /* =========================================
                       PRELOAD POSTER
                       ========================================= */

                    if (
                        work.poster_url
                    ) {

                        const posterUrl =
                            String(
                                work.poster_url
                            ).trim();


                        const driveMatch =
                            posterUrl.match(
                                /\/file\/d\/([^/]+)/
                            );


                        let imageUrl =
                            posterUrl;


                        if (
                            driveMatch &&
                            driveMatch[1]
                        ) {

                            imageUrl =
                                "https://drive.google.com/thumbnail?id=" +
                                driveMatch[1] +
                                "&sz=w2000";

                        }


                        const image =
                            new Image();


                        image.src =
                            imageUrl;

                    }


                    /* =========================================
                       PRELOAD PDF
                       ========================================= */

                    if (
                        work.pdf_url
                    ) {

                        const pdfUrl =
                            String(
                                work.pdf_url
                            ).trim();


                        const driveMatch =
                            pdfUrl.match(
                                /\/file\/d\/([^/]+)/
                            );


                        let previewUrl =
                            pdfUrl;


                        if (
                            driveMatch &&
                            driveMatch[1]
                        ) {

                            previewUrl =
                                "https://drive.google.com/file/d/" +
                                driveMatch[1] +
                                "/preview";

                        }


                        const link =
                            document.createElement(
                                "link"
                            );


                        link.rel =
                            "prefetch";


                        link.href =
                            previewUrl;


                        document.head.appendChild(
                            link
                        );

                    }

                }
            );

        },
        1200
    );

}

/* =====================================================
   PDF ZOOM + PAN
   Adapt จากระบบ Poster โดยตรง
   iPad pinch zoom + drag
   ===================================================== */

let pdfScale = 1;

let pdfTranslateX = 0;
let pdfTranslateY = 0;

let pdfPinchDistance = 0;
let pdfPinchMidX = 0;
let pdfPinchMidY = 0;

let pdfDragX = 0;
let pdfDragY = 0;


/* -----------------------------------------
   Apply Transform
   ----------------------------------------- */

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

}


/* -----------------------------------------
   Reset
   ----------------------------------------- */

function resetPdfZoom(
    pages
) {

    pdfScale = 1;

    pdfTranslateX = 0;
    pdfTranslateY = 0;

    pdfPinchDistance = 0;
    pdfPinchMidX = 0;
    pdfPinchMidY = 0;

    pdfDragX = 0;
    pdfDragY = 0;


    if (pages) {

        pages.style.transform =
            "translate3d(0, 0, 0) scale(1)";

    }

}


/* -----------------------------------------
   Zoom ตรงตำแหน่งนิ้ว
   Adapt จาก Poster
   ----------------------------------------- */

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


    /* =================================================
       กลับมาที่ 1x
       = ภาพรวมตรงกลาง
       ================================================= */

    if (
        newScale <= 1
    ) {

        resetPdfZoom(
            pages
        );


        return;

    }


    /* =================================================
       ตำแหน่ง PDF ปัจจุบัน
       ================================================= */

    const rect =
        pages.getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;


    const centerY =
        rect.top +
        rect.height / 2;


    /*
     * ตำแหน่งนิ้วเทียบกับกลาง PDF
     */

    const offsetX =
        pointX -
        centerX;


    const offsetY =
        pointY -
        centerY;


    /*
     * อัตราการเปลี่ยน Scale
     */

    const scaleRatio =
        newScale /
        oldScale;


    /*
     * ชดเชยตำแหน่ง
     * เพื่อให้ขยายจากบริเวณระหว่างสองนิ้ว
     */

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
   SETUP PDF ZOOM EVENTS
   Adapt จาก Poster
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
       อนุญาต Zoom เฉพาะตอน
       - Popup เปิดอยู่
       - PDF Viewer กำลังแสดงจริง
       ================================================= */

    function canZoom() {

        return (
            !modal.hidden &&
            !viewer.hidden
        );

    }


    /* =================================================
       iPAD — TOUCH START
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
               2 นิ้ว = เริ่ม Pinch Zoom
               ----------------------------------------- */

            if (
                event.touches.length === 2
            ) {

                event.preventDefault();


                pdfPinchDistance =
                    getTouchDistance(
                        event.touches
                    );


                const midpoint =
                    getTouchMidpoint(
                        event.touches
                    );


                pdfPinchMidX =
                    midpoint.x;


                pdfPinchMidY =
                    midpoint.y;


                return;

            }


            /* -----------------------------------------
               1 นิ้ว = เริ่มลาก
               แต่ลากได้เมื่อ Zoom > 1
               ----------------------------------------- */

            if (
                event.touches.length === 1 &&
                pdfScale > 1
            ) {

                event.preventDefault();


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
       iPAD — TOUCH MOVE
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


                const newDistance =
                    getTouchDistance(
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
                    getTouchMidpoint(
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


                pdfPinchMidX =
                    midpoint.x;


                pdfPinchMidY =
                    midpoint.y;


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


            /*
             * ถ้าหุบกลับถึง 1x
             * ให้ PDF กลับตรงกลาง
             */

            if (
                pdfScale <= 1
            ) {

                resetPdfZoom(
                    pages
                );

            }

        }
    );

}

/* =====================================================
   iPad PDF CANVAS VIEWER
   Render ทุกหน้า
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
        !pages ||
        !window.pdfjsLib
    ) {

        return false;

    }


    try {

        pages.innerHTML =
            "";


        let loadingTask;


        /*
         * Google Drive
         * ให้ GAS ดึงไฟล์แทน
         */

        if (
            source &&
            source.fileId
        ) {

            const response =
                await fetch(
                    GAS_URL +
                    "?action=pdfFile" +
                    "&file_id=" +
                    encodeURIComponent(
                        source.fileId
                    ) +
                    "&_t=" +
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
                    "โหลด PDF จากระบบไม่สำเร็จ"
                );

            }


            const result =
                await response.json();


            if (
                !result ||
                result.success === false ||
                !result.base64
            ) {

                throw new Error(
                    result?.message ||
                    "ไม่พบข้อมูล PDF"
                );

            }


            const binary =
                atob(
                    result.base64
                );


            const bytes =
                new Uint8Array(
                    binary.length
                );


            for (
                let i = 0;
                i < binary.length;
                i++
            ) {

                bytes[i] =
                    binary.charCodeAt(
                        i
                    );

            }


            loadingTask =
                window.pdfjsLib.getDocument({

                    data:
                        bytes

                });

        }
        else if (
            source &&
            source.url
        ) {

            loadingTask =
                window.pdfjsLib.getDocument(
                    source.url
                );

        }
        else {

            return false;

        }


        const pdfDocument =
            await loadingTask.promise;


        for (
            let pageNumber = 1;
            pageNumber <= pdfDocument.numPages;
            pageNumber++
        ) {

            const page =
                await pdfDocument.getPage(
                    pageNumber
                );


            const viewport =
                page.getViewport({

                    scale: 2

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
                    "2d"
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

        }


        viewer.hidden =
            false;


        return true;

    }
    catch (error) {

        console.error(
            "PDF Canvas Error:",
            error
        );


        pages.innerHTML =
            "";


        return false;

    }

}

/* =====================================================
   PDF ZOOM + PAN
   iPad pinch zoom + drag
   ===================================================== */

let pdfScale = 1;

let pdfTranslateX = 0;
let pdfTranslateY = 0;

let pdfPinchDistance = 0;
let pdfPinchMidX = 0;
let pdfPinchMidY = 0;

let pdfDragX = 0;
let pdfDragY = 0;


/* -----------------------------------------
   Apply Transform
   ----------------------------------------- */

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

}


/* -----------------------------------------
   Reset
   ----------------------------------------- */

function resetPdfZoom(
    pages
) {

    pdfScale = 1;

    pdfTranslateX = 0;
    pdfTranslateY = 0;

    pdfPinchDistance = 0;
    pdfPinchMidX = 0;
    pdfPinchMidY = 0;

    pdfDragX = 0;
    pdfDragY = 0;


    if (pages) {

        pages.style.transform =
            "translate3d(0, 0, 0) scale(1)";

    }

}


/* -----------------------------------------
   ซูมตรงตำแหน่งนิ้ว
   ----------------------------------------- */

function zoomPdfAtPoint(
    pages,
    newScale,
    pointX,
    pointY
) {

    if (!pages) {
        return;
    }


    newScale =
        Math.min(
            5,
            Math.max(
                1,
                newScale
            )
        );


    if (
        newScale <= 1
    ) {

        pdfScale = 1;

        pdfTranslateX = 0;
        pdfTranslateY = 0;


        applyPdfTransform(
            pages
        );


        return;

    }


    const rect =
        pages.getBoundingClientRect();


    const imageX =
        (
            pointX -
            rect.left
        ) /
        pdfScale;


    const imageY =
        (
            pointY -
            rect.top
        ) /
        pdfScale;


    const baseLeft =
        rect.left -
        pdfTranslateX;


    const baseTop =
        rect.top -
        pdfTranslateY;


    pdfTranslateX =
        pointX -
        baseLeft -
        (
            imageX *
            newScale
        );


    pdfTranslateY =
        pointY -
        baseTop -
        (
            imageY *
            newScale
        );


    pdfScale =
        newScale;


    applyPdfTransform(
        pages
    );

}


/* =====================================================
   SETUP PDF ZOOM EVENTS
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
       อนุญาต Zoom เฉพาะตอน
       - Popup เปิดอยู่
       - PDF Viewer กำลังแสดงจริง
       ================================================= */

    function canZoom() {

        return (
            !modal.hidden &&
            !viewer.hidden
        );

    }


    /* =================================================
       iPAD — TOUCH START
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


                pdfPinchDistance =
                    getTouchDistance(
                        event.touches
                    );


                const midpoint =
                    getTouchMidpoint(
                        event.touches
                    );


                pdfPinchMidX =
                    midpoint.x;


                pdfPinchMidY =
                    midpoint.y;


                return;

            }


            /* -----------------------------------------
               1 นิ้ว = เตรียมลาก
               เมื่อ PDF ถูก Zoom แล้ว
               ----------------------------------------- */

            if (
                event.touches.length === 1 &&
                pdfScale > 1
            ) {

                event.preventDefault();


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
       iPAD — TOUCH MOVE
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


                const newDistance =
                    getTouchDistance(
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
                    getTouchMidpoint(
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


                pdfPinchMidX =
                    midpoint.x;


                pdfPinchMidY =
                    midpoint.y;


                return;

            }


            /* -----------------------------------------
               1 นิ้ว = ลาก PDF
               ----------------------------------------- */

            if (
                event.touches.length === 1 &&
                pdfScale > 1
            ) {

                event.preventDefault();


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


            /*
             * หุบกลับจนถึง 1x
             * ให้ PDF กลับมาตรงกลาง
             */

            if (
                pdfScale <= 1
            ) {

                resetPdfZoom(
                    pages
                );

            }

        }
    );

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


    /* =================================================
       CHECK
       ================================================= */

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
       DEVICE
       ================================================= */

    const isIPad =
        /iPad|Macintosh/.test(
            navigator.userAgent
        ) &&
        navigator.maxTouchPoints > 1;


    /* =================================================
       เตรียมระบบ Gesture

       สำคัญ:
       Lock native Safari zoom ก่อน
       แล้วค่อยให้ custom viewer จัดการไฟล์
       ================================================= */

    setupWorkFileModalZoomLock(
        modal
    );


    setupPosterZoom(
        poster,
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

    resetPosterZoom(
        poster
    );


    resetPdfZoom(
        pdfPages
    );


    pdf.hidden =
        true;


    pdfViewer.hidden =
        true;


    poster.hidden =
        true;


    hideWorkFileEmpty(
        empty
    );


    loading.hidden =
        false;


    pdfPages.innerHTML =
        "";


    /* =================================================
   CLEAR OLD FILE EVENTS

   สำคัญ:
   ป้องกัน onload / onerror ของไฟล์รอบก่อน
   ทำงานข้ามมาทับไฟล์รอบใหม่
   ================================================= */

    pdf.onload =
        null;


    pdf.onerror =
        null;


    poster.onload =
        null;


    poster.onerror =
        null;


    /* -----------------------------------------------
       ล้าง Source เก่า
       หลังจากล้าง Event แล้วเท่านั้น
       ----------------------------------------------- */

    pdf.src =
        "";


    poster.src =
        "";


    /* =================================================
       TITLE
       ================================================= */

    title.textContent =
        type === "poster"
            ? "ดูโปสเตอร์"
            : "ดูบทคัดย่อ";


    /* =================================================
       เปิด Popup ก่อน
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
       ABSTRACT
       ================================================= */

    if (
        type === "abstract" &&
        work.pdf_url
    ) {

        const pdfUrl =
            String(
                work.pdf_url
            ).trim();


        const driveMatch =
            pdfUrl.match(
                /\/file\/d\/([^/]+)/
            );


        /* =================================================
   iPAD
   ใช้ PDF.js Canvas Viewer เท่านั้น

   ห้าม fallback ไป Google Drive iframe
   เพราะจะกลับมาคุม pinch ไม่ได้
   ================================================= */

        if (
            isIPad
        ) {

            /* =================================================
               iPAD ABSTRACT
        
               1. ลองใช้ PDF.js ก่อน
               2. ถ้า PDF.js ไม่สำเร็จ
                  fallback ไป Google Drive Preview
        
               ไม่เกี่ยวกับระบบ Poster
               ================================================= */

            pdf.hidden =
                true;


            pdf.src =
                "";


            pdfViewer.hidden =
                true;


            pdfPages.innerHTML =
                "";


            let rendered =
                false;


            /* -----------------------------------------------
               ลอง PDF.js ก่อน
               ----------------------------------------------- */

            try {

                if (
                    driveMatch &&
                    driveMatch[1]
                ) {

                    rendered =
                        await renderPdfForIPad({

                            fileId:
                                driveMatch[1]

                        });

                }
                else {

                    rendered =
                        await renderPdfForIPad({

                            url:
                                pdfUrl

                        });

                }

            }
            catch (
            error
            ) {

                console.warn(
                    "iPad PDF.js ไม่สำเร็จ:",
                    error
                );


                rendered =
                    false;

            }


            /* -----------------------------------------------
               PDF.js สำเร็จ
               ----------------------------------------------- */

            if (
                rendered
            ) {

                loading.hidden =
                    true;


                pdfViewer.hidden =
                    false;


                pdf.hidden =
                    true;


                resetPdfZoom(
                    pdfPages
                );


                return;

            }


            /* =================================================
            PDF.js ไม่สำเร็จ

   iPad ห้ามใช้ iframe
   เพราะจะควบคุม pinch zoom ไม่ได้
                ================================================= */

            loading.hidden =
                true;


            pdfViewer.hidden =
                true;


            pdf.hidden =
                true;


            showWorkFileEmpty(
                empty,
                "ไม่สามารถโหลดบทคัดย่อได้ กรุณาลองใหม่อีกครั้ง"
            );


            return;

        }

        /* =================================================
           DESKTOP
           ใช้ Google Drive Preview ได้เหมือนเดิม
           ================================================= */

        let previewUrl =
            pdfUrl;


        if (
            driveMatch &&
            driveMatch[1]
        ) {

            previewUrl =
                "https://drive.google.com/file/d/" +
                driveMatch[1] +
                "/preview";

        }


        pdf.hidden =
            false;


        pdfViewer.hidden =
            true;


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
                    empty
                );
            };


        pdf.src =
            previewUrl;


        return;

    }


    /* =================================================
       POSTER
       ================================================= */

    if (
        type === "poster" &&
        work.poster_url
    ) {

        const posterUrl =
            String(
                work.poster_url
            ).trim();


        let imageUrl =
            posterUrl;


        const driveMatch =
            posterUrl.match(
                /\/file\/d\/([^/]+)/
            );


        if (
            driveMatch &&
            driveMatch[1]
        ) {

            imageUrl =
                "https://drive.google.com/thumbnail?id=" +
                driveMatch[1] +
                "&sz=w2000";

        }


        poster.onload =
            function () {

                loading.hidden =
                    true;


                poster.hidden =
                    false;

            };


        poster.onerror =
            function () {

                loading.hidden =
                    true;


                poster.hidden =
                    true;


                showWorkFileEmpty(
                    empty
                );

            };


        poster.src =
            imageUrl;


        return;

    }


    /* =================================================
       EMPTY
       ================================================= */

    loading.hidden =
        true;


    showWorkFileEmpty(
        empty
    );

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