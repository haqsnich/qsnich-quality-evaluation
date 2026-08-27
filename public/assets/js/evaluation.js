/* =====================================================
   EVALUATION PAGE
   ระบบประเมินผลงาน V2
   ===================================================== */

let selectedWork = null;
let criteria = [];
let draftSaveTimer = null;

const GAS_URL =
    APP_CONFIG.API_URL;



/* =====================================================
   LOAD SELECTED WORK
   ===================================================== */

function loadSelectedWork() {

    const possibleKeys = [
        "selectedWork",
        "work",
        "selected_work",
        "currentWork",
        "current_work",
        "evaluationWork"
    ];


    for (
        let i = 0;
        i < possibleKeys.length;
        i++
    ) {

        const key =
            possibleKeys[i];


        const raw =
            sessionStorage.getItem(
                key
            );


        if (!raw) {
            continue;
        }


        try {

            const data =
                JSON.parse(
                    raw
                );


            if (data) {

                selectedWork =
                    data;


                console.log(
                    "Selected work:",
                    selectedWork
                );


                break;

            }

        } catch (error) {

            console.warn(
                "อ่านข้อมูลผลงานไม่ได้:",
                key,
                error
            );

        }

    }


    if (!selectedWork) {

        console.error(
            "ไม่พบข้อมูลผลงาน"
        );


        showEmptyWork();

        return;

    }


    displayWork();

}


/* =====================================================
   DISPLAY WORK
   ===================================================== */

function displayWork() {

    if (!selectedWork) {
        return;
    }


    const workId =
        document.getElementById(
            "evaluationWorkId"
        );


    const category =
        document.getElementById(
            "evaluationCategory"
        );


    const title =
        document.getElementById(
            "evaluationWorkTitle"
        );


    const presenter =
        document.getElementById(
            "evaluationPresenter"
        );


    const department =
        document.getElementById(
            "evaluationDepartment"
        );


    if (workId) {

        workId.textContent =
            selectedWork.id ||
            selectedWork.work_id ||
            "-";

    }


    if (category) {

        category.textContent =
            selectedWork.category ||
            "-";

    }


    if (title) {

        title.textContent =
            selectedWork.title ||
            selectedWork.work_title ||
            "-";

    }


    if (presenter) {

        presenter.textContent =
            selectedWork.presenter ||
            selectedWork.presenter_name ||
            "-";

    }


    if (department) {

        department.textContent =
            selectedWork.department ||
            selectedWork.unit ||
            "-";

    }

}


/* =====================================================
   EMPTY WORK
   ===================================================== */

function showEmptyWork() {

    const workId =
        document.getElementById(
            "evaluationWorkId"
        );


    const category =
        document.getElementById(
            "evaluationCategory"
        );


    const title =
        document.getElementById(
            "evaluationWorkTitle"
        );


    const presenter =
        document.getElementById(
            "evaluationPresenter"
        );


    const department =
        document.getElementById(
            "evaluationDepartment"
        );


    if (workId) {
        workId.textContent = "-";
    }


    if (category) {
        category.textContent = "-";
    }


    if (title) {
        title.textContent = "ไม่พบข้อมูลผลงาน";
    }


    if (presenter) {
        presenter.textContent = "-";
    }


    if (department) {
        department.textContent = "-";
    }

}


