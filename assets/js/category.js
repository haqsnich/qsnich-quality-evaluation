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
    "https://script.google.com/macros/s/AKfycbyBy3Op76Yt6JJUH__YM-cgJi8KxKHPlcgW0eg0-Zkr_qLsjbUshT1VwAAAGY5Hg6WT/exec";


/* =====================================================
   เมื่อหน้าโหลด
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        showCategoryLoading();

        loadCategoryData();

    }
);

function showCategoryLoading() {

    const loading =
        document.getElementById(
            "categoryLoading"
        );

    if (!loading) {
        return;
    }

    loading.hidden = false;

}

function hideCategoryLoading() {

    const loading =
        document.getElementById(
            "categoryLoading"
        );

    if (!loading) {
        return;
    }

    loading.classList.add("hide");

}


/* =====================================================
   โหลดข้อมูล Category
   ===================================================== */

async function loadCategoryData() {

    try {

        /* -----------------------------------------------
           1. อ่านข้อมูลกรรมการจาก Session
           ----------------------------------------------- */

        const storedJudge =
            sessionStorage.getItem("judge");


        if (!storedJudge) {

            throw new Error(
                "ไม่พบข้อมูลกรรมการ กรุณาเข้าสู่ระบบใหม่"
            );

        }


        const loginData =
            JSON.parse(storedJudge);


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
           2. แสดงชื่อกรรมการทันที
           ----------------------------------------------- */

        displayJudge(
            judge
        );


        /* -----------------------------------------------
           3. โหลดผลงานจาก GAS โดยตรง
           ----------------------------------------------- */

        const response =
            await fetch(
                GAS_URL +
                "?action=works"
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

        let allWorks = [];


        if (
            Array.isArray(result)
        ) {

            allWorks =
                result;

        }
        else if (
            Array.isArray(result.works)
        ) {

            allWorks =
                result.works;

        }
        else if (
            Array.isArray(result.data)
        ) {

            allWorks =
                result.data;

        }


        /* -----------------------------------------------
           6. กรองผลงานตามกรรมการ
           ----------------------------------------------- */

        const judgeId =
            String(
                judge.id
            ).trim();


        const works =
            allWorks.filter(
                function (work) {

                    /* -----------------------------------------
                       ตรวจ active
                       ----------------------------------------- */

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


                    /* -----------------------------------------
                       ตรวจ judge_ids
                       ----------------------------------------- */

                    const judgeIds =
                        String(
                            work.judge_ids || ""
                        )
                            .split(",")
                            .map(
                                function (id) {

                                    return String(
                                        id
                                    ).trim();

                                }
                            )
                            .filter(Boolean);


                    return judgeIds.includes(
                        judgeId
                    );

                }
            );


        /* -----------------------------------------------
           7. เรียงตาม order
           ----------------------------------------------- */

        works.sort(
            function (a, b) {

                return (
                    Number(
                        a.order || 0
                    ) -
                    Number(
                        b.order || 0
                    )
                );

            }
        );


        /* -----------------------------------------------
           8. แสดงจำนวน
           ----------------------------------------------- */

        displayWorkCount(
            works.length
        );


        /* -----------------------------------------------
           9. แสดงผลงาน
           ----------------------------------------------- */

        displayWorks(
            works
        );

        hideCategoryLoading();


        /* -----------------------------------------------
           10. เก็บไว้ใช้หน้าต่อไป
           ----------------------------------------------- */

        sessionStorage.setItem(
            "works",
            JSON.stringify(
                works
            )
        );


        /* -----------------------------------------------
           11. เก็บข้อมูล Login แบบอัปเดต
           ----------------------------------------------- */

        const updatedSession = {

            success: true,

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


        console.log(
            "กรรมการ =",
            judge.name
        );


        console.log(
            "ผลงานที่ได้รับมอบหมาย =",
            works.length
        );


    }
    catch (error) {

        console.error(
            "Category Error =",
            error
        );


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
        work.order ||
        index + 1;


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
    String(work.presenter || "");

presenter.innerHTML = `
    <span class="presenter-desktop">
        ${presenterText}
    </span>

    <span class="presenter-ipad-portrait">
        ${presenterText.replace(/,\s*/g, "<br>")}
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
       ACTIONS
       ================================================= */

    const actionArea =
        document.createElement(
            "div"
        );

    actionArea.className =
        "work-actions";


    /* =================================================
       กำหนดหมวดที่มีโปสเตอร์
       ================================================= */

    const posterCategories = [

        "CQI Poster Presentation",

        "CQI Digital Poster presentation",

        "KM"

    ];


    const currentCategory =
        String(
            work.category ||
            ""
        ).trim();


    const hasPoster =
        posterCategories.includes(
            currentCategory
        );


    /* =================================================
       ปุ่มดูบทคัดย่อ
       มีทุกหมวด
       ================================================= */

    const abstractButton =
        document.createElement(
            "button"
        );

    abstractButton.type =
        "button";

    abstractButton.className =
        "work-file-button";

    abstractButton.innerHTML =
        "📄 ดูบทคัดย่อ";


    abstractButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            if (
                work.pdf_url
            ) {

                window.open(
                    work.pdf_url,
                    "_blank"
                );

            }

        }
    );


    actionArea.appendChild(
        abstractButton
    );


    /* =================================================
       ปุ่มดูโปสเตอร์
       เฉพาะ 3 หมวด
       ================================================= */

    if (
        hasPoster
    ) {

        const posterButton =
            document.createElement(
                "button"
            );

        posterButton.type =
            "button";

        posterButton.className =
            "work-file-button";

        posterButton.innerHTML =
            "🖼️ ดูโปสเตอร์";


        posterButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                if (
                    work.poster_url
                ) {

                    window.open(
                        work.poster_url,
                        "_blank"
                    );

                }

            }
        );


        actionArea.appendChild(
            posterButton
        );

    }


    /* =================================================
       ปุ่มลงคะแนน
       ================================================= */

    const voteButton =
        document.createElement(
            "button"
        );

    voteButton.type =
        "button";

    voteButton.className =
        "work-button";

    voteButton.innerHTML =
        "📝 ลงคะแนน";


    voteButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            selectWork(
                work
            );

        }
    );


    actionArea.appendChild(
        voteButton
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
   ===================================================== */

function selectWork(
    work
) {

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
       ตอนนี้ยังไม่เปลี่ยนหน้า
       เดี๋ยวเราทำ Evaluation ต่อ
    */

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


    const title =
        document.createElement(
            "div"
        );


    title.className =
        "category-error-title";


    title.textContent =
        "ไม่สามารถโหลดข้อมูลได้";


    const text =
        document.createElement(
            "div"
        );


    text.className =
        "category-error-message";


    text.textContent =
        message ||
        "เกิดข้อผิดพลาด";


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

                /* -----------------------------------------
                   ล้างข้อมูลกรรมการทั้งหมด
                   ----------------------------------------- */

                sessionStorage.removeItem(
                    "judge"
                );

                sessionStorage.removeItem(
                    "works"
                );

                sessionStorage.removeItem(
                    "criteria"
                );

                sessionStorage.removeItem(
                    "selectedWork"
                );


                /* -----------------------------------------
                   กลับหน้า Login
                   ----------------------------------------- */

                window.location.href =
                    "./index.html";

            }
        );

    }
);