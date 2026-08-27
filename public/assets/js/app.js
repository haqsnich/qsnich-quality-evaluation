/*
========================================================
ระบบประเมินผลงาน
app.js
Version : 2.0.0
========================================================
*/


/**
 * ============================================
 * รายชื่อกรรมการ
 * ข้อมูลคงที่ ไม่ต้องโหลดจาก Google Sheets
 * ============================================
 */

const JUDGES = [

  {
    id: "1",
    name: "แพทย์หญิงศิโรรัตน์ สุวรรณโชติ",
    admin: false
  },

  {
    id: "2",
    name: "แพทย์หญิงนุชนาฏ รุจิเมธาภาส",
    admin: false
  },

  {
    id: "3",
    name: "แพทย์หญิงมนทินี สัปจาตุระ",
    admin: false
  },

  {
    id: "4",
    name: "แพทย์หญิงอุบลวรรณ วัฒนาดิลกกุล",
    admin: false
  },

  {
    id: "5",
    name: "แพทย์หญิงสิจา ลีลาทนาพร",
    admin: false
  },

  {
    id: "6",
    name: "แพทย์หญิงมนลดา กาญจนธารายนตร์",
    admin: false
  },

  {
    id: "7",
    name: "นายแพทย์จารุพงษ์ น้อยตำแย",
    admin: false
  },

  {
    id: "8",
    name: "นายแพทย์สิวโรจน์ ขนอม",
    admin: false
  },

  {
    id: "9",
    name: "ทันตแพทย์หญิงประไพ ชุณหคล้าย",
    admin: false
  },

  {
    id: "10",
    name: "เภสัชกรหญิงพรศรี อิงเจริญสุนทร",
    admin: false
  },

  {
    id: "11",
    name: "ทนพญ.พิทยา คำมี",
    admin: false
  },

  {
    id: "12",
    name: "นางมลิวัลย์ วงศ์พยัคฆ์",
    admin: false
  },

  {
    id: "13",
    name: "พว.พุทธชาด นาคเรือง",
    admin: false
  },

  {
    id: "14",
    name: "พว.อรัญญา ไทยแท้",
    admin: false
  },

  {
    id: "15",
    name: "พว.สุพัตรา ทาอ้อ",
    admin: false
  }

];


/**
 * ============================================
 * ตัวแปรกรรมการที่เลือก
 * ============================================
 */

let selectedJudgeId = "";


/**
 * ============================================
 * เมื่อหน้าเว็บโหลดเสร็จ
 * ============================================
 */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadJudges();

    setupLoginButton();

    setupJudgeDropdown();

  }
);


/**
 * ============================================
 * แสดงรายชื่อกรรมการ
 * ============================================
 */

function loadJudges() {

  const menu =
    document.getElementById(
      "judgeDropdownMenu"
    );

  const loginButton =
    document.getElementById(
      "loginButton"
    );

  const selectedText =
    document.getElementById(
      "judgeSelectedText"
    );


  if (!menu) {

    console.error(
      "ไม่พบ #judgeDropdownMenu"
    );

    return;

  }


  menu.innerHTML = "";


  JUDGES.forEach(
    function (judge) {

      const option =
        document.createElement(
          "button"
        );


      option.type =
        "button";


      option.className =
        "custom-select-option";


      option.dataset.value =
        judge.id;


      option.dataset.name =
        judge.name;


      option.setAttribute(
        "role",
        "option"
      );


      option.textContent =
        judge.name;


      option.addEventListener(
        "click",
        function () {

          selectJudge(judge);

        }
      );


      menu.appendChild(
        option
      );

    }
  );


  // ==========================================
  // ค่าเริ่มต้น
  // ==========================================

  selectedJudgeId = "";


  if (selectedText) {

    selectedText.textContent =
      "กรุณาเลือกชื่อกรรมการ";

  }


  if (loginButton) {

    loginButton.disabled =
      true;

  }

}


/**
 * ============================================
 * เปิด / ปิด Dropdown
 * ============================================
 */

function setupJudgeDropdown() {

  const dropdown =
    document.getElementById(
      "judgeDropdown"
    );

  const trigger =
    document.getElementById(
      "judgeDropdownTrigger"
    );


  if (!dropdown || !trigger) {

    return;

  }


  trigger.addEventListener(
    "click",
    function () {

      const isOpen =
        dropdown.classList.contains(
          "open"
        );


      if (isOpen) {

        closeJudgeDropdown();

      } else {

        openJudgeDropdown();

      }

    }
  );


  // คลิกข้างนอก → ปิด

  document.addEventListener(
    "click",
    function (event) {

      if (
        !dropdown.contains(
          event.target
        )
      ) {

        closeJudgeDropdown();

      }

    }
  );


  // ESC → ปิด

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape"
      ) {

        closeJudgeDropdown();

      }

    }
  );

}


/**
 * ============================================
 * เปิด Dropdown
 * ============================================
 */