/* =====================================================
   โหลดข้อมูล Category
   โหลดข้อมูลใหม่ทุกครั้ง
   ไม่ใช้ Cache
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


        /*
         * รองรับทั้ง
         *
         * {
         *     judge: {...}
         * }
         *
         * และ
         *
         * {...}
         */

        const judge =
            loginData &&
                loginData.judge
                ? loginData.judge
                : loginData;


        if (!judge) {

            throw new Error(
                "ข้อมูลกรรมการไม่ถูกต้อง"
            );

        }


        /* -----------------------------------------------
           2. หา ID กรรมการ
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


        console.log(
            "CATEGORY JUDGE =",
            judge
        );


        console.log(
            "CATEGORY JUDGE ID =",
            judgeId
        );


        /* -----------------------------------------------
           3. แสดงชื่อกรรมการ
           ----------------------------------------------- */

        displayJudge(
            judge
        );


        /* -----------------------------------------------
           4. โหลดผลงานจาก GAS
           ไม่ใช้ Cache
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
           5. ตรวจ Response
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
           6. ดึง Array ผลงาน
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


        console.log(
            "จำนวนผลงานทั้งหมดจาก GAS =",
            allWorks.length
        );


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


                    /* -----------------------------------
                       ตรวจ Active
                       ----------------------------------- */

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


                    /* -----------------------------------
                       รองรับ judge_ids
                       ----------------------------------- */

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


        console.log(
            "จำนวนผลงานของกรรมการ =",
            works.length
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
           9. เช็กคะแนนจริงจากชีท
           ก่อนแสดงรายการ
           ----------------------------------------------- */

        await refreshScoreButtons(
            works
        );


        /* -----------------------------------------------
           10. เก็บ Works ล่าสุด
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
           11. แสดงรายการ
           หลังคะแนนพร้อมแล้ว
           ----------------------------------------------- */

        displayWorks(
            works
        );


        /* -----------------------------------------------
           12. แสดงจำนวนผลงาน
           ----------------------------------------------- */

        displayWorkCount(
            works.length
        );


        /* -----------------------------------------------
           13. แสดงจำนวนประเมินแล้ว
           พร้อมกับรายการ
           ----------------------------------------------- */

        displayEvaluatedCount();


        /* -----------------------------------------------
           14. อัปเดตข้อมูล Session
           โดยไม่ทำข้อมูลกรรมการหาย
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
           15. ทุกอย่างพร้อมแล้ว
           ซ่อนตัววิ่ง
           ----------------------------------------------- */

        hideCategoryLoading();


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
   CURRENT JUDGE
   อ่านข้อมูลกรรมการจาก Session
   ===================================================== */

function getCurrentJudge() {

    const raw =
        sessionStorage.getItem(
            "judge"
        );


    if (!raw) {

        console.warn(
            "ไม่พบข้อมูลกรรมการใน sessionStorage"
        );

        return null;

    }


    try {

        const data =
            JSON.parse(
                raw
            );


        /*
         * รองรับรูปแบบ
         *
         * {
         *     success: true,
         *     judge: {...}
         * }
         */

        if (
            data &&
            data.judge
        ) {

            return data.judge;

        }


        /*
         * รองรับกรณีเก็บ Object
         * กรรมการโดยตรง
         */

        if (
            data &&
            typeof data === "object"
        ) {

            return data;

        }


        console.warn(
            "รูปแบบข้อมูลกรรมการไม่ถูกต้อง:",
            data
        );


        return null;

    }
    catch (
    error
    ) {

        console.warn(
            "อ่านข้อมูลกรรมการไม่ได้:",
            error
        );


        return null;

    }

}

/* =====================================================
   DISPLAY JUDGE
   ===================================================== */

function displayJudge() {

    const element =
        document.getElementById(
            "judgeName"
        );


    if (!element) {
        return;
    }


    const judge =
        getCurrentJudge();


    if (!judge) {

        element.textContent =
            "-";

        return;

    }


    const name =
        judge.name ||
        judge.judge_name ||
        judge.fullName ||
        judge.full_name ||
        judge.displayName ||
        judge.display_name ||
        judge.id ||
        "-";


    element.textContent =
        name;

}


/* =====================================================
   LOAD CRITERIA
   โหลดเกณฑ์จาก GAS ทุกครั้ง
   ไม่ใช้ Criteria Cache
   ===================================================== */

async function loadCriteria() {

    const container =
        document.getElementById(
            "criteriaContainer"
        );


    if (!container) {
        return;
    }


    /*
     * แสดงตัววิ่ง
     * ห้ามแสดงเกณฑ์เก่าจาก Cache
     */

    container.innerHTML = `
        <div class="evaluation-loading">
            กำลังโหลดเกณฑ์การประเมิน...
        </div>
    `;


    try {

        const response =
            await fetch(
                GAS_URL +
                "?action=criteria&_t=" +
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
                "โหลดเกณฑ์ไม่สำเร็จ"
            );

        }


        const result =
            await response.json();


        if (
            !result ||
            result.success === false
        ) {

            throw new Error(
                result?.message ||
                "ไม่สามารถโหลดเกณฑ์การประเมินได้"
            );

        }


        /*
         * รองรับ Response หลายรูปแบบ
         */

        const allCriteria =
            result.criteria ||
            result.data ||
            result;


        if (
            !Array.isArray(
                allCriteria
            )
        ) {

            throw new Error(
                "รูปแบบข้อมูลเกณฑ์ไม่ถูกต้อง"
            );

        }


        /*
         * กรองเฉพาะหมวดของผลงานนี้
         */

        criteria =
            allCriteria.filter(
                function (
                    item
                ) {

                    return (
                        String(
                            item.category ||
                            ""
                        ).trim()
                        ===
                        String(
                            selectedWork.category ||
                            ""
                        ).trim()
                    );

                }
            );


        console.log(
            "CRITERIA โหลดจาก GAS =",
            criteria
        );


        /*
         * แสดงเกณฑ์
         */

        renderCriteria();


        /*
         * โหลดคะแนนจริง / Draft
         */

        await loadOldScore();


        /*
         * หลังโหลดทุกอย่างเสร็จ
         * อัปเดตอีกครั้งให้แน่ใจว่า
         * ตัวเลขตรงกับค่าที่อยู่ในช่อง
         */

        updateTotalScore();

        updateCriteriaProgress();


    }
    catch (
    error
    ) {

        console.error(
            "LOAD CRITERIA ERROR =",
            error
        );


        showEvaluationError(
            "ไม่สามารถโหลดเกณฑ์การประเมินได้"
        );

    }

}

/* =====================================================
   LOAD CRITERIA FROM API
   โหลดใหม่ทุกครั้ง
   ไม่ใช้ Cache
   รอ Criteria + คะแนนจริง / Draft ครบ
   แล้วค่อยแสดงพร้อมกัน
   ===================================================== */

async function loadCriteriaFromAPI() {

    const container =
        document.getElementById(
            "criteriaContainer"
        );


    const loading =
        document.getElementById(
            "criteriaLoading"
        );


    try {

        updateCriteriaProgress(
            true
        );

        /* =================================================
           1. เริ่มโหลด
           ================================================= */

        if (loading) {

            loading.style.display =
                "flex";

        }


        /*
         * ซ่อนเกณฑ์ทั้งหมดก่อน
         */

        if (container) {

            container.style.display =
                "none";

            container.style.visibility =
                "hidden";

            /*
             * ล้างเกณฑ์เก่าทิ้งทันที
             * กันภาพเก่ากระพริบขึ้นมา
             */

            container.innerHTML =
                "";

        }


        /*
         * ล้าง Criteria ใน Memory
         * เพื่อไม่ให้ของผลงานก่อนหน้าค้าง
         */

        criteria =
            [];


        /* =================================================
           2. โหลด Criteria ใหม่จาก GAS ทุกครั้ง
           ================================================= */

        const response =
            await fetch(

                GAS_URL +
                "?action=criteria" +
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
                "โหลดเกณฑ์ไม่สำเร็จ"
            );

        }


        const result =
            await response.json();


        console.log(
            "CRITERIA API RESULT =",
            result
        );


        /* =================================================
           3. หา Array Criteria
           ================================================= */

        let allCriteria =
            [];


        if (
            Array.isArray(
                result
            )
        ) {

            allCriteria =
                result;

        }
        else {

            allCriteria =
                result.criteria ||
                result.data ||
                [];

        }


        if (
            !Array.isArray(
                allCriteria
            )
        ) {

            throw new Error(
                "รูปแบบข้อมูลเกณฑ์ไม่ถูกต้อง"
            );

        }


        /* =================================================
           4. กรองตามหมวดผลงาน
           ================================================= */

        criteria =
            allCriteria.filter(

                function (
                    item
                ) {

                    return (

                        String(
                            item.category ||
                            ""
                        ).trim()

                        ===

                        String(
                            selectedWork?.category ||
                            ""
                        ).trim()

                    );

                }

            );


        console.log(
            "WORK CATEGORY =",
            selectedWork?.category
        );


        console.log(
            "FILTERED CRITERIA =",
            criteria
        );


        /*
         * ไม่มี sessionStorage.setItem("criteria", ...)
         * อีกแล้ว
         *
         * หน้า Evaluation จะไม่ Cache Criteria
         */


        /* =================================================
           5. สร้างช่องคะแนน
           แต่ยังซ่อนอยู่
           ================================================= */

        renderCriteria();


        /* =================================================
           6. โหลดคะแนน

           ต้อง await ตรงนี้
           เพื่อให้:
           - คะแนนจากชีท
           หรือ
           - Draft

           ถูกใส่ในช่องให้เสร็จก่อน
           ================================================= */

        await loadOldScore();


        /* =================================================
           7. คำนวณหน้าจอหลังคะแนนพร้อม
           ================================================= */

        updateTotalScore();

        updateCriteriaProgress();


        /* =================================================
           8. ทุกอย่างพร้อมแล้ว
           ค่อยปิดตัววิ่ง
           ================================================= */

        if (loading) {

            loading.style.display =
                "none";

        }


        /* =================================================
           9. ค่อยเปิดเกณฑ์
           ================================================= */

        if (container) {

            container.style.visibility =
                "visible";

            container.style.display =
                "";

        }


        console.log(
            "CRITERIA + SCORE READY"
        );


    }
    catch (
    error
    ) {

        console.error(
            "LOAD CRITERIA ERROR =",
            error
        );


        /*
         * เอาตัววิ่งออกก่อน
         */

        if (loading) {

            loading.style.display =
                "none";

        }


        /*
         * เปิด Container
         * เพื่อให้ Error แสดงได้
         */

        if (container) {

            container.style.visibility =
                "visible";

            container.style.display =
                "";

        }


        showEvaluationError(
            "ไม่สามารถโหลดข้อมูลการประเมินได้"
        );

    }

}

