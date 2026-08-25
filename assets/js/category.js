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
    "https://script.google.com/macros/s/AKfycbzak_-7CxO6BvJ4GW-n5O9BvpbPGME-PQXdfoFlU-VHHHcsTKUsEEEDEq06zaqmZ-3BPw/exec";


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
           ----------------------------------------------- */

        const works =
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
           8. เรียงตาม order
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
                    ) -
                    Number(
                        b.order ||
                        0
                    )
                );

            }

        );


        /* -----------------------------------------------
           9. ตรวจคะแนนจริงจากชีท

           สำคัญ:
           รอตรงนี้ให้เสร็จก่อน
           ยังไม่แสดงรายการ
           ยังไม่ซ่อนตัววิ่ง
           ----------------------------------------------- */

        await refreshScoreButtons(
            works
        );


        /* -----------------------------------------------
           10. เก็บ Works หลังมีสถานะคะแนนแล้ว
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
           11. เก็บข้อมูล Login
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
           12. แสดงทุกอย่างพร้อมกัน
           ----------------------------------------------- */

        displayWorks(
            works
        );


        displayWorkCount(
            works.length
        );


        displayEvaluatedCount();


        /* -----------------------------------------------
           13. ข้อมูลทุกอย่างพร้อมแล้ว
           ค่อยซ่อนตัววิ่ง
           ----------------------------------------------- */

        hideCategoryLoading();


        console.log(
            "กรรมการ =",
            judge.name
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


        hideCategoryLoading();


        showCategoryError(
            error.message
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
   POSTER ZOOM
   รองรับ iPad pinch + mouse wheel
   ===================================================== */

let posterScale =
    1;


let posterStartDistance =
    0;


let posterStartScale =
    1;


function resetPosterZoom(
    poster
) {

    posterScale =
        1;


    if (poster) {

        poster.style.transform =
            "scale(1)";

    }

}


function getTouchDistance(
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

/* =================================================
   WORK FILE POPUP
   ================================================= */

function openWorkFileModal(
    work,
    type
) {

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

    const fullscreen =
        document.getElementById(
            "workFileFullscreen"
        );


    if (
        !modal ||
        !title ||
        !pdf ||
        !poster ||
        !empty ||
        !loading
    ) {
        return;
    }


    /* =================================================
       POSTER ZOOM EVENTS
       ================================================= */

    if (
        poster &&
        !poster.dataset.zoomReady
    ) {

        poster.dataset.zoomReady =
            "true";


        /* Mouse wheel zoom */

        poster.addEventListener(
            "wheel",
            function (event) {

                if (
                    document.fullscreenElement !== poster
                ) {
                    return;
                }


                event.preventDefault();


                const delta =
                    event.deltaY < 0
                        ? 0.12
                        : -0.12;


                posterScale =
                    Math.min(
                        4,
                        Math.max(
                            1,
                            posterScale + delta
                        )
                    );


                poster.style.transform =
                    "scale(" +
                    posterScale +
                    ")";

            },
            {
                passive: false
            }
        );


        /* iPad — เริ่ม pinch */

        poster.addEventListener(
            "touchstart",
            function (event) {

                if (
                    document.fullscreenElement !== poster
                ) {
                    return;
                }


                if (
                    event.touches.length === 2
                ) {

                    posterStartDistance =
                        getTouchDistance(
                            event.touches
                        );


                    posterStartScale =
                        posterScale;

                }

            },
            {
                passive: false
            }
        );


        /* iPad — pinch zoom */

        poster.addEventListener(
            "touchmove",
            function (event) {

                if (
                    document.fullscreenElement !== poster
                ) {
                    return;
                }


                if (
                    event.touches.length !== 2
                ) {
                    return;
                }


                event.preventDefault();


                const currentDistance =
                    getTouchDistance(
                        event.touches
                    );


                if (
                    !posterStartDistance
                ) {
                    return;
                }


                const ratio =
                    currentDistance /
                    posterStartDistance;


                posterScale =
                    Math.min(
                        4,
                        Math.max(
                            1,
                            posterStartScale * ratio
                        )
                    );


                poster.style.transform =
                    "scale(" +
                    posterScale +
                    ")";

            },
            {
                passive: false
            }
        );

    }


    /* -----------------------------------------
       Reset
       ----------------------------------------- */


    /* -----------------------------------------
       Reset
       ----------------------------------------- */

    pdf.hidden = true;
    poster.hidden = true;
    empty.hidden = true;

    /* เปิด Spinner รอไว้ทันที */
    loading.hidden = false;

    pdf.src = "";
    poster.src = "";

    fullscreen.hidden = true;


    /* -----------------------------------------
       Title
       ----------------------------------------- */

    title.textContent =
        type === "poster"
            ? "ดูโปสเตอร์"
            : "ดูบทคัดย่อ";


    /* -----------------------------------------
   PDF
   ----------------------------------------- */

    if (
        type === "abstract" &&
        work.pdf_url
    ) {

        const pdfUrl =
            String(
                work.pdf_url
            ).trim();


        let previewUrl =
            pdfUrl;


        const driveMatch =
            pdfUrl.match(
                /\/file\/d\/([^/]+)/
            );


        if (
            driveMatch &&
            driveMatch[1]
        ) {

            previewUrl =
                "https://drive.google.com/file/d/" +
                driveMatch[1] +
                "/preview";

        }


        /*
 * ต้องเปิดพื้นที่ iframe ก่อนโหลด
 * เพื่อให้ iPad Safari / Google Drive Viewer
 * คำนวณขนาดตั้งแต่แรกได้ถูกต้อง
 */

        pdf.hidden =
            false;


        pdf.onload =
            function () {

                loading.hidden =
                    true;

            };


        pdf.src =
            previewUrl;


        fullscreen.hidden =
            false;

    }


    /* -----------------------------------------
   Poster
   ----------------------------------------- */

    else if (
        type === "poster" &&
        work.poster_url
    ) {

        const posterUrl =
            String(
                work.poster_url
            ).trim();


        let imageUrl =
            posterUrl;


        /*
         * Google Drive
         * แปลงลิงก์แชร์เป็นลิงก์รูปโดยตรง
         */

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


        poster.src =
            imageUrl;


        fullscreen.hidden =
            false;
    }


    /* -----------------------------------------
       No file
       ----------------------------------------- */

    else {

        empty.hidden = false;

    }


    /* -----------------------------------------
       Score
       ----------------------------------------- */

    score.onclick =
        function () {

            selectWork(
                work
            );

        };


    /* -----------------------------------------
       Fullscreen
       ----------------------------------------- */

    fullscreen.onclick =
        function () {

            const isIPad =
                /iPad|Macintosh/.test(
                    navigator.userAgent
                ) &&
                navigator.maxTouchPoints > 1;


            /* =========================================
               iPad
               เปิดไฟล์จริงในแท็บใหม่
               Safari จะ pinch zoom ได้ตามปกติ
               ========================================= */

            if (
                isIPad
            ) {

                if (
                    type === "abstract"
                ) {

                    window.open(
                        pdf.src,
                        "_blank"
                    );

                }
                else {

                    window.open(
                        poster.src,
                        "_blank"
                    );

                }


                return;

            }


            /* =========================================
               Desktop
               ใช้ Fullscreen เดิม
               ========================================= */

            const target =
                type === "abstract"
                    ? pdf
                    : poster;


            if (
                type === "poster"
            ) {

                resetPosterZoom(
                    poster
                );

            }


            if (
                target.requestFullscreen
            ) {

                target.requestFullscreen();

            }

        };


    /* -----------------------------------------
       เปิด Popup
       ----------------------------------------- */

    modal.hidden =
        false;


    document.body.classList.add(
        "work-file-modal-open"
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

            const pdf =
                document.getElementById(
                    "workFilePdf"
                );

            const poster =
                document.getElementById(
                    "workFilePoster"
                );

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


/* -----------------------------------------------
   12. แสดงจำนวนที่ประเมินแล้ว
   ----------------------------------------------- */

displayEvaluatedCount();


/* -----------------------------------------------
   13. ทุกอย่างพร้อมแล้ว
   ซ่อนตัววิ่ง
   ----------------------------------------------- */

hideCategoryLoading();

preloadWorkFiles(
    works
);


console.log(
    "กรรมการ =",
    judge.name
);


console.log(
    "ผลงานที่ได้รับมอบหมาย =",
    works.length
);

/* =====================================================
   REFRESH SCORE STATUS
   ตรวจคะแนนจริงจาก Google Sheet
   ===================================================== */

async function refreshScoreButtons(
    works
) {

    if (
        !Array.isArray(
            works
        )
    ) {

        return;

    }


    /* -----------------------------------------------
       อ่านกรรมการปัจจุบัน
       ----------------------------------------------- */

    const raw =
        sessionStorage.getItem(
            "judge"
        );


    if (!raw) {

        console.warn(
            "REFRESH SCORE: ไม่พบข้อมูลกรรมการ"
        );

        return;

    }


    let judgeId =
        "";


    try {

        const data =
            JSON.parse(
                raw
            );


        const judge =
            data &&
                data.judge
                ? data.judge
                : data;


        judgeId =
            String(
                judge.id ||
                judge.judge_id ||
                judge.code ||
                ""
            ).trim();

    }
    catch (
    error
    ) {

        console.warn(
            "REFRESH SCORE: อ่านข้อมูลกรรมการไม่ได้",
            error
        );

        return;

    }


    if (!judgeId) {

        console.warn(
            "REFRESH SCORE: ไม่พบรหัสกรรมการ"
        );

        return;

    }


    /* -----------------------------------------------
       ตรวจคะแนนทุกผลงาน
       ----------------------------------------------- */

    await Promise.all(

        works.map(

            async function (
                work
            ) {

                const workId =
                    String(
                        work.id ||
                        work.work_id ||
                        ""
                    ).trim();


                if (!workId) {

                    work.hasSubmitted =
                        false;

                    return;

                }


                try {

                    const response =
                        await fetch(
                            GAS_URL +
                            "?action=getScoreForEdit" +
                            "&judge=" +
                            encodeURIComponent(
                                judgeId
                            ) +
                            "&work_id=" +
                            encodeURIComponent(
                                workId
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

                        work.hasSubmitted =
                            false;

                        return;

                    }


                    const result =
                        await response.json();


                    let score =
                        null;


                    if (
                        result &&
                        result.success === false
                    ) {

                        score =
                            null;

                    }
                    else if (
                        result &&
                        result.data
                    ) {

                        score =
                            result.data;

                    }
                    else if (
                        result &&
                        result.score
                    ) {

                        score =
                            result.score;

                    }
                    else if (
                        result &&
                        (
                            result.c1 !== undefined ||
                            result.c2 !== undefined ||
                            result.c3 !== undefined ||
                            result.c4 !== undefined ||
                            result.c5 !== undefined ||
                            result.c6 !== undefined ||
                            result.c7 !== undefined ||
                            result.c8 !== undefined
                        )
                    ) {

                        score =
                            result;

                    }


                    /* -----------------------------------
                       ต้องมีคะแนนจริงอย่างน้อย 1 ช่อง
                       ----------------------------------- */

                    let hasRealScore =
                        false;


                    if (
                        score &&
                        typeof score ===
                        "object"
                    ) {

                        for (
                            let i = 1;
                            i <= 8;
                            i++
                        ) {

                            const value =
                                score[
                                "c" +
                                i
                                ];


                            if (
                                value !== undefined &&
                                value !== null &&
                                value !== ""
                            ) {

                                hasRealScore =
                                    true;

                                break;

                            }

                        }

                    }


                    work.hasSubmitted =
                        hasRealScore;

                }
                catch (
                error
                ) {

                    console.warn(
                        "ตรวจคะแนนไม่ได้:",
                        workId,
                        error
                    );


                    work.hasSubmitted =
                        false;

                }

            }

        )

    );


    /* -----------------------------------------------
       เก็บสถานะล่าสุด
       ----------------------------------------------- */

    sessionStorage.setItem(
        "works",
        JSON.stringify(
            works
        )
    );

}

document.addEventListener(
    "fullscreenchange",
    function () {

        const poster =
            document.getElementById(
                "workFilePoster"
            );


        if (
            !document.fullscreenElement
        ) {

            resetPosterZoom(
                poster
            );

        }

    }
);