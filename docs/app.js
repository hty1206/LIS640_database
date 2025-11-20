// app.js - Calendar + Tableau + US Holidays (fetch holidays.json)

document.addEventListener("DOMContentLoaded", () => {
  /* ==========================
   * NAV: switch Calendar / Tableau
   * ========================== */
  const views = document.querySelectorAll(".view");
  const calendarView = document.getElementById("view-calendar");
  const tableauView = document.getElementById("view-tableau");
  const navLinks = document.querySelectorAll("a[data-link]");

  function showView(key) {
    views.forEach(v => v.classList.add("hidden"));
    if (key === "tableau") {
      tableauView.classList.remove("hidden");
    } else {
      calendarView.classList.remove("hidden");
    }
  }

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = link.getAttribute("href").slice(1); // "calendar" or "tableau"
      showView(target);
      window.location.hash = target;
    });
  });

  const initialHash = window.location.hash.replace("#", "");
  if (initialHash === "tableau") {
    showView("tableau");
  } else {
    showView("calendar");
  }

  /* ==========================
   * Theme toggle (Dark / Light)
   * ========================== */
  const themeToggleBtn = document.getElementById("themeToggle");
  const rootEl = document.documentElement;

  function applyTheme(theme) {
    if (theme === "light") {
      rootEl.setAttribute("data-theme", "light");
      themeToggleBtn.textContent = "Light";
    } else {
      rootEl.removeAttribute("data-theme");
      themeToggleBtn.textContent = "Dark";
    }
    localStorage.setItem("theme", theme);
  }

  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme =
      rootEl.getAttribute("data-theme") === "light" ? "light" : "dark";
    applyTheme(currentTheme === "light" ? "dark" : "light");
  });

  /* ==========================
   * Date font size control
   * ========================== */
  const dateSizeRange = document.getElementById("dateSizeRange");
  const dateSizeVal = document.getElementById("dateSizeVal");

  function setDateSize(px) {
    dateSizeVal.textContent = px;
    document.documentElement.style.setProperty("--date-size", px + "px");
  }

  setDateSize(dateSizeRange.value);

  dateSizeRange.addEventListener("input", () => {
    setDateSize(dateSizeRange.value);
  });

  /* ==========================
   * Calendar DOM elements
   * ========================== */
  const titleText = document.getElementById("titleText");
  const weekdaysEl = document.getElementById("weekdays");
  const gridEl = document.getElementById("grid");
  const pickedEl = document.getElementById("picked");

  const todayBtn = document.getElementById("todayBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const monthSelect = document.getElementById("monthSelect");
  const yearSelect = document.getElementById("yearSelect");

  const tagCheckboxes = document.querySelectorAll("input[data-tag-filter]");

  // Modal & form elements
  const overlay = document.getElementById("eventModalOverlay");
  const newEventBtn = document.getElementById("newEventBtn");
  const closeEventModal = document.getElementById("closeEventModal");
  const eventForm = document.getElementById("eventForm");

  const titleInput = document.getElementById("eventTitle");
  const dateInput = document.getElementById("eventDate");
  const startInput = document.getElementById("eventStart");
  const endInput = document.getElementById("eventEnd");
  const locationInput = document.getElementById("eventLocation");
  const tagSelect = document.getElementById("eventCal");

  // Weekday header
  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  weekdaysEl.innerHTML = "";
  weekdayNames.forEach(name => {
    const div = document.createElement("div");
    div.textContent = name;
    weekdaysEl.appendChild(div);
  });

  // Month names (used by header and selects)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  // Current view month (always set to day = 1)
  let current = new Date();
  current = new Date(current.getFullYear(), current.getMonth(), 1);

  /* ==========================
   * Event data: from holidays.json + user-created events
   * ========================== */

  // Events loaded from holidays.json (federal holidays)
  let baseEvents = [];

  // Events created by the user via the form
  let userEvents = [];

  function getAllEvents() {
    return [...baseEvents, ...userEvents];
  }

  function getActiveTags() {
    return [...tagCheckboxes]
      .filter(cb => cb.checked)
      .map(cb => cb.dataset.tagFilter);
  }

  /* ==========================
   * Calendar rendering
   * ========================== */
  function formatDateYMD(y, mIndex, d) {
    const mm = String(mIndex + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  }

  function renderCalendarGrid() {
    gridEl.innerHTML = "";

    const year = current.getFullYear();
    const month = current.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    titleText.textContent = `${monthNames[month]} ${year}`;

    if (monthSelect) monthSelect.value = String(month);
    if (yearSelect) yearSelect.value = String(year);

    const activeTags = getActiveTags();
    const allEvents = getAllEvents();

    // Leading empty cells before day 1
    for (let i = 0; i < startWeekday; i++) {
      gridEl.appendChild(document.createElement("div"));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDateYMD(year, month, d);
      const cellDate = new Date(year, month, d);

      const cell = document.createElement("div");
      cell.classList.add("cell");

      const dateNum = document.createElement("div");
      dateNum.classList.add("date-num");
      dateNum.textContent = d;
      cell.appendChild(dateNum);

      // Events for this day (with tag filtering)
      const eventsForDay = allEvents.filter(ev => {
        if (ev.date !== dateStr) return false;
        if (!ev.tag) return true;
        return activeTags.includes(ev.tag);
      });

      if (eventsForDay.length > 0) {
        cell.classList.add("has-event");

        const list = document.createElement("ul");
        list.classList.add("event-list");

        eventsForDay.forEach(ev => {
          const li = document.createElement("li");
          li.textContent = ev.title;
          li.classList.add("event-pill");
          li.setAttribute("data-full-title", ev.title);   // ← add tooltip data
          if (ev.tag) {
            li.classList.add(
              "tag-" + ev.tag.replace(/\s+/g, "-").toLowerCase()
            );
          }
          list.appendChild(li);
        });

        cell.appendChild(list);
      }

      // Mark today
      if (
        cellDate.getFullYear() === today.getFullYear() &&
        cellDate.getMonth() === today.getMonth() &&
        cellDate.getDate() === today.getDate()
      ) {
        cell.classList.add("today");
      }

      // Click cell: select date and update footer
      cell.addEventListener("click", () => {
        document
          .querySelectorAll(".cell.selected")
          .forEach(c => c.classList.remove("selected"));
        cell.classList.add("selected");
        pickedEl.textContent = dateStr;
      });

      gridEl.appendChild(cell);
    }

    // If current view month is this month, show today's date in the footer
    if (
      today.getFullYear() === year &&
      today.getMonth() === month
    ) {
      pickedEl.textContent = formatDateYMD(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
    }
  }

  /* ==========================
   * Month / Year select initialization
   * ========================== */
  function initMonthYearSelectors() {
    if (!monthSelect || !yearSelect) return;

    monthSelect.innerHTML = "";
    monthNames.forEach((name, idx) => {
      const opt = document.createElement("option");
      opt.value = String(idx);
      opt.textContent = name;
      monthSelect.appendChild(opt);
    });

    // Year range (match years covered in holidays.json)
    yearSelect.innerHTML = "";
    for (let y = 2022; y <= 2028; y++) {
      const opt = document.createElement("option");
      opt.value = String(y);
      opt.textContent = String(y);
      yearSelect.appendChild(opt);
    }

    monthSelect.value = String(current.getMonth());
    yearSelect.value = String(current.getFullYear());
  }

  /* ==========================
   * Navigation: previous / next / today
   * ========================== */
  todayBtn.addEventListener("click", () => {
    const now = new Date();
    current = new Date(now.getFullYear(), now.getMonth(), 1);
    renderCalendarGrid();
  });

  prevBtn.addEventListener("click", () => {
    current = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    renderCalendarGrid();
  });

  nextBtn.addEventListener("click", () => {
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    renderCalendarGrid();
  });

  monthSelect.addEventListener("change", () => {
    const y = current.getFullYear();
    const m = parseInt(monthSelect.value, 10);
    current = new Date(y, m, 1);
    renderCalendarGrid();
  });

  yearSelect.addEventListener("change", () => {
    const y = parseInt(yearSelect.value, 10);
    const m = current.getMonth();
    current = new Date(y, m, 1);
    renderCalendarGrid();
  });

  /* ==========================
   * Tag checkboxes -> re-render calendar
   * ========================== */
  tagCheckboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      renderCalendarGrid();
    });
  });

  /* ==========================
   * Modal: create new event
   * ========================== */
  function openEventModal(defaultDate) {
    if (defaultDate) {
      dateInput.value = defaultDate;
    } else {
      const pickedText = pickedEl.textContent;
      if (pickedText && pickedText !== "—") {
        dateInput.value = pickedText;
      } else {
        const now = new Date();
        dateInput.value = formatDateYMD(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
      }
    }
    overlay.classList.remove("hidden");
    titleInput.focus();
  }

  function closeEventModalFn() {
    overlay.classList.add("hidden");
  }

  newEventBtn.addEventListener("click", () => {
    openEventModal();
  });

  closeEventModal.addEventListener("click", () => {
    closeEventModalFn();
  });

  overlay.addEventListener("click", e => {
    if (e.target === overlay) {
      closeEventModalFn();
    }
  });

  eventForm.addEventListener("submit", e => {
    e.preventDefault();

    if (!titleInput.value || !dateInput.value) {
      alert("Please enter at least Title and Date.");
      return;
    }

    userEvents.push({
      date: dateInput.value,
      title: titleInput.value,
      start: startInput.value || null,
      end: endInput.value || null,
      location: locationInput.value || null,
      tag: tagSelect.value || null
    });

    eventForm.reset();
    closeEventModalFn();
    renderCalendarGrid();
  });

  /* ==========================
   * Load Holiday events from holidays.json
   * ========================== */
  function loadHolidays() {
    fetch("holidays.json")
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to load holidays.json: " + res.status);
        }
        return res.json();
      })
      .then(data => {
        // holidays.json should be an array of objects with date / title / tag
        if (Array.isArray(data)) {
          baseEvents = data;
        } else {
          baseEvents = [];
        }
        renderCalendarGrid();
      })
      .catch(err => {
        console.error("Error loading holidays.json:", err);
        baseEvents = [];
        renderCalendarGrid();
      });
  }

  /* ==========================
   * Initialization
   * ========================== */
  initMonthYearSelectors();
  loadHolidays(); // After holidays are loaded, render calendar including Holiday events
});