function renderCriteria() {

    const container =
        document.getElementById(
            "criteriaContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (
        !criteria ||
        criteria.length === 0
    ) {

        container.innerHTML = `
            <div class="evaluation-empty">
                ไม่พบเกณฑ์การประเมินสำหรับผลงานนี้
            </div>
        `;

        updateCriteriaProgress();

        updateTotalScore();

        return;

    }


    criteria.forEach(
        function (
            item,
            index
        ) {

            const number =
                item.no ||
                index + 1;


            const maxScore =
                Number(
                    item.max_score
                ) || 0;


            const title =
                item.title ||
                "";


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "evaluation-criterion";


            card.innerHTML = `
                <div class="criterion-number">
                    ข้อ ${escapeHtml(number)}
                </div>

                <div class="criterion-title">
                    ${escapeHtml(title)}
                </div>

                <div class="criterion-score">

                    <input
                        type="text"
                        class="score-input"
                        id="score${index + 1}"
                        data-max="${maxScore}"
                        placeholder="0"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        autocomplete="off"
                        enterkeyhint="next"
                    >

                    <span>
                        / ${maxScore}
                    </span>

                </div>
            `;


            container.appendChild(
                card
            );

        }
    );


    bindScoreInputs();


    updateTotalScore();

    updateCriteriaProgress();

}


function bindScoreInputs() {

    const inputs =
        Array.from(
            document.querySelectorAll(
                ".score-input"
            )
        );


    inputs.forEach(
        function (
            input,
            index
        ) {

            input.addEventListener(
                "input",
                function () {

                    /* -----------------------------------------
                       รับเฉพาะตัวเลข
                       ----------------------------------------- */

                    input.value =
                        String(
                            input.value ||
                            ""
                        ).replace(
                            /[^0-9]/g,
                            ""
                        );


                    /* -----------------------------------------
                       ยังไม่กรอก
                       ----------------------------------------- */

                    if (
                        input.value === ""
                    ) {

                        updateTotalScore();

                        updateCriteriaProgress();

                        saveScoreDraftDebounced();

                        return;

                    }


                    /* -----------------------------------------
                       จำกัดคะแนนไม่ให้เกิน Max
                       ----------------------------------------- */

                    normalizeScoreInput(
                        input
                    );


                    updateTotalScore();

                    updateCriteriaProgress();

                    saveScoreDraftDebounced();


                    /* -----------------------------------------
                       กรอกแล้ว → ไปช่องถัดไปอัตโนมัติ

                       สำหรับคะแนน 0–9
                       เมื่อพิมพ์เลข 1 ตัวจะเลื่อนไปเลย
                       ----------------------------------------- */

                    if (
                        input.value.length >= 1
                    ) {

                        const nextInput =
                            inputs[
                            index + 1
                            ];


                        if (
                            nextInput
                        ) {

                            nextInput.focus();

                            nextInput.select();

                        }
                        else {

                            /* ช่องสุดท้าย
                               ปิดคีย์บอร์ด */

                            input.blur();

                        }

                    }

                }
            );


            input.addEventListener(
                "change",
                function () {

                    normalizeScoreInput(
                        input
                    );


                    updateTotalScore();

                    updateCriteriaProgress();

                    saveScoreDraft();

                }
            );


            /* -----------------------------------------
               กด Enter / Next
               ไปช่องถัดไปด้วย
               ----------------------------------------- */

            input.addEventListener(
                "keydown",
                function (
                    event
                ) {

                    if (
                        event.key !== "Enter"
                    ) {

                        return;

                    }


                    event.preventDefault();


                    const nextInput =
                        inputs[
                        index + 1
                        ];


                    if (
                        nextInput
                    ) {

                        nextInput.focus();

                        nextInput.select();

                    }
                    else {

                        input.blur();

                    }

                }
            );

        }
    );


    const comment =
        document.getElementById(
            "scoreComment"
        );


    if (comment) {

        comment.addEventListener(
            "input",
            function () {

                saveScoreDraftDebounced();

            }
        );

    }

}


/* =====================================================
   NORMALIZE SCORE
   ===================================================== */

