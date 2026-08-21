/* =====================================================
   EVALUATION PAGE
   ระบบประเมินผลงาน V2
   ===================================================== */

let selectedWork = null;
let criteria = [];
let draftSaveTimer = null;

const GAS_URL =
    "https://script.google.com/macros/s/AKfycbzak_-7CxO6BvJ4GW-n5O9BvpbPGME-PQXdfoFlU-VHHHcsTKUsEEEDEq06zaqmZ-3BPw/exec";


/* =====================================================
   เมื่อหน้าโหลด
   หน้าประเมิน
   โหลดข้อมูลใหม่ทุกครั้ง
   ไม่ใช้ Works Cache
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * =============================================
         * 1. โหลดผลงานที่เลือก
         * =============================================
         */

        loadSelectedWork();


        /*
         * =============================================
         * 2. แสดงชื่อกรรมการ
         * =============================================
         */

        displayJudge();


        /*
         * =============================================
         * 3. ผูกปุ่มต่าง ๆ
         * =============================================
         */

        setupEvents();


        /*
         * =============================================
         * 4. โหลดเกณฑ์ + คะแนน
         * =============================================
         */

        loadCriteria();

    }
);


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
   CURRENT JUDGE
   ===================================================== */

function getCurrentJudge() {

    const raw =
        sessionStorage.getItem(
            "judge"
        );


    if (!raw) {
        return null;
    }


    try {

        const data =
            JSON.parse(raw);


        /*
         * รองรับทั้ง
         *
         * {
         *   judge: {...}
         * }
         *
         * และ
         *
         * {...}
         */

        if (
            data &&
            data.judge
        ) {

            return data.judge;

        }


        return data;

    } catch (error) {

        /*
         * กรณีเก็บเป็นข้อความตรง ๆ
         */

        return {
            name: raw,
            id: raw
        };

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
   โหลดเกณฑ์ + คะแนน
   Cache ก่อน → คะแนนจริงทีหลัง
   ===================================================== */

async function loadCriteria() {

    const container =
        document.getElementById(
            "criteriaContainer"
        );

    const loading =
        document.getElementById(
            "criteriaLoading"
        );


    if (!container) {
        return;
    }


    /*
     * =============================================
     * 1. ลองอ่าน Criteria จาก Cache ก่อน
     * =============================================
     */

    let filteredCriteria = [];


    const cached =
        sessionStorage.getItem(
            "criteria"
        );


    if (cached) {

        try {

            const cachedData =
                JSON.parse(
                    cached
                );


            if (
                Array.isArray(
                    cachedData
                )
            ) {

                filteredCriteria =
                    cachedData.filter(
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

            }
            else if (
                selectedWork &&
                selectedWork.category
            ) {

                filteredCriteria =
                    cachedData[
                    selectedWork.category
                    ] || [];

            }

        }
        catch (error) {

            console.warn(
                "อ่าน Criteria Cache ไม่ได้:",
                error
            );

        }

    }


    /*
     * =============================================
     * 2. มี Cache
     * แสดงเกณฑ์ทันที
     * =============================================
     */

    if (
        filteredCriteria.length > 0
    ) {

        criteria =
            filteredCriteria;


        /*
         * แสดงเกณฑ์ทันที
         */

        renderCriteria();


        /*
         * =============================================
         * 3. โหลดคะแนนจริงจากชีท
         *
         * ไม่ใช้ Cache คะแนน
         * =============================================
         */

        await loadOldScore();


        /*
         * =============================================
         * 4. ทุกอย่างพร้อม
         * =============================================
         */

        if (loading) {

            loading.style.display =
                "none";

        }


        container.style.display =
            "";

        container.style.visibility =
            "visible";


        return;

    }


    /*
     * =============================================
     * 5. ไม่มี Cache
     * แสดงตัววิ่งแล้วโหลด GAS
     * =============================================
     */

    if (loading) {

        loading.style.display =
            "flex";

    }


    container.style.display =
        "none";

    container.style.visibility =
        "hidden";


    await loadCriteriaFromAPI();

}

/* =====================================================
   LOAD CRITERIA FROM API
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

        /*
         * =============================================
         * แสดงตัววิ่ง
         * ซ่อนเกณฑ์
         * =============================================
         */

        if (loading) {

            loading.style.display =
                "flex";

        }


        if (container) {

            container.style.display =
                "none";

            container.style.visibility =
                "hidden";

        }


        /*
         * =============================================
         * โหลด Criteria จาก GAS
         * =============================================
         */

        const response =
            await fetch(
                GAS_URL +
                "?action=criteria"
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


        let allCriteria = [];


        if (
            Array.isArray(
                result
            )
        ) {

            allCriteria =
                result;

        } else {

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


        /*
         * =============================================
         * กรองตามหมวดผลงาน
         * =============================================
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
         * =============================================
         * เก็บ Cache
         * =============================================
         */

        sessionStorage.setItem(
            "criteria",
            JSON.stringify(
                allCriteria
            )
        );

        /*
         * =============================================
         * สร้างช่องคะแนน
         * แต่ยังไม่แสดง
         * =============================================
         */

        renderCriteria();


        /*
         * =============================================
         * โหลดคะแนนจริง
         *
         * ชีทเป็นหลัก
         * Draft เป็นรอง
         * ไม่มีทั้งคู่ = 0
         * =============================================
         */

        await loadOldScore();


        /*
         * =============================================
         * ทุกอย่างพร้อมแล้ว
         * =============================================
         */

        if (loading) {

            loading.style.display =
                "none";

        }


        if (container) {

            container.style.display =
                "";

            container.style.visibility =
                "visible";

        }


    } catch (error) {

        console.error(
            "LOAD CRITERIA ERROR =",
            error
        );


        /*
         * กรณี Error
         * ต้องเอาตัววิ่งออก
         * เพื่อไม่ให้ค้างตลอดไป
         */

        if (loading) {

            loading.style.display =
                "none";

        }


        if (container) {

            container.style.display =
                "";

            container.style.visibility =
                "visible";

        }


        showEvaluationError(
            "ไม่สามารถโหลดข้อมูลการประเมินได้"
        );

    }

}

/* =====================================================
   RENDER CRITERIA
   ===================================================== */

function renderCriteria() {

    const container =
        document.getElementById(
            "criteriaContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


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
                        type="number"
                        class="score-input"
                        id="score${index + 1}"
                        min="0"
                        max="${maxScore}"
                        data-max="${maxScore}"
                        placeholder="0"
                        inputmode="numeric"
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


/* =====================================================
   BIND SCORE INPUTS
   ===================================================== */

function bindScoreInputs() {

    document
        .querySelectorAll(
            ".score-input"
        )
        .forEach(
            function (input) {


                input.addEventListener(
                    "input",
                    function () {

                        normalizeScoreInput(
                            input
                        );


                        updateTotalScore();

                        updateCriteriaProgress();

                        saveScoreDraftDebounced();

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

function updateCriteriaProgress() {

    const progress =
        document.getElementById(
            "criteriaProgress"
        );


    if (!progress) {
        return;
    }


    const inputs =
        document.querySelectorAll(
            ".score-input"
        );


    let answered = 0;


    inputs.forEach(
        function (input) {

            if (
                input.value !== ""
            ) {

                answered++;

            }

        }
    );


    progress.textContent =
        "ประเมินแล้ว " +
        answered +
        "/" +
        inputs.length;

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
            "ไม่สามารถบันทึก Draft ได้:",
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
   เฉพาะกรรมการ + ผลงานนี้
   ===================================================== */

async function loadOldScore() {

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
        "";


    const workId =
        selectedWork.id ||
        selectedWork.work_id ||
        "";


    console.log(
        "OLD SCORE REQUEST:",
        {
            judgeId: judgeId,
            workId: workId
        }
    );


    if (
        !judgeId ||
        !workId
    ) {
        console.warn(
            "OLD SCORE: ไม่มี judgeId หรือ workId"
        );

        return;
    }


    try {

        /*
         * สร้าง URL
         *
         * เพิ่ม timestamp เพื่อป้องกัน
         * Browser / Safari / iPad cache
         * เอาผล getScoreForEdit เดิมมาใช้
         */

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


        console.log(
            "OLD SCORE URL =",
            url
        );


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

            console.warn(
                "OLD SCORE HTTP ERROR =",
                response.status
            );

            return;
        }


        const result =
            await response.json();


        console.log(
            "OLD SCORE RESULT =",
            result
        );


        let score =
            null;


        /*
         * รองรับ response
         * หลายรูปแบบ
         */

        if (
            result &&
            result.success === false
        ) {

            score =
                null;

        } else if (
            result &&
            result.data
        ) {

            score =
                result.data;

        } else if (
            result &&
            result.score
        ) {

            score =
                result.score;

        } else if (
            result &&
            (
                result.c1 !== undefined ||
                result.c2 !== undefined
            )
        ) {

            score =
                result;

        }


        /*
         * ไม่มีคะแนนเก่า
         */

        if (!score) {

            console.log(
                "OLD SCORE: ไม่พบคะแนนเก่า → โหลด Draft"
            );

            loadScoreDraft();

            updateTotalScore();

            updateCriteriaProgress();

            return;
        }


        let hasServerScore =
            false;


        /*
         * ใส่คะแนนเก่ากลับเข้า
         * ช่องประเมิน
         */

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


                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {

                    input.value =
                        value;


                    hasServerScore =
                        true;


                    console.log(
                        "มีคะแนนเก่า:",
                        "c" +
                        (index + 1),
                        value
                    );

                }

            }
        );


        /*
         * ความคิดเห็นเดิม
         */

        const comment =
            document.getElementById(
                "scoreComment"
            );


        if (
            comment &&
            score.comment !== undefined
        ) {

            comment.value =
                score.comment ||
                "";

        }


        /*
         * ถ้าไม่มีคะแนนจริง
         * ไม่ต้องเปลี่ยนสถานะ
         */

        if (
            !hasServerScore
        ) {

            console.log(
                "OLD SCORE: ไม่พบ c1-c8"
            );

            return;
        }


        /*
         * คำนวณคะแนนรวมใหม่
         */

        updateTotalScore();


        updateCriteriaProgress();


        /*
         * แสดงสถานะ
         */

        const saveStatus =
            document.getElementById(
                "saveStatus"
            );


        if (saveStatus) {

            saveStatus.dataset.serverScore =
                "true";


            saveStatus.textContent =
                "🟢 ประเมินแล้ว";


            saveStatus.style.display =
                "block";

        }


        /*
         * แสดงเวลาที่บันทึก
         */

        const lastSavedTime =
            document.getElementById(
                "lastSavedTime"
            );


        if (
            lastSavedTime &&
            score.updated_at
        ) {

            const date =
                new Date(
                    score.updated_at
                );

            lastSavedTime.textContent =
                "บันทึกล่าสุด : " +
                date.toLocaleString(
                    "th-TH",
                    {
                        dateStyle: "short",
                        timeStyle: "short"
                    }
                );

        }

    } catch (error) {

        console.warn(
            "โหลดคะแนนเดิมไม่สำเร็จ:",
            error
        );

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

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

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


        console.log(
            "SAVE SCORE RESULT =",
            result
        );


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
         * ลบ Draft เฉพาะ
         * กรรมการ + ผลงานนี้
         */

        removeScoreDraft(
            scoreData.judge,
            scoreData.work_id
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
            function () {

                window.location.href =
                    "./category.html";

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