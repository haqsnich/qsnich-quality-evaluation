/* =====================================================
   EVALUATION PAGE
   ===================================================== */

let selectedWork = null;
let criteria = [];


/* =====================================================
   LOAD
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const storedWork =
            sessionStorage.getItem(
                "selectedWork"
            );

        if (!storedWork) {

            window.location.href =
                "./category.html";

            return;
        }


        try {

            selectedWork =
                JSON.parse(
                    storedWork
                );

        } catch (error) {

            window.location.href =
                "./category.html";

            return;
        }


        displayWork();

        loadCriteria();

        setupEvents();

    }
);


/* =====================================================
   แสดงข้อมูลผลงาน
   ===================================================== */

function displayWork() {

    document.getElementById(
        "evaluationWorkId"
    ).textContent =
        selectedWork.id || "-";


    document.getElementById(
        "evaluationCategory"
    ).textContent =
        selectedWork.category || "-";


    document.getElementById(
        "evaluationWorkTitle"
    ).textContent =
        selectedWork.title || "-";


    document.getElementById(
        "evaluationDepartment"
    ).textContent =
        selectedWork.department || "-";
}


/* =====================================================
   โหลดเกณฑ์
   ===================================================== */

async function loadCriteria() {

    try {

        const response =
            await fetch(
                APP_CONFIG.API_URL +
                "?action=criteria"
            );


        if (!response.ok) {

            throw new Error(
                "ไม่สามารถโหลดเกณฑ์การประเมินได้"
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


        criteria =
            result.criteria?.[
                selectedWork.category
            ] || [];


        renderCriteria();


    } catch (error) {

        showCriteriaError(
            error.message
        );

    }
}


/* =====================================================
   แสดงเกณฑ์
   ===================================================== */

function renderCriteria() {

    const container =
        document.getElementById(
            "criteriaContainer"
        );


    if (
        !criteria ||
        criteria.length === 0
    ) {

        container.innerHTML = `
            <div class="evaluation-empty">
                ไม่พบเกณฑ์การประเมินสำหรับผลงานประเภทนี้
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    criteria.forEach(
        function (
            item,
            index
        ) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "evaluation-criterion";


            card.innerHTML = `

                <div class="criterion-number">
                    ข้อ ${item.no || index + 1}
                </div>

                <div class="criterion-title">
                    ${item.title || ""}
                </div>

                <div class="criterion-score">

                    <input
                        type="number"
                        class="score-input"
                        id="score${index + 1}"
                        min="0"
                        max="${item.max}"
                        data-max="${item.max}"
                        placeholder="0"
                    >

                    <span>
                        / ${item.max}
                    </span>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    document
        .querySelectorAll(
            ".score-input"
        )
        .forEach(
            function (input) {

                input.addEventListener(
                    "input",
                    updateTotalScore
                );

            }
        );
}


/* =====================================================
   รวมคะแนน
   ===================================================== */

function updateTotalScore() {

    let total = 0;


    document
        .querySelectorAll(
            ".score-input"
        )
        .forEach(
            function (input) {

                const max =
                    Number(
                        input.dataset.max
                    );


                let value =
                    Number(
                        input.value
                    ) || 0;


                if (
                    value > max
                ) {

                    value = max;

                    input.value =
                        max;

                }


                if (
                    value < 0
                ) {

                    value = 0;

                    input.value =
                        0;

                }


                total += value;

            }
        );


    document.getElementById(
        "totalScore"
    ).textContent =
        total;
}


/* =====================================================
   EVENTS
   ===================================================== */

function setupEvents() {

    document.getElementById(
        "backButton"
    ).addEventListener(
        "click",
        function () {

            window.location.href =
                "./category.html";

        }
    );


    document.getElementById(
        "finishScoreButton"
    ).addEventListener(
        "click",
        submitScore
    );
}


/* =====================================================
   ERROR
   ===================================================== */

function showCriteriaError(
    message
) {

    document.getElementById(
        "criteriaContainer"
    ).innerHTML = `

        <div class="evaluation-error">

            <strong>
                ไม่สามารถโหลดเกณฑ์การประเมินได้
            </strong>

            <div>
                ${message || ""}
            </div>

        </div>

    `;
}