function openJudgeDropdown() {

  const dropdown =
    document.getElementById(
      "judgeDropdown"
    );

  const trigger =
    document.getElementById(
      "judgeDropdownTrigger"
    );


  if (!dropdown || !trigger) {

    return;

  }


  dropdown.classList.add(
    "open"
  );


  trigger.setAttribute(
    "aria-expanded",
    "true"
  );

}


/**
 * ============================================
 * ปิด Dropdown
 * ============================================
 */

function closeJudgeDropdown() {

  const dropdown =
    document.getElementById(
      "judgeDropdown"
    );

  const trigger =
    document.getElementById(
      "judgeDropdownTrigger"
    );


  if (!dropdown || !trigger) {

    return;

  }


  dropdown.classList.remove(
    "open"
  );


  trigger.setAttribute(
    "aria-expanded",
    "false"
  );

}


/**
 * ============================================
 * เลือกกรรมการ
 * ============================================
 */

function selectJudge(judge) {

  const selectedText =
    document.getElementById(
      "judgeSelectedText"
    );

  const loginButton =
    document.getElementById(
      "loginButton"
    );

  const loginError =
    document.getElementById(
      "loginError"
    );

  const options =
    document.querySelectorAll(
      ".custom-select-option"
    );


  // ==========================================
  // เก็บ ID กรรมการ
  // ==========================================

  selectedJudgeId =
    judge.id;


  // ==========================================
  // แสดงชื่อกรรมการ
  // ==========================================

  selectedText.textContent =
    judge.name;


  // ==========================================
  // ล้างสถานะ selected เดิม
  // ==========================================

  options.forEach(
    function (option) {

      option.classList.remove(
        "selected"
      );

    }
  );


  // ==========================================
  // ใส่สถานะ selected ให้คนที่เลือก
  // ==========================================

  const selectedOption =
    document.querySelector(
      '.custom-select-option[data-value="' +
      judge.id +
      '"]'
    );


  if (selectedOption) {

    selectedOption.classList.add(
      "selected"
    );

  }


  // ==========================================
  // เปิดปุ่ม Login
  // ==========================================

  loginButton.disabled =
    false;


  loginButton.textContent =
    "เข้าสู่ระบบ";


  loginError.textContent =
    "";


  closeJudgeDropdown();

}


/**
 * ============================================
 * ปุ่มเข้าสู่ระบบ
 * ============================================
 */

function setupLoginButton() {

  const loginButton =
    document.getElementById(
      "loginButton"
    );


  if (!loginButton) {

    return;

  }


  loginButton.addEventListener(
    "click",
    async function () {

      if (!selectedJudgeId) {

        return;

      }


      await loginJudge(
        selectedJudgeId
      );

    }
  );

}


/**
 * ============================================
 * Login กรรมการ
 *
 * ขั้นตอน:
 *
 * 1. ส่ง judgeId ไป GAS
 * 2. GAS โหลด works + criteria
 * 3. รอจนข้อมูลกลับมาครบ
 * 4. เก็บข้อมูลใน sessionStorage
 * 5. แสดง "เข้าสู่ระบบสำเร็จ"
 * 6. เปลี่ยนหน้า
 * ============================================
 */

/**
 * ============================================
 * Login กรรมการ
 *
 * Login สำเร็จเมื่อไหร่
 * จะได้รับข้อมูล:
 *
 * judge
 * works
 * criteria
 *
 * จาก GAS พร้อมกัน
 *
 * หลังจากโหลดข้อมูลทั้งหมดเสร็จแล้ว
 * จึงเปลี่ยนไปหน้า Category
 * ============================================
 */

/* =====================================================
   LOGIN กรรมการ

   กดแล้ว → ไปหน้า Category ทันที
   หน้า Category จะเป็นคนโหลดผลงานและแสดงตัววิ่ง
   ===================================================== */

function loginJudge(judgeId) {

    const loginButton =
        document.getElementById(
            "loginButton"
        );

    const loginError =
        document.getElementById(
            "loginError"
        );


    /* -----------------------------------------------
       หา กรรมการ ที่เลือก
       ----------------------------------------------- */

    const judge =
        JUDGES.find(
            function (item) {

                return String(item.id) ===
                    String(judgeId);

            }
        );


    if (!judge) {

        if (loginError) {

            loginError.textContent =
                "ไม่พบข้อมูลกรรมการ";

        }

        return;

    }


    /* -----------------------------------------------
       ป้องกันการกดซ้ำ
       ----------------------------------------------- */

    if (loginButton) {

        loginButton.disabled = true;

    }


    if (loginError) {

        loginError.textContent = "";

    }


    /* -----------------------------------------------
       เก็บเฉพาะข้อมูลกรรมการก่อน

       หน้า Category จะโหลดผลงานเอง
       ----------------------------------------------- */

    const loginSession = {

        success: true,

        judge: judge,

        works: [],

        criteria: []

    };


    sessionStorage.setItem(
        "judge",
        JSON.stringify(
            loginSession
        )
    );


    /* -----------------------------------------------
       ไปหน้า Category ทันที
       ----------------------------------------------- */

    window.location.href =
        "./category.html";

}