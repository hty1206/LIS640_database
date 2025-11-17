document.addEventListener("DOMContentLoaded", () => {
  // ==== View 切換 (Calendar / Tableau) ====
  const views = document.querySelectorAll(".view");
  const links = document.querySelectorAll("[data-link]");

  function showView(id) {
    views.forEach(v => v.classList.add("hidden"));
    const el = document.getElementById("view-" + id);
    if (el) el.classList.remove("hidden");
  }

  links.forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const target = a.getAttribute("href").replace("#", "");
      showView(target);
    });
  });

  // 預設顯示 calendar
  showView("calendar");

  // ==== 主題切換 ====
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;

  function updateThemeButton() {
    const isLight = html.getAttribute("data-theme") === "light";
    // dark mode 時按鈕顯示 Light（點了會切去 light）
    themeToggle.textContent = isLight ? "Dark" : "Light";
  }

  themeToggle.addEventListener("click", () => {
    const isLight = html.getAttribute("data-theme") === "light";
    html.setAttribute("data-theme", isLight ? "dark" : "light");
    updateThemeButton();
  });

  // 初始主題：dark
  if (!html.getAttribute("data-theme")) {
    html.setAttribute("data-theme", "dark");
  }
  updateThemeButton();

  // ==== 日期字體大小 slider ====
  const dateSizeRange = document.getElementById("dateSizeRange");
  const dateSizeVal = document.getElementById("dateSizeVal");

  function applyDateSize(val) {
    document.documentElement.style.setProperty("--date-size", `${val}px`);
    dateSizeVal.textContent = val;
  }

  if (dateSizeRange) {
    dateSizeRange.addEventListener("input", () => {
      applyDateSize(dateSizeRange.value);
    });
    applyDateSize(dateSizeRange.value);
  }

  // ==== Calendar ====
  const titleText = document.getElementById("titleText");
  const weekdaysEl = document.getElementById("weekdays");
  const gridEl = document.getElementById("grid");
  const monthSelect = document.getElementById("monthSelect");
  const yearSelect = document.getElementById("yearSelect");
  const todayBtn = document.getElementById("todayBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pickedEl = document.getElementById("picked");

  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let current = new Date();

  function renderWeekdays() {
    if (!weekdaysEl) return;
    weekdaysEl.innerHTML = "";
    WEEKDAYS.forEach(d => {
      const div = document.createElement("div");
      div.className = "weekday";
      div.textContent = d;
      weekdaysEl.appendChild(div);
    });
  }

  function initYearMonthSelect() {
    if (!monthSelect || !yearSelect) return;
    const thisYear = current.getFullYear();
    yearSelect.innerHTML = "";
    for (let y = thisYear - 3; y <= thisYear + 3; y++) {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      if (y === thisYear) opt.selected = true;
      yearSelect.appendChild(opt);
    }

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    monthSelect.innerHTML = "";
    monthNames.forEach((name, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = name;
      if (idx === current.getMonth()) opt.selected = true;
      monthSelect.appendChild(opt);
    });
  }

  function updateTitle() {
    if (!titleText) return;
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    titleText.textContent = `${monthNames[current.getMonth()]} ${current.getFullYear()}`;
  }

  function sameDate(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  function renderCalendarGrid() {
    if (!gridEl) return;

    gridEl.innerHTML = "";
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 空白格（前導）
    for (let i = 0; i < startWeekday; i++) {
      const cell = document.createElement("div");
      gridEl.appendChild(cell);
    }

    const today = new Date();

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const cell = document.createElement("div");
      cell.className = "cell";

      const num = document.createElement("div");
      num.className = "date-num";
      num.textContent = day;
      cell.appendChild(num);

      // today 樣式
      if (sameDate(cellDate, today)) {
        cell.classList.add("today");
      }

      cell.addEventListener("click", () => {
        document
          .querySelectorAll(".cell.selected")
          .forEach(c => c.classList.remove("selected"));
        cell.classList.add("selected");
        if (pickedEl) {
          pickedEl.textContent = cellDate.toISOString().slice(0, 10);
        }
      });

      gridEl.appendChild(cell);
    }
  }

  if (monthSelect) {
    monthSelect.addEventListener("change", () => {
      current.setMonth(parseInt(monthSelect.value, 10));
      updateTitle();
      renderCalendarGrid();
    });
  }

  if (yearSelect) {
    yearSelect.addEventListener("change", () => {
      current.setFullYear(parseInt(yearSelect.value, 10));
      updateTitle();
      renderCalendarGrid();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      current.setMonth(current.getMonth() - 1);
      if (monthSelect) monthSelect.value = current.getMonth();
      if (yearSelect) yearSelect.value = current.getFullYear();
      updateTitle();
      renderCalendarGrid();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      current.setMonth(current.getMonth() + 1);
      if (monthSelect) monthSelect.value = current.getMonth();
      if (yearSelect) yearSelect.value = current.getFullYear();
      updateTitle();
      renderCalendarGrid();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener("click", () => {
      current = new Date();
      if (monthSelect) monthSelect.value = current.getMonth();
      if (yearSelect) yearSelect.value = current.getFullYear();
      updateTitle();
      renderCalendarGrid();
    });
  }

  renderWeekdays();
  initYearMonthSelect();
  updateTitle();
  renderCalendarGrid();

  // ==== Tableau 嵌入 ====
  const tableauUrlInput = document.getElementById("tableauUrl");
  const tableauFrame = document.getElementById("tableauFrame");
  const loadTableauBtn = document.getElementById("loadTableau");

  if (loadTableauBtn && tableauUrlInput && tableauFrame) {
    loadTableauBtn.addEventListener("click", () => {
      const url = tableauUrlInput.value.trim();
      if (!url) {
        alert("Please paste a Tableau visualization link.");
        return;
      }
      tableauFrame.src = url;
      // 自動切到 Tableau 頁
      showView("tableau");
    });
  }

  // ==== 新增事件 Modal ====
  const newEventBtn = document.getElementById("newEventBtn");
  const eventModalOverlay = document.getElementById("eventModalOverlay");
  const closeEventModal = document.getElementById("closeEventModal");
  const eventForm = document.getElementById("eventForm");

  function openModal() {
    if (eventModalOverlay) {
      eventModalOverlay.classList.remove("hidden");
    }
  }

  function closeModal() {
    if (eventModalOverlay) {
      eventModalOverlay.classList.add("hidden");
    }
  }

  if (newEventBtn) newEventBtn.addEventListener("click", openModal);
  if (closeEventModal) closeEventModal.addEventListener("click", closeModal);

  // 點遮罩關閉
  if (eventModalOverlay) {
    eventModalOverlay.addEventListener("click", e => {
      if (e.target === eventModalOverlay) {
        closeModal();
      }
    });
  }

  // 送出表單（目前只是 console.log，一樣會關掉 modal）
  if (eventForm) {
    eventForm.addEventListener("submit", e => {
      e.preventDefault();
      const data = {
        title: document.getElementById("eventTitle").value,
        date: document.getElementById("eventDate").value,
        start: document.getElementById("eventStart").value,
        end: document.getElementById("eventEnd").value,
        loc: document.getElementById("eventLocation").value,
        cal: document.getElementById("eventCal").value
      };
      console.log("New Event:", data);
      closeModal();
    });
  }

  // ==== Tag 多選（右側 CALENDARS） ====
  const tagCheckboxes = document.querySelectorAll("[data-tag-filter]");

  function logActiveTags() {
    const active = Array.from(tagCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.dataset.tagFilter);
    console.log("Active calendar tags:", active);
  }

  tagCheckboxes.forEach(cb => {
    cb.addEventListener("change", logActiveTags);
  });

  // 預設 log 一次
  logActiveTags();
});
