document.addEventListener("DOMContentLoaded", () => {
  // ===== Basic DOM references =====
  const views = document.querySelectorAll(".view");
  const navLinks = document.querySelectorAll("[data-link]");
  const themeToggle = document.getElementById("themeToggle");

  const titleText = document.getElementById("titleText");
  const weekdaysEl = document.getElementById("weekdays");
  const gridEl = document.getElementById("grid");
  const pickedEl = document.getElementById("picked");
  // 🔍 Search bar + results
  const eventSearchInput = document.getElementById("eventSearchInput");
  const eventSearchButton = document.getElementById("eventSearchButton");
  const clearSearchButton = document.getElementById("clearSearchButton");
  const searchResultsEl = document.getElementById("searchResults");

  const todayBtn = document.getElementById("todayBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const monthSelect = document.getElementById("monthSelect");
  const yearSelect = document.getElementById("yearSelect");

  const dateSizeRange = document.getElementById("dateSizeRange");
  const dateSizeVal = document.getElementById("dateSizeVal");

  const newEventBtn = document.getElementById("newEventBtn");
  // 日期區間篩選（放在 Tag 區塊）
  const rangeStartInput = document.getElementById("rangeStart");
  const rangeEndInput = document.getElementById("rangeEnd");
  const clearRangeBtn = document.getElementById("clearRangeBtn");

  // Create Event modal
  const eventModalOverlay = document.getElementById("eventModalOverlay");
  const closeEventModalBtn = document.getElementById("closeEventModal");
  const eventForm = document.getElementById("eventForm");
  const eventTitleInput = document.getElementById("eventTitle");
  const eventDateInput = document.getElementById("eventDate");
  const eventStartInput = document.getElementById("eventStart");
  const eventEndInput = document.getElementById("eventEnd");
  const eventLocationInput = document.getElementById("eventLocation");
  const tagSelect = document.getElementById("eventCal");

  // Event detail modal elements
  const detailOverlay = document.getElementById("eventDetailOverlay");
  const detailTitleEl = document.getElementById("detailTitle");
  const detailDateEl = document.getElementById("detailDate");
  const detailTagEl = document.getElementById("detailTag");
  const detailTimeEl = document.getElementById("detailTime");
  const detailLocationEl = document.getElementById("detailLocation");
  const detailTimeRow = document.getElementById("detailTimeRow");
  const detailLocationRow = document.getElementById("detailLocationRow");
  const closeDetailModalBtn = document.getElementById("closeDetailModal");
  const detailDescEl = document.getElementById("detailDesc");
  const detailDescRow = document.getElementById("detailDescRow");
  const detailSportEl = document.getElementById("detailSport");
  const detailSportRow = document.getElementById("detailSportRow");
  // Day events modal (點整個日期格 / +N more 用)
  const dayEventsOverlay = document.getElementById("dayEventsOverlay");
  const dayEventsTitleEl = document.getElementById("dayEventsTitle");
  const dayEventsListEl = document.getElementById("dayEventsList");
  const closeDayEventsModalBtn = document.getElementById("closeDayEventsModal");

  // Tag filters (sidebar)
  const tagFilterInputs = document.querySelectorAll("[data-tag-filter]");

  // ===== State =====
  const today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth(); // 0-based
  let selectedDate = formatDate(today);

  let holidays = [];      // from holidays.json
  let userEvents = [];    // created via modal
  let weatherEvents = []; // from ACIS weather APIs
  let sportsEvents = [];  // 從 sports_events.json 來的運動賽事

  // 每天在 cell 裡最多顯示幾筆事件
  const MAX_EVENTS_PER_DAY = 3;

  // 日期篩選狀態（"YYYY-MM-DD" 字串，或者 null 表示沒有限制）
  let dateFilterStart = null;
  let dateFilterEnd = null;

  // Selected tag filters
  const selectedTags = new Set(
    Array.from(tagFilterInputs)
      .filter((el) => el.checked)
      .map((el) => el.dataset.tagFilter)
  );

  // ===== Utility: date helpers =====
  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function formatDate(dateObj) {
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(
      dateObj.getDate()
    )}`;
  }

  // Add event listener for the "Previous Month" button
  prevBtn.addEventListener("click", () => {
    if (currentMonth === 0) {
      currentMonth = 11; // Wrap around to December
      currentYear -= 1; // Go back one year
    } else {
      currentMonth -= 1; // Go to the previous month
    }

    renderCalendarGrid(); // Re-render calendar with the new month and year
    titleText.textContent = `${monthNames[currentMonth]} ${currentYear}`; // Update the month/year display
    monthSelect.value = currentMonth; // Update the month dropdown
    yearSelect.value = currentYear; // Update the year dropdown
  });

  // Add event listener for the "Next Month" button
  nextBtn.addEventListener("click", () => {
    if (currentMonth === 11) {
      currentMonth = 0; // Wrap around to January
      currentYear += 1; // Go forward one year
    } else {
      currentMonth += 1; // Go to the next month
    }

    renderCalendarGrid(); // Re-render calendar with the new month and year
    titleText.textContent = `${monthNames[currentMonth]} ${currentYear}`; // Update the month/year display
    monthSelect.value = currentMonth; // Update the month dropdown
    yearSelect.value = currentYear; // Update the year dropdown
  });

  // Add event listeners for month and year changes
  monthSelect.addEventListener("change", (e) => {
    currentMonth = parseInt(e.target.value); // Update current month
    renderCalendarGrid(); // Re-render calendar with the new month
  });

  yearSelect.addEventListener("change", (e) => {
    currentYear = parseInt(e.target.value); // Update current year
    renderCalendarGrid(); // Re-render calendar with the new year
  });

  // ===== Add event listener for the "Today" button =====
  todayBtn.addEventListener("click", () => {
    const today = new Date();
    currentMonth = today.getMonth(); // Set current month to today's month
    currentYear = today.getFullYear(); // Set current year to today's year
    selectedDate = formatDate(today); // Set the selected date to today's date

    renderCalendarGrid(); // Re-render the calendar grid with today's date
    pickedEl.textContent = selectedDate; // Update the "picked" section with today's date

    // Update the right top section (Month and Year display)
    const monthNames = [
      "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];
    titleText.textContent = `${monthNames[currentMonth]} ${currentYear}`; // Update month and year display

    // Update the month and year selects to reflect today's date
    monthSelect.value = currentMonth; // Set the current month in the dropdown
    yearSelect.value = currentYear; // Set the current year in the dropdown
  });


  // 根據事件 title 判斷是什麼球類，回傳對應的 icon
  function getSportIconForEvent(ev) {
    const title = (ev.title || "").toLowerCase();

    if (title.includes("basketball")) return "🏀";
    if (title.includes("hockey")) return "🏒";
    if (title.includes("football")) return "🏈";
    if (title.includes("volleyball")) return "🏐";
    if (title.includes("soccer")) return "⚽️";
    if (title.includes("rowing")) return "🚣";
    if (title.includes("wrestling")) return "🤼";
    if (title.includes("tennis")) return "🎾";
    if (title.includes("swim") || title.includes("diving")) return "🏊";

    // 不在上面幾種就給一個通用的
    return "🏅";
  }

  function formatReadableDateStr(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    return `${monthNames[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
  }

  // ===== View routing (Calendar <-> Tableau) =====
  function showView(name) {
    views.forEach((v) => {
      if (v.id === `view-${name}`) {
        v.classList.remove("hidden");
      } else {
        v.classList.add("hidden");
      }
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("href").replace("#", "");
      showView(target);
    });
  });

  // Default: calendar
  showView("calendar");

  // ===== Theme toggle =====
  function applyTheme(theme) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      themeToggle.textContent = "Light";
    } else {
      document.documentElement.removeAttribute("data-theme");
      themeToggle.textContent = "Dark";
    }
  }

  const storedTheme = localStorage.getItem("dtp-theme");
  if (storedTheme) {
    applyTheme(storedTheme);
  } else {
    applyTheme("dark");
  }

  themeToggle.addEventListener("click", () => {
    const isLight =
      document.documentElement.getAttribute("data-theme") === "light";
    const newTheme = isLight ? "dark" : "light";
    applyTheme(newTheme);
    localStorage.setItem("dtp-theme", newTheme);
  });

  // ===== Date size slider =====
  function updateDateSize(val) {
    dateSizeVal.textContent = val;
    document.documentElement.style.setProperty("--date-size", `${val}px`);
  }

  updateDateSize(dateSizeRange.value);

  dateSizeRange.addEventListener("input", (e) => {
    updateDateSize(e.target.value);
  });

  // 更新日期篩選條件（從右側 Tag 區塊的 input 抓值）
  function updateDateRangeFromInputs() {
    if (!rangeStartInput || !rangeEndInput) return;

    let startVal = rangeStartInput.value || null; // "YYYY-MM-DD" 或 null
    let endVal = rangeEndInput.value || null;

    dateFilterStart = startVal;
    dateFilterEnd = endVal;

    // 如果使用者填反（結束 < 開始），自動交換
    if (dateFilterStart && dateFilterEnd && dateFilterEnd < dateFilterStart) {
      const tmp = dateFilterStart;
      dateFilterStart = dateFilterEnd;
      dateFilterEnd = tmp;

      rangeStartInput.value = dateFilterStart;
      rangeEndInput.value = dateFilterEnd;
    }

    renderCalendarGrid();
  }

  // 監聽 input change
  if (rangeStartInput && rangeEndInput) {
    rangeStartInput.addEventListener("change", updateDateRangeFromInputs);
    rangeEndInput.addEventListener("change", updateDateRangeFromInputs);
  }

  // 清除篩選
  if (clearRangeBtn) {
    clearRangeBtn.addEventListener("click", () => {
      dateFilterStart = null;
      dateFilterEnd = null;
      rangeStartInput.value = "";
      rangeEndInput.value = "";
      renderCalendarGrid();
    });
  }

  // ===== Weekdays header =====
  function renderWeekdays() {
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekdaysEl.innerHTML = "";
    names.forEach((name) => {
      const div = document.createElement("div");
      div.className = "weekday";
      div.textContent = name;
      weekdaysEl.appendChild(div);
    });
  }

  // ===== Month / Year selects =====
  function populateMonthYearSelects() {
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
      "December",
    ];

    monthSelect.innerHTML = "";
    monthNames.forEach((name, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = name;
      if (idx === currentMonth) opt.selected = true;
      monthSelect.appendChild(opt);
    });

    // 2020–2028 cover your holidays.json and weather range
    yearSelect.innerHTML = "";
    for (let y = 2020; y <= 2028; y++) {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      if (y === currentYear) opt.selected = true;
      yearSelect.appendChild(opt);
    }
  }

  // ===== Event Detail Modal =====
  function openEventDetailModal(ev, dateStr) {
    // ====== 標題：Sports 事件加上 icon ======
    let title = ev.title || "(No title)";

    if (ev.tag === "Sports Events") {
      const icon = getSportIconForEvent(ev);  // 👈 使用剛剛建立的函數
      title = `${icon} ${title}`;
    }

    detailTitleEl.textContent = title;
    detailDateEl.textContent = dateStr || ev.date || "—";
    detailTagEl.textContent = ev.tag || "—";

    // ===== Time =====
    if (ev.start || ev.end) {
      const start = ev.start || "";
      const end = ev.end || "";
      detailTimeEl.textContent =
        start && end ? `${start} – ${end}` : start || end;
      detailTimeRow.style.display = "";
    } else {
      detailTimeRow.style.display = "none";
      detailTimeEl.textContent = "";
    }

    // Location
    if (ev.location) {
      detailLocationEl.textContent = ev.location;
      detailLocationRow.style.display = "";
    } else {
      detailLocationRow.style.display = "none";
      detailLocationEl.textContent = "";
    }

    // Description (支援超連結)
    if (ev.description) {
      detailDescEl.innerHTML = linkify(ev.description);
      detailDescRow.style.display = "";
    } else {
      detailDescRow.style.display = "none";
      detailDescEl.innerHTML = "";
    }

    // Sport type row（如果你有這一區）
    if (ev.sport) {
      detailSportEl.textContent = ev.sport;
      detailSportRow.style.display = "";
    } else {
      detailSportRow.style.display = "none";
      detailSportEl.textContent = "";
    }

    detailOverlay.classList.remove("hidden");
  }

  function closeEventDetailModal() {
    detailOverlay.classList.add("hidden");
  }

  closeDetailModalBtn.addEventListener("click", closeEventDetailModal);

  detailOverlay.addEventListener("click", (e) => {
    if (e.target === detailOverlay) {
      closeEventDetailModal();
    }
  });

  function openDayEventsModal(dateStr) {
    const events = getEventsForDate(dateStr) || [];
    dayEventsTitleEl.textContent =
      `${formatReadableDateStr(dateStr)} (${events.length} events)`;

    dayEventsListEl.innerHTML = "";

    if (!events.length) {
      const li = document.createElement("li");
      li.textContent = "No events on this day.";
      dayEventsListEl.appendChild(li);
    } else {
      events.forEach((ev) => {
        const li = document.createElement("li");
        li.classList.add("day-event-item");

        const tagPart = ev.tag ? `[${ev.tag}] ` : "";
        let titleText = ev.title || "(No title)";

        if (ev.tag === "Sports Events") {
          const icon = getSportIconForEvent(ev);
          titleText = `${icon} ${titleText}`;
        }

        li.textContent = `${tagPart}${titleText}`;

        li.addEventListener("click", () => {
          closeDayEventsModal();
          openEventDetailModal(ev, dateStr);
        });

        dayEventsListEl.appendChild(li);
      });
    }

    dayEventsOverlay.classList.remove("hidden");
  }

  function closeDayEventsModal() {
    dayEventsOverlay.classList.add("hidden");
  }

  closeDayEventsModalBtn.addEventListener("click", closeDayEventsModal);

  dayEventsOverlay.addEventListener("click", (e) => {
    if (e.target === dayEventsOverlay) {
      closeDayEventsModal();
    }
  });

  // ===== Create Event Modal =====
  function openEventModal() {
    // Default date = currently selected date (or today)
    eventDateInput.value = selectedDate || formatDate(today);
    eventTitleInput.value = "";
    eventStartInput.value = "";
    eventEndInput.value = "";
    eventLocationInput.value = "";
    tagSelect.value = "Academic Calendar";
    eventModalOverlay.classList.remove("hidden");
  }

  function closeEventModal() {
    eventModalOverlay.classList.add("hidden");
  }

  newEventBtn.addEventListener("click", openEventModal);
  closeEventModalBtn.addEventListener("click", closeEventModal);

  eventModalOverlay.addEventListener("click", (e) => {
    if (e.target === eventModalOverlay) {
      closeEventModal();
    }
  });

  // Submit new event
  eventForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = eventTitleInput.value.trim();
    const date = eventDateInput.value;
    const start = eventStartInput.value;
    const end = eventEndInput.value;
    const location = eventLocationInput.value.trim();
    const tag = tagSelect.value;

    if (!title || !date) {
      alert("Title and Date are required.");
      return;
    }

    userEvents.push({
      id: Date.now(),
      title,
      date,
      start,
      end,
      location,
      tag,
    });

    closeEventModal();
    renderCalendarGrid();
  });

  // ===== Tag filter behavior =====
  tagFilterInputs.forEach((input) => {
    input.addEventListener("change", () => {
      const tag = input.dataset.tagFilter;
      if (input.checked) {
        selectedTags.add(tag);
      } else {
        selectedTags.delete(tag);
      }
      renderCalendarGrid();
    });
  });

  // ===== Calendar rendering =====
  function updateTitleAndPicked() {
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
      "December",
    ];
    titleText.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    pickedEl.textContent = selectedDate || "—";
  }

  // 把所有事件合在一起（給搜尋 & getEventsForDate 共用）
  function getAllEventsArray() {
    return [
      ...holidays,
      ...userEvents,
      ...weatherEvents,
      ...sportsEvents,
    ];
  }

  function getEventsForDate(dateStr) {
    const allEvents = getAllEventsArray();
    return allEvents.filter(
      (ev) => ev.date === dateStr && selectedTags.has(ev.tag)
    );
  }

  // 判斷某天是否落在 dateFilterStart ~ dateFilterEnd 之間
  function isDateInFilterRange(dateStr) {
    // 沒有設定任何範圍 => 全部顯示
    if (!dateFilterStart && !dateFilterEnd) return true;

    if (dateFilterStart && dateStr < dateFilterStart) return false;
    if (dateFilterEnd && dateStr > dateFilterEnd) return false;

    return true;
  }

  function renderCalendarGrid() {
    // Clear the previous calendar cells
    gridEl.innerHTML = "";

    updateTitleAndPicked(); // Update the month/year title and the selected date label

    const firstDay = new Date(currentYear, currentMonth, 1);
    const startWeekday = firstDay.getDay(); // 0–6 (Sun to Sat)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Number of days in the month

    const totalCells = startWeekday + daysInMonth;

    for (let cellIndex = 0; cellIndex < totalCells; cellIndex++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      if (cellIndex < startWeekday) {
        // Add empty cells for the first week if the month doesn't start on Sunday
        cell.classList.add("empty");
        gridEl.appendChild(cell);
        continue;
      }

      const dateNumber = cellIndex - startWeekday + 1;
      const dateObj = new Date(currentYear, currentMonth, dateNumber);
      const dateStr = formatDate(dateObj);

      const dateNumEl = document.createElement("div");
      dateNumEl.className = "date-num";
      dateNumEl.textContent = dateNumber;
      cell.appendChild(dateNumEl);

      const list = document.createElement("ul");
      list.className = "event-list";
      cell.appendChild(list);

      // Highlight today's date
      if (
        dateObj.getFullYear() === today.getFullYear() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getDate() === today.getDate()
      ) {
        cell.classList.add("today");
      }

      // Highlight selected date
      if (dateStr === selectedDate) {
        cell.classList.add("selected");
      }

      // Filter out dates that are not within the selected date range
      const inRange = isDateInFilterRange(dateStr);
      if (!inRange) {
        // Gray out the cell if it's out of the filter range
        cell.classList.add("out-of-range");
      }

      // Get events for the selected day
      const eventsForDay = inRange ? getEventsForDate(dateStr) : [];
      let eventsToDisplay = eventsForDay;

      // Limit the number of events shown in a day (MAX_EVENTS_PER_DAY)
      if (eventsForDay.length > MAX_EVENTS_PER_DAY) {
        eventsToDisplay = eventsForDay.slice(0, MAX_EVENTS_PER_DAY);
      }

      // Render events for the day
      eventsToDisplay.forEach((ev) => {
        const li = document.createElement("li");
        let text = ev.title || "";
        if (ev.tag === "Sports Events") {
          const icon = getSportIconForEvent(ev);
          text = `${icon} ${text}`;
        }
        li.textContent = text;
        li.classList.add("event-pill");

        // Apply tag color class (e.g., "tag-holiday" for Holiday)
        if (ev.tag) {
          li.classList.add(
            "tag-" + ev.tag.replace(/\s+/g, "-").toLowerCase()
          );
        }

        list.appendChild(li);
      });

      // If there are more events than the max limit, show a "+N more" option
      if (eventsForDay.length > MAX_EVENTS_PER_DAY && inRange) {
        const moreLi = document.createElement("li");
        moreLi.classList.add("event-more-pill");
        moreLi.textContent =
          `+${eventsForDay.length - MAX_EVENTS_PER_DAY} more`;

        moreLi.addEventListener("click", (evt) => {
          evt.stopPropagation();
          openDayEventsModal(dateStr);
        });

        list.appendChild(moreLi);
      }

      // Handle cell click to select the date and open the day events modal
      cell.addEventListener("click", () => {
        selectedDate = dateStr;
        pickedEl.textContent = selectedDate;

        const prevSelected = gridEl.querySelector(".cell.selected");
        if (prevSelected) {
          prevSelected.classList.remove("selected");
        }
        cell.classList.add("selected");

        openDayEventsModal(dateStr);
      });

      gridEl.appendChild(cell);
    }
  }

  // ===== 🔍 Search: 像 Google Calendar 的條列式結果 =====

  // 顯示成「19 OCT 2025, SUN」這種格式
  function formatSearchDateLabel(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const weekdays = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    return `${d} ${months[dt.getMonth()]} ${y}, ${weekdays[dt.getDay()]}`;
  }

  function enterSearchMode(term, events) {
    if (!searchResultsEl) return;

    // 隱藏月曆，顯示搜尋結果清單
    weekdaysEl.classList.add("hidden");
    gridEl.classList.add("hidden");
    searchResultsEl.classList.remove("hidden");

    searchResultsEl.innerHTML = "";

    const summary = document.createElement("div");
    summary.className = "search-summary";
    summary.textContent = `Results for "${term}" (${events.length})`;
    searchResultsEl.appendChild(summary);

    if (events.length === 0) return;

    events.forEach((ev) => {
      const row = document.createElement("div");
      row.className = "search-row";

      const dateDiv = document.createElement("div");
      dateDiv.className = "search-date";
      dateDiv.textContent = formatSearchDateLabel(ev.date);

      const timeDiv = document.createElement("div");
      timeDiv.className = "search-time";
      if (ev.start || ev.end) {
        const s = ev.start || "";
        const e = ev.end || "";
        timeDiv.textContent = s && e ? `${s} – ${e}` : (s || e);
      } else {
        timeDiv.textContent = "All day";
      }

      const titleDiv = document.createElement("div");
      titleDiv.className = "search-title";

      let titleText = ev.title || "";
      if (ev.tag === "Sports Events") {
        const icon = getSportIconForEvent(ev);
        titleText = `${icon} ${titleText}`;
      }
      titleDiv.textContent = titleText;

      row.appendChild(dateDiv);
      row.appendChild(timeDiv);
      row.appendChild(titleDiv);

      // 點整列 -> 打開事件詳細
      row.addEventListener("click", () => {
        openEventDetailModal(ev, ev.date);
      });

      searchResultsEl.appendChild(row);
    });

    titleText.textContent = `Search: "${term}"`;
  }

  function exitSearchMode() {
    if (!searchResultsEl) return;
    searchResultsEl.classList.add("hidden");
    searchResultsEl.innerHTML = "";
    weekdaysEl.classList.remove("hidden");
    gridEl.classList.remove("hidden");
    if (eventSearchInput) eventSearchInput.value = "";
    renderCalendarGrid();
  }

  function handleSearch() {
    const term = eventSearchInput.value.trim();
    if (!term) {
      exitSearchMode();
      return;
    }

    const allEvents = getAllEventsArray();
    const filteredEvents = allEvents.filter(ev =>
      ev.title.toLowerCase().includes(term.toLowerCase())
    );

    enterSearchMode(term, filteredEvents);
  }


  if (eventSearchButton) {
    eventSearchButton.addEventListener("click", handleSearch);
  }
  if (eventSearchInput) {
    eventSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    });
  }
  if (clearSearchButton) {
    clearSearchButton.addEventListener("click", exitSearchMode);
  }

  // ===== Holidays data (holidays.json) =====
  fetch("holidays.json")
    .then((res) => res.json())
    .then((data) => {
      holidays = data || [];
      renderCalendarGrid();
    })
    .catch((err) => {
      console.error("Failed to load holidays.json:", err);
      renderCalendarGrid();
    });

  // ===== Weather data (ACIS APIs, from 2020) =====

  // Temperature (average / max / min)
  const WEATHER_URL =
    "https://data.rcc-acis.org/StnData?sid=MSNthr&sdate=2020-01-01&edate=por&elems=avgt,maxt,mint&output=csv";

  // Daily precipitation
  const PRECIP_URL =
    "https://data.rcc-acis.org/StnData?sid=MSNthr&sdate=2020-01-01&edate=por&elems=pcpn&output=csv";

  // Parse temperature CSV: date,avgt,maxt,mint
  function parseWeatherCsv(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    const events = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Skip header line, e.g., "Madison Area"
      if (!/^\d{4}-\d{2}-\d{2}/.test(line)) continue;

      const cols = line.split(",");
      if (cols.length < 4) continue;

      const dateStr = cols[0]; // YYYY-MM-DD
      const avgt = cols[1];
      const maxt = cols[2];
      const mint = cols[3];

      // Keep only data from 2020-01-01 onward
      if (dateStr < "2020-01-01") continue;

      events.push({
        date: dateStr,
        title: `Avg ${avgt}°F (H ${maxt}° / L ${mint}°)`,
        tag: "Weather",
        location: "Madison Area",
        avgt,
        maxt,
        mint,
      });
    }

    return events;
  }

  function inferSportFromTitle(title) {
    const t = title.toLowerCase();

    if (t.includes("football")) return "Football";
    if (t.includes("men's basketball")) return "Men's Basketball";
    if (t.includes("women's basketball")) return "Women's Basketball";
    if (t.includes("basketball")) return "Basketball";

    if (t.includes("men's hockey")) return "Men's Hockey";
    if (t.includes("women's hockey")) return "Women's Hockey";
    if (t.includes("hockey")) return "Hockey";

    if (t.includes("volleyball")) return "Volleyball";
    if (t.includes("wrestling")) return "Wrestling";
    if (t.includes("soccer")) return "Soccer";
    if (t.includes("rowing")) return "Rowing";

    if (t.includes("swimming & diving")) return "Swimming & Diving";
    if (t.includes("tennis")) return "Tennis";

    // 找不到就回傳 Unknown，之後可以慢慢補規則
    return "Unknown";
  }

  // ===== Sports Events data =====
  async function loadSportsEvents() {
    try {
      const res = await fetch("./sports_events.json");
      const data = await res.json();

      sportsEvents = data.map(ev => ({
        ...ev,
        sport: inferSportFromTitle(ev.title || "")
      }));

      console.log("✅ Sports events loaded:", sportsEvents.length);
      renderCalendarGrid();
    } catch (err) {
      console.error("Failed to load sports events", err);
    }
  }

  // 像 Google Calendar 一樣顯示 description：
  // - 保留原本每一行
  // - 把網址變成可點的 <a>
  // - 換行用 <br>
  function linkify(text) {
    if (!text) return "";

    // 清掉 .NET Task 鬼字串（保險）
    text = text.replace(/System\.Threading\.Tasks\.Task`1\[System\.String\]/g, "");

    // 1. HTML escape
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 2. 先把網址變 <a>，顯示完整 URL
    const urlPattern = /(https?:\/\/\S+)/g;
    escaped = escaped.replace(urlPattern, (url) => {
      const safeUrl = url.replace(/"/g, "&quot;");
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    // 3. 再把換行變成 <br>
    escaped = escaped.replace(/\n/g, "<br>");

    return escaped;
  }

  // Parse precipitation CSV: date,pcpn
  function parsePrecipCsv(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    const events = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Skip header line, e.g., "Madison Area"
      if (!/^\d{4}-\d{2}-\d{2}/.test(line)) continue;

      const cols = line.split(",");
      if (cols.length < 2) continue;

      const dateStr = cols[0];
      const pcpn = cols[1]; // daily precipitation (inches)

      // Keep only data from 2020-01-01 onward
      if (dateStr < "2020-01-01") continue;

      events.push({
        date: dateStr,
        title: `Precip ${pcpn} in`,
        tag: "Weather",
        location: "Madison Area",
        pcpn,
      });
    }

    return events;
  }

  // Fetch temperature CSV
  fetch(WEATHER_URL)
    .then((res) => res.text())
    .then((csv) => {
      const tempEvents = parseWeatherCsv(csv);
      weatherEvents = weatherEvents.concat(tempEvents);
      console.log("✅ Temperature weather events loaded:", tempEvents.length);
      renderCalendarGrid();
    })
    .catch((err) => {
      console.error("❌ Failed to load temperature weather data:", err);
    });

  // Fetch precipitation CSV
  fetch(PRECIP_URL)
    .then((res) => res.text())
    .then((csv) => {
      const precipEvents = parsePrecipCsv(csv);
      weatherEvents = weatherEvents.concat(precipEvents);
      console.log("✅ Precipitation weather events loaded:", precipEvents.length);
      renderCalendarGrid();
    })
    .catch((err) => {
      console.error("❌ Failed to load precipitation weather data:", err);
    });

  // ===== Initial setup =====
  renderWeekdays();
  populateMonthYearSelects();

  // 先畫一版（只有 holidays + weather + userEvents）
  renderCalendarGrid();

  // 再非同步載入 Sports，載完會自己呼叫 renderCalendarGrid()
  loadSportsEvents();
});