function normalizeScoreInput(
    input
) {

    if (!input) {
        return;
    }


    const max =
        Number(
            input.dataset.max
        ) || 0;


    let value =
        Number(
            input.value
        );


    if (
        Number.isNaN(
            value
        )
    ) {

        return;

    }


    if (value < 0) {

        input.value = 0;

        return;

    }


    if (value > max) {

        input.value =
            max;

    }

}


/* =====================================================
   UPDATE TOTAL SCORE
   ===================================================== */

function updateTotalScore() {

    let total = 0;

    let maxTotal = 0;


    document
        .querySelectorAll(
            ".score-input"
        )
        .forEach(
            function (input) {

                const max =
                    Number(
                        input.dataset.max
                    ) || 0;


                let value =
                    Number(
                        input.value
                    ) || 0;


                if (value < 0) {

                    value = 0;

                    input.value = 0;

                }


                if (
                    value > max
                ) {

                    value = max;

                    input.value =
                        max;

                }


                total += value;

                maxTotal += max;

            }
        );


    const totalElement =
        document.getElementById(
            "totalScore"
        );


    const totalMaxElement =
        document.getElementById(
            "totalScoreMax"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (totalMaxElement) {

        totalMaxElement.textContent =
            "/" +
            maxTotal +
            " คะแนน";

    }

}


/* =====================================================
   UPDATE PROGRESS
   ===================================================== */

function updateCriteriaProgress(
    isLoading = false
) {

    const progress =
        document.getElementById(
            "criteriaProgress"
        );


    if (!progress) {
        return;
    }


    /* =================================================
       ระหว่างยังโหลด Criteria

       ห้ามแสดงจำนวนเก่าที่ Hardcode จาก HTML
       เช่น 0/8
       ================================================= */

    if (
        isLoading
    ) {

        progress.textContent =
            "กำลังโหลดเกณฑ์...";


        return;

    }


    /* =================================================
       Criteria ยังไม่มา
       ================================================= */

    if (
        !Array.isArray(
            criteria
        ) ||
        criteria.length === 0
    ) {

        progress.textContent =
            "ประเมินแล้ว 0/0";


        return;

    }


    /* =================================================
       นับจำนวนข้อที่กรอกจริง
       ================================================= */

    const inputs =
        document.querySelectorAll(
            ".score-input"
        );


    let answered =
        0;


    inputs.forEach(
        function (
            input
        ) {

            if (
                input.value !== ""
            ) {

                answered++;

            }

        }
    );


    /* =================================================
       จำนวนข้อทั้งหมดใช้ criteria.length

       ไม่ Hardcode 8 / 12
       ================================================= */

    progress.textContent =
        "ประเมินแล้ว " +
        answered +
        "/" +
        criteria.length;

}


/* =====================================================
   SCORE DRAFT KEY
   แยกตาม กรรมการ + ผลงาน
   ===================================================== */

function getScoreDraftKey(
    judgeId,
    workId
) {

    return (
        "evaluationDraft_" +
        String(
            judgeId || ""
        ).trim() +
        "_" +
        String(
            workId || ""
        ).trim()
    );

}


/* =====================================================
   SAVE DRAFT
   ===================================================== */

function saveScoreDraft() {

    const judge =
        getCurrentJudge();


    if (!judge) {
        return;
    }


    if (!selectedWork) {
        return;
    }


    const judgeId =
        judge.id ||
        judge.judge_id ||
        judge.code ||
        judge.name ||
        "";


    const workId =
        selectedWork.id ||
        selectedWork.work_id ||
        "";


    if (
        !judgeId ||
        !workId
    ) {

        return;

    }


    const draft = {

        judge:
            String(
                judgeId
            ).trim(),

        work_id:
            String(
                workId
            ).trim(),

        comment:
            document.getElementById(
                "scoreComment"
            )?.value || "",

        scores: {},

        savedAt:
            new Date().toISOString()

    };


    /*
     * เก็บตามจำนวนเกณฑ์จริง
     */

    for (
        let i = 0;
        i < criteria.length;
        i++
    ) {

        const input =
            document.getElementById(
                "score" +
                (i + 1)
            );


        if (!input) {
            continue;
        }


        draft.scores[
            "c" +
            (i + 1)
        ] =
            input.value;

    }


    const key =
        getScoreDraftKey(
            judgeId,
            workId
        );


    try {

        localStorage.setItem(
            key,
            JSON.stringify(
                draft
            )
        );


        updateDraftStatus(
            "บันทึกแบบร่างแล้ว",
            draft.savedAt
        );


    } catch (error) {

        console.warn(
            "ไม่สามารถบันทึกแบบร่างได้:",
            error
        );

    }

}


/* =====================================================
   SAVE DRAFT DEBOUNCED
   ===================================================== */

function saveScoreDraftDebounced() {

    clearTimeout(
        draftSaveTimer
    );


    draftSaveTimer =
        setTimeout(
            function () {

                saveScoreDraft();

            },
            300
        );

}


/* =====================================================
   LOAD DRAFT
   ===================================================== */

function loadScoreDraft() {

    const judge =
        getCurrentJudge();


    if (!judge) {
        return false;
    }


    if (!selectedWork) {
        return false;
    }


    const judgeId =
        judge.id ||
        judge.judge_id ||
        judge.code ||
        judge.name ||
        "";


    const workId =
        selectedWork.id ||
        selectedWork.work_id ||
        "";


    if (
        !judgeId ||
        !workId
    ) {

        return false;

    }


    const key =
        getScoreDraftKey(
            judgeId,
            workId
        );


    let raw = null;


    try {

        raw =
            localStorage.getItem(
                key
            );

    } catch (error) {

        console.warn(
            "อ่าน Draft ไม่ได้:",
            error
        );

        return false;

    }


    if (!raw) {

        updateDraftStatus(
            "ยังไม่มีการส่งคะแนน"
        );

        return false;

    }


    let draft;


    try {

        draft =
            JSON.parse(
                raw
            );

    } catch (error) {

        console.warn(
            "Draft ไม่ถูกต้อง:",
            error
        );

        return false;

    }


    /*
     * ตรวจกรรมการ
     */

    if (
        String(
            draft.judge ||
            ""
        ).trim()
        !==
        String(
            judgeId ||
            ""
        ).trim()
    ) {

        return false;

    }


    /*
     * ตรวจผลงาน
     */

    if (
        String(
            draft.work_id ||
            ""
        ).trim()
        !==
        String(
            workId ||
            ""
        ).trim()
    ) {

        return false;

    }


    /*
     * ใส่คะแนนกลับ
     */

    if (draft.scores) {

        Object.keys(
            draft.scores
        ).forEach(
            function (key) {

                const number =
                    key.replace(
                        "c",
                        ""
                    );


                const input =
                    document.getElementById(
                        "score" +
                        number
                    );


                if (input) {

                    input.value =
                        draft.scores[
                        key
                        ];

                }

            }
        );

    }


    /*
     * ใส่ความคิดเห็น
     */

    const comment =
        document.getElementById(
            "scoreComment"
        );


    if (
        comment &&
        typeof draft.comment ===
        "string"
    ) {

        comment.value =
            draft.comment;

    }


    updateTotalScore();

    updateCriteriaProgress();


    updateDraftStatus(
        "บันทึกแบบร่างแล้ว",
        draft.savedAt
    );


    return true;

}


/* =====================================================
   DRAFT STATUS
   แสดงสถานะรวมด้านซ้าย
   ===================================================== */

function updateDraftStatus(
    message,
    savedAt
) {

    const saveStatus =
        document.getElementById(
            "saveStatus"
        );

    const lastSavedTime =
        document.getElementById(
            "lastSavedTime"
        );


    if (!saveStatus) {
        return;
    }


    /* ---------------------------------------------
       แสดงสถานะ Draft
       --------------------------------------------- */

    saveStatus.textContent =
        "🟡 " +
        message;


    saveStatus.dataset.serverScore =
        "false";


    /* ---------------------------------------------
       แสดงเวลาบันทึก Draft
       --------------------------------------------- */

    if (
        lastSavedTime &&
        savedAt
    ) {

        const date =
            new Date(
                savedAt
            );


        lastSavedTime.textContent =
            "บันทึกแบบร่างล่าสุด : " +
            date.toLocaleString(
                "th-TH",
                {
                    dateStyle: "short",
                    timeStyle: "short"
                }
            );

    } else if (lastSavedTime) {

        lastSavedTime.textContent =
            "เมื่อกรอกคะแนนในช่อง คะแนนจะถูกบันทึกเป็นแบบร่างโดยอัตโนมัติ";

    }

}

/* =====================================================
   LOAD OLD SCORE FROM GAS

   กติกา:
   1. มีคะแนนในชีท = ใช้คะแนนชีท
   2. ไม่มีคะแนนในชีท + ยังไม่เคยส่ง = โหลด Draft
   3. ไม่มีคะแนนในชีท + เคยส่งแล้ว = Reset
   ===================================================== */

async function loadOldScore() {

    const judge =
        getCurrentJudge();


    if (
        !judge ||
        !selectedWork
    ) {

        return;

    }


    const judgeId =
        String(
            judge.id ||
            judge.judge_id ||
            judge.code ||
            ""
        ).trim();


    const workId =
        String(
            selectedWork.id ||
            selectedWork.work_id ||
            ""
        ).trim();


    if (
        !judgeId ||
        !workId
    ) {

        return;

    }


    const submittedKey =
        "evaluationSubmitted_" +
        judgeId +
        "_" +
        workId;


    /* =================================================
       อ่านสถานะว่าเคยส่งหรือยัง
       ================================================= */

    let wasSubmitted =
        false;


    try {

        const rawSubmitted =
            localStorage.getItem(
                submittedKey
            );


        if (rawSubmitted) {

            const submittedData =
                JSON.parse(
                    rawSubmitted
                );


            wasSubmitted =
                submittedData &&
                submittedData.submitted === true;

        }

    }
    catch (
    error
    ) {

        console.warn(
            "อ่านสถานะ Submitted ไม่ได้:",
            error
        );

    }


    try {

        /* =================================================
           โหลดคะแนนจริงจากชีท
           ================================================= */

        const url =
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
            Date.now();


        const response =
            await fetch(
                url,
                {
                    method:
                        "GET",

                    cache:
                        "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "OLD SCORE RESULT =",
            result
        );


        /* =================================================
           หา Object คะแนน
           ================================================= */

        let score =
            null;


        if (
            result &&
            result.success !== false
        ) {

            if (
                result.data &&
                typeof result.data ===
                "object"
            ) {

                score =
                    result.data;

            }
            else if (
                result.score &&
                typeof result.score ===
                "object"
            ) {

                score =
                    result.score;

            }
            else if (
                result &&
                typeof result ===
                "object"
            ) {

                score =
                    result;

            }

        }


        /* =================================================
           ตรวจว่ามีคะแนนจริงในชีทหรือไม่
           ================================================= */

        let hasServerScore =
            false;


        if (score) {

            for (
                let i = 1;
                i <= criteria.length;
                i++
            ) {

                const value =
                    score[
                    "c" + i
                    ];


                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {

                    hasServerScore =
                        true;

                    break;

                }

            }

        }


        /* =================================================
           CASE 1
           มีคะแนนจริงในชีท
           ================================================= */

        if (
            hasServerScore
        ) {

            criteria.forEach(
                function (
                    item,
                    index
                ) {

                    const input =
                        document.getElementById(
                            "score" +
                            (index + 1)
                        );


                    if (!input) {

                        return;

                    }


                    const value =
                        score[
                        "c" +
                        (index + 1)
                        ];


                    input.value =
                        (
                            value !== undefined &&
                            value !== null
                        )
                            ? String(
                                value
                            )
                            : "";

                }
            );


            /* ---------------------------------------------
               ความคิดเห็น
               --------------------------------------------- */

            const comment =
                document.getElementById(
                    "scoreComment"
                );


            if (comment) {

                comment.value =
                    score.comment ||
                    "";

            }


            /* ---------------------------------------------
               ลบ Draft เมื่อยืนยันว่ามีคะแนนบน Server แล้ว
               --------------------------------------------- */

            removeScoreDraft(
                judgeId,
                workId
            );


            /* ---------------------------------------------
               จำสถานะ Submitted
               --------------------------------------------- */

            localStorage.setItem(
                submittedKey,
                JSON.stringify({
                    submitted:
                        true
                })
            );


            /* ---------------------------------------------
               Status
               --------------------------------------------- */

            const saveStatus =
                document.getElementById(
                    "saveStatus"
                );


            if (saveStatus) {

                saveStatus.dataset.serverScore =
                    "true";

                saveStatus.textContent =
                    "🟢 มีคะแนนที่บันทึกไว้แล้ว";

            }


            const lastSavedTime =
                document.getElementById(
                    "lastSavedTime"
                );


            if (
                lastSavedTime
            ) {

                const savedAt =
                    score.updated_at ||
                    score.timestamp ||
                    "";


                if (
                    savedAt
                ) {

                    const savedDate =
                        new Date(
                            savedAt
                        );


                    if (
                        !Number.isNaN(
                            savedDate.getTime()
                        )
                    ) {

                        lastSavedTime.textContent =
                            "บันทึกล่าสุด : " +
                            savedDate.toLocaleString(
                                "th-TH",
                                {
                                    dateStyle:
                                        "short",

                                    timeStyle:
                                        "short",

                                    timeZone:
                                        "Asia/Bangkok"
                                }
                            );

                    }
                    else {

                        lastSavedTime.textContent =
                            "มีคะแนนที่บันทึกไว้แล้ว";

                    }

                }
                else {

                    lastSavedTime.textContent =
                        "มีคะแนนที่บันทึกไว้แล้ว";

                }

            }


            updateTotalScore();

            updateCriteriaProgress();


            return;

        }


        /* =================================================
           CASE 2
           ไม่มีคะแนนในชีท
           แต่เคย Submit มาก่อน

           = ถือว่าคะแนนถูกลบจากชีท
           ต้อง Reset ทุกอย่าง
           ================================================= */

        if (
            wasSubmitted
        ) {

            console.log(
                "OLD SCORE: คะแนนเคยส่ง แต่ถูกลบจากชีท → Reset"
            );


            /* ---------------------------------------------
               ล้างช่องคะแนน
               --------------------------------------------- */

            document
                .querySelectorAll(
                    ".score-input"
                )
                .forEach(
                    function (
                        input
                    ) {

                        input.value =
                            "";

                    }
                );


            /* ---------------------------------------------
               ล้างความคิดเห็น
               --------------------------------------------- */

            const comment =
                document.getElementById(
                    "scoreComment"
                );


            if (comment) {

                comment.value =
                    "";

            }


            /* ---------------------------------------------
               ลบ Draft เก่า
               --------------------------------------------- */

            removeScoreDraft(
                judgeId,
                workId
            );


            /* ---------------------------------------------
               ลบสถานะ Submitted
               --------------------------------------------- */

            try {

                localStorage.removeItem(
                    submittedKey
                );

            }
            catch (
            error
            ) {

                console.warn(
                    "ลบ Submitted Status ไม่ได้:",
                    error
                );

            }


            /* ---------------------------------------------
               สถานะหน้าเว็บ
               --------------------------------------------- */

            const saveStatus =
                document.getElementById(
                    "saveStatus"
                );


            if (saveStatus) {

                saveStatus.dataset.serverScore =
                    "false";

                saveStatus.textContent =
                    "⚪ ยังไม่มีการส่งคะแนน";

            }


            const lastSavedTime =
                document.getElementById(
                    "lastSavedTime"
                );


            if (lastSavedTime) {

                lastSavedTime.textContent =
                    "เมื่อกรอกคะแนนในช่อง คะแนนจะถูกบันทึกเป็นแบบร่างโดยอัตโนมัติ";

            }


            updateTotalScore();

            updateCriteriaProgress();


            return;

        }


        /* =================================================
           CASE 3
           ไม่มีคะแนนในชีท
           และยังไม่เคย Submit

           = Draft จริง
           ================================================= */

        console.log(
            "OLD SCORE: ไม่มีคะแนนจริง → ตรวจ Draft"
        );


        const loadedDraft =
            loadScoreDraft();


        if (!loadedDraft) {

            /*
             * ไม่มี Draft ด้วย
             * ต้องแน่ใจว่าช่องว่างจริง
             */

            document
                .querySelectorAll(
                    ".score-input"
                )
                .forEach(
                    function (
                        input
                    ) {

                        input.value =
                            "";

                    }
                );


            const comment =
                document.getElementById(
                    "scoreComment"
                );


            if (comment) {

                comment.value =
                    "";

            }


            const saveStatus =
                document.getElementById(
                    "saveStatus"
                );


            if (saveStatus) {

                saveStatus.dataset.serverScore =
                    "false";

                saveStatus.textContent =
                    "⚪ ยังไม่มีการส่งคะแนน";

            }

        }


        updateTotalScore();

        updateCriteriaProgress();


    }
    catch (
    error
    ) {

        console.warn(
            "โหลดคะแนนเดิมไม่สำเร็จ:",
            error
        );


        /*
         * API พัง/เน็ตพัง
         *
         * กรณีนี้ห้ามลบ Draft
         * เพราะเราไม่รู้ว่าชีทไม่มีคะแนนจริง
         * หรือแค่โหลดไม่ได้
         */

        loadScoreDraft();


        updateTotalScore();

        updateCriteriaProgress();

    }

}

/* =====================================================
   SUBMIT SCORE
   เปิด Popup ก่อนส่งจริง
   ===================================================== */

async function submitScore() {

    const judge =
        getCurrentJudge();

    if (!judge) {

        alert(
            "ไม่พบข้อมูลกรรมการ กรุณาเข้าสู่ระบบใหม่"
        );

        return;

    }


    if (!selectedWork) {

        alert(
            "ไม่พบข้อมูลผลงาน"
        );

        return;

    }


    if (
        !criteria ||
        criteria.length === 0
    ) {

        alert(
            "ยังไม่พบเกณฑ์การประเมิน"
        );

        return;

    }


    const scoreData = {

        judge:
            judge.id ||
            judge.judge_id ||
            judge.code ||
            "",

        work_id:
            selectedWork.id ||
            selectedWork.work_id ||
            "",

        comment:
            document.getElementById(
                "scoreComment"
            )?.value || ""

    };


    let total = 0;

    let maxTotal = 0;


    /*
     * ตรวจทุกข้อ
     */

    for (
        let i = 0;
        i < criteria.length;
        i++
    ) {

        const input =
            document.getElementById(
                "score" +
                (i + 1)
            );


        if (!input) {
            continue;
        }


        const value =
            Number(
                input.value ||
                0
            );


        const max =
            Number(
                criteria[i].max_score ||
                0
            );


        maxTotal +=
            max;


        if (
            value < 0 ||
            value > max
        ) {

            alert(
                "ข้อ " +
                (i + 1) +
                " ต้องอยู่ระหว่าง 0 - " +
                max
            );


            input.focus();

            return;

        }


        scoreData[
            "c" +
            (i + 1)
        ] =
            value;


        total +=
            value;

    }


    scoreData.total =
        total;


    /*
     * Popup
     */

    showScoreConfirmModal({

        judgeName:
            judge.name ||
            judge.judge_name ||
            judge.fullName ||
            judge.full_name ||
            judge.id ||
            "-",

        total:
            total,

        maxTotal:
            maxTotal,

        onConfirm:
            function () {

                return saveConfirmedScore(
                    scoreData
                );

            }

    });

}


/* =====================================================
   CONFIRM MODAL
   ===================================================== */

function showScoreConfirmModal(
    data
) {

    const modal =
        document.getElementById(
            "scoreConfirmModal"
        );


    if (!modal) {

        console.error(
            "ไม่พบ #scoreConfirmModal"
        );

        return;

    }


    const judgeElement =
        document.getElementById(
            "confirmJudgeName"
        );


    const totalElement =
        document.getElementById(
            "confirmTotalScore"
        );


    const totalMaxElement =
        document.getElementById(
            "confirmTotalScoreMax"
        );


    /* =================================================
       แสดงข้อมูลใน Popup
       ================================================= */

    if (judgeElement) {

        judgeElement.textContent =
            data.judgeName || "-";

    }


    if (totalElement) {

        totalElement.textContent =
            data.total ?? 0;

    }


    if (totalMaxElement) {

        totalMaxElement.textContent =
            "/ " +
            (data.maxTotal ?? 0) +
            " คะแนน";

    }


    /* =================================================
       เปิด Popup
       ================================================= */

    modal.hidden =
        false;

    modal.style.display =
        "flex";


    /* =================================================
       ปุ่มกลับไปแก้ไข
       ================================================= */

    const editButton =
        document.getElementById(
            "cancelScoreButton"
        );


    if (editButton) {

        editButton.disabled =
            false;

        editButton.onclick =
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                closeScoreConfirmModal();

            };

    }


    /* =================================================
       ปุ่มยืนยันส่งคะแนน
       ================================================= */

    const confirmButton =
        document.getElementById(
            "confirmScoreButton"
        );


    if (confirmButton) {

        confirmButton.disabled =
            false;

        confirmButton.textContent =
            "ยืนยันส่งคะแนน";


        confirmButton.onclick =
            async function (event) {

                event.preventDefault();

                event.stopPropagation();


                confirmButton.disabled =
                    true;

                confirmButton.textContent =
                    "⏳ กำลังส่ง...";


                try {

                    if (
                        typeof data.onConfirm ===
                        "function"
                    ) {

                        await data.onConfirm();

                    }

                }

                catch (error) {

                    console.error(
                        "ยืนยันส่งคะแนนไม่สำเร็จ:",
                        error
                    );

                }

                finally {

                    confirmButton.disabled =
                        false;

                    confirmButton.textContent =
                        "ยืนยันส่งคะแนน";

                }

            };

    }

}


/* =====================================================
   CLOSE MODAL
   ===================================================== */

function closeScoreConfirmModal() {

    const modal =
        document.getElementById(
            "scoreConfirmModal"
        );

    if (!modal) {
        return;
    }

    modal.hidden = true;
    modal.style.display = "none";

}


/* =====================================================
   SAVE CONFIRMED SCORE
   ===================================================== */

async function saveConfirmedScore(
    scoreData
) {

    const button =
        document.getElementById(
            "finishScoreButton"
        );


    const saveStatus =
        document.getElementById(
            "saveStatus"
        );


    const lastSavedTime =
        document.getElementById(
            "lastSavedTime"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "⏳ กำลังบันทึก...";

    }


    if (saveStatus) {

        saveStatus.textContent =
            "🟡 กำลังบันทึก...";

    }


    try {

        const response =
            await fetch(
                APP_CONFIG.API_URL,
                {
                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            action:
                                "saveScore",

                            data:
                                scoreData

                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                "ไม่สามารถเชื่อมต่อระบบบันทึกคะแนนได้"
            );

        }


        const result =
            await response.json();


        if (
            result &&
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "บันทึกคะแนนไม่สำเร็จ"
            );

        }


        /*
         * สำเร็จ
         */

        const submittedAt =
            new Date().toISOString();

        if (saveStatus) {
            saveStatus.textContent =
                "🟢 ประเมินแล้ว";
        }

        if (lastSavedTime) {
            lastSavedTime.textContent =
                "ส่งเมื่อ : " +
                new Date(
                    submittedAt
                ).toLocaleString(
                    "th-TH"
                );
        }


        /*
         * จำสถานะการส่งคะแนน
         * แยกตาม กรรมการ + ผลงาน
         */
        const submittedKey =
            "evaluationSubmitted_" +
            String(
                scoreData.judge || ""
            ).trim() +
            "_" +
            String(
                scoreData.work_id || ""
            ).trim();

        localStorage.setItem(
            submittedKey,
            JSON.stringify({
                submitted: true,
                submittedAt:
                    submittedAt
            })
        );


        /*
 * =================================================
 * เก็บคะแนนล่าสุดไว้ในเครื่องเป็น Backup
 *
 * ถึงส่งสำเร็จแล้วก็ยังเก็บไว้
 * จนกว่า Server จะคืนคะแนนจริงได้
 * =================================================
 */

        const submittedDraftKey =
            getScoreDraftKey(
                scoreData.judge,
                scoreData.work_id
            );


        const submittedDraft = {

            judge:
                String(
                    scoreData.judge ||
                    ""
                ).trim(),

            work_id:
                String(
                    scoreData.work_id ||
                    ""
                ).trim(),

            comment:
                scoreData.comment ||
                "",

            scores:
                {},

            savedAt:
                submittedAt,

            submitted:
                true

        };


        /*
 * เก็บคะแนน Backup ตามจำนวนเกณฑ์จริง
 * ไม่ล็อกจำนวนข้อ
 */

        for (
            let i = 1;
            i <= criteria.length;
            i++
        ) {

            const key =
                "c" + i;


            if (
                scoreData[key] !== undefined
            ) {

                submittedDraft.scores[key] =
                    scoreData[key];

            }

        }


        localStorage.setItem(
            submittedDraftKey,
            JSON.stringify(
                submittedDraft
            )
        );


        closeScoreConfirmModal();


        alert(
            "บันทึกคะแนนเรียบร้อย"
        );


        /*
         * กลับหน้าเลือกผลงาน
         * บังคับให้ Category โหลดข้อมูลใหม่
         */

        window.location.href =
            "./category.html?refresh=" +
            Date.now();


    } catch (error) {

        console.error(
            "SAVE SCORE ERROR =",
            error
        );


        if (saveStatus) {

            saveStatus.textContent =
                "🔴 บันทึกไม่สำเร็จ";

        }


        alert(
            "เกิดข้อผิดพลาด\n\n" +
            error.message
        );


        /*
         * เปิด Popup กลับมา
         * เพื่อให้กรรมการลองส่งใหม่
         */

        const modal =
            document.getElementById(
                "scoreConfirmModal"
            );


        if (modal) {

            modal.hidden =
                false;

            modal.style.display =
                "flex";

        }


        throw error;

    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "✔ ส่งคะแนน";

        }

    }

}


/* =====================================================
   EVENTS
   ===================================================== */

function setupEvents() {

    /*
     * ส่งคะแนน
     */

    const finishButton =
        document.getElementById(
            "finishScoreButton"
        );


    if (finishButton) {

        finishButton.onclick = function (event) {

            event.preventDefault();
            event.stopPropagation();

            console.log(
                "CLICK: finishScoreButton"
            );

            submitScore();

        };

    }


    /*
     * กลับไปเลือกผลงาน
     * ใช้ ID ที่มีอยู่จริงใน HTML
     */

    const backButton =
        document.getElementById(
            "evaluationBackButton"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                const main =
                    document.querySelector(
                        ".evaluation-main"
                    );


                if (main) {

                    /*
                     * ใส่ Animation ออกจากหน้า
                     */

                    main.classList.add(
                        "evaluation-page-leave"
                    );


                    /*
                     * รอ Animation จบ
                     * แล้วค่อยกลับหน้าเลือกผลงาน
                     */

                    setTimeout(
                        function () {

                            window.location.href =
                                "./category.html";

                        },
                        320
                    );

                }
                else {

                    window.location.href =
                        "./category.html";

                }

            }
        );

    }


    /*
     * ออกจากระบบ
     */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

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


                window.location.href =
                    "./index.html";

            }
        );

    }


    /*
     * ปุ่มใน Popup
     * bind ใหม่ทุกครั้งที่ Popup เปิด
     * ใน showScoreConfirmModal()
     */

}


