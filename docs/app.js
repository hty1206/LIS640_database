document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     View Switching
  =============================== */
  const views = document.querySelectorAll(".view");
  const links = document.querySelectorAll("[data-link]");

  function showView(id) {
    views.forEach(v => v.classList.add("hidden"));
    document.getElementById("view-" + id).classList.remove("hidden");
  }

  links.forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      showView(a.getAttribute("href").replace("#", ""));
    });
  });

  showView("calendar");


  /* ===============================
     Theme Switching
  =============================== */
  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  themeToggle.addEventListener("click", () => {
    const light = html.getAttribute("data-theme") === "light";
    html.setAttribute("data-theme", light ? "dark" : "light");
    themeToggle.textContent = light ? "Dark" : "Light";
  });


  /* ===============================
     Date Size Slider
  =============================== */
  const dateSizeRange = document.getElementById("dateSizeRange");
  const dateSizeVal = document.getElementById("dateSizeVal");

  const applyDateSize = v => {
    document.documentElement.style.setProperty("--date-size", v + "px");
    dateSizeVal.textContent = v;
  };
  dateSizeRange.addEventListener("input", () => applyDateSize(dateSizeRange.value));
  applyDateSize(dateSizeRange.value);


  /* ===============================
     Calendar Rendering
  =============================== */
  const titleText = document.getElementById("titleText");
  const weekdaysEl = document.getElementById("weekdays");
  const gridEl = document.getElementById("grid");
  const monthSelect = document.getElementById("monthSelect");
  const yearSelect = document.getElementById("yearSelect");
  const todayBtn = document.getElementById("todayBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pickedEl = document.getElementById("picked");

  const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  let current = new Date();

  function renderWeekdays() {
    weekdaysEl.innerHTML = "";
    WEEKDAYS.forEach(d => {
      const div = document.createElement("div");
      div.className = "weekday";
      div.textContent = d;
      weekdaysEl.appendChild(div);
    });
  }

  function updateTitle() {
    const m = current.getMonth();
    const y = current.getFullYear();
    const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    titleText.textContent = `${names[m]} ${y}`;
  }

  function renderCalendarGrid() {
    gridEl.innerHTML = "";
    const y = current.getFullYear();
    const m = current.getMonth();
    const first = new Date(y, m, 1);
    const start = first.getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < start; i++) {
      gridEl.appendChild(document.createElement("div"));
    }

    for (let d = 1; d <= days; d++) {
      const date = new Date(y, m, d);
      const cell = document.createElement("div");
      cell.className = "cell";

      const num = document.createElement("div");
      num.className = "date-num";
      num.textContent = d;

      cell.appendChild(num);

      if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      ) {
        cell.classList.add("today");
      }

      cell.addEventListener("click", () => {
        document.querySelectorAll(".cell.selected").forEach(c => c.classList.remove("selected"));
        cell.classList.add("selected");
        pickedEl.textContent = date.toISOString().split("T")[0];
      });

      gridEl.appendChild(cell);
    }
  }

  monthSelect.addEventListener("change", () => {
    current.setMonth(parseInt(monthSelect.value));
    updateTitle();
    renderCalendarGrid();
  });

  yearSelect.addEventListener("change", () => {
    current.setFullYear(parseInt(yearSelect.value));
    updateTitle();
    renderCalendarGrid();
  });

  prevBtn.addEventListener("click", () => {
    current.setMonth(current.getMonth() - 1);
    monthSelect.value = current.getMonth();
    yearSelect.value = current.getFullYear();
    updateTitle();
    renderCalendarGrid();
  });

  nextBtn.addEventListener("click", () => {
    current.setMonth(current.getMonth() + 1);
    monthSelect.value = current.getMonth();
    yearSelect.value = current.getFullYear();
    updateTitle();
    renderCalendarGrid();
  });

  todayBtn.addEventListener("click", () => {
    current = new Date();
    monthSelect.value = current.getMonth();
    yearSelect.value = current.getFullYear();
    updateTitle();
    renderCalendarGrid();
  });

  function initCalendar() {
    renderWeekdays();
    updateTitle();

    const thisYear = current.getFullYear();
    for (let y = thisYear - 3; y <= thisYear + 3; y++) {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    }
    yearSelect.value = thisYear;

    const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    names.forEach((name, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = name;
      monthSelect.appendChild(opt);
    });
    monthSelect.value = current.getMonth();

    renderCalendarGrid();
  }

  initCalendar();


  /* ===============================
     Modal
  =============================== */
  const newEventBtn = document.getElementById("newEventBtn");
  const overlay = document.getElementById("eventModalOverlay");
  const closeModal = document.getElementById("closeEventModal");

  newEventBtn.addEventListener("click", () => overlay.classList.remove("hidden"));
  closeModal.addEventListener("click", () => overlay.classList.add("hidden"));

  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.classList.add("hidden");
  });

  document.getElementById("eventForm").addEventListener("submit", e => {
    e.preventDefault();
    overlay.classList.add("hidden");
  });

  /* ===============================
     Tag Sidebar
  =============================== */
  const tagCheckboxes = document.querySelectorAll("[data-tag-filter]");

  tagCheckboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      console.log(
        "Active tags:",
        [...tagCheckboxes].filter(x => x.checked).map(x => x.dataset.tagFilter)
      );
    });
  });

});