/* =====================================================
   ERROR
   ===================================================== */

function showEvaluationError(
    message
) {

    const container =
        document.getElementById(
            "criteriaContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="evaluation-error">

            <img
                class="error-mascot"
                src="./assets/images/qsnich-sad.png"
                alt="ไม่สามารถโหลดเกณฑ์ได้"
            >

            <strong>
                ${escapeHtml(message)}
            </strong>

            <div>
                กรุณากด refresh หน้านี้ หรือเข้าสู่ระบบใหม่อีกครั้ง
            </div>

        </div>
    `;

}


/* =====================================================
   REMOVE SCORE DRAFT
   ลบเฉพาะกรรมการ + ผลงานนี้
   ===================================================== */

function removeScoreDraft(
    judgeId,
    workId
) {

    const key =
        getScoreDraftKey(
            judgeId,
            workId
        );


    try {

        localStorage.removeItem(
            key
        );


        console.log(
            "Draft removed:",
            key
        );


    } catch (error) {

        console.warn(
            "ไม่สามารถลบ Draft ได้:",
            error
        );

    }

}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

/* =====================================================
   INITIALIZE EVALUATION PAGE
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        try {

            console.log(
                "EVALUATION PAGE START"
            );


            /* -----------------------------------------------
               1. โหลดผลงานที่เลือก
               ----------------------------------------------- */

            loadSelectedWork();


            if (!selectedWork) {

                throw new Error(
                    "ไม่พบข้อมูลผลงานที่เลือก"
                );

            }


            /* -----------------------------------------------
               2. แสดงชื่อกรรมการ
               ----------------------------------------------- */

            displayJudge();


            /* -----------------------------------------------
               3. ผูกปุ่มทั้งหมด
               ----------------------------------------------- */

            setupEvents();


            /* -----------------------------------------------
               4. โหลดเกณฑ์ + คะแนนจริง / Draft
               ----------------------------------------------- */

            await loadCriteriaFromAPI();


            /* -----------------------------------------------
               5. อัปเดตคะแนนและจำนวนข้อ
               หลังข้อมูลทุกอย่างพร้อม
               ----------------------------------------------- */

            updateTotalScore();

            updateCriteriaProgress();


            console.log(
                "EVALUATION PAGE READY"
            );

        }
        catch (
        error
        ) {

            console.error(
                "EVALUATION INIT ERROR =",
                error
            );


            showEvaluationError(
                error.message ||
                "ไม่สามารถโหลดข้อมูลการประเมินได้"
            );

        }

    }
);