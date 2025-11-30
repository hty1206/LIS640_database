document.addEventListener("DOMContentLoaded", async () => {
  // Base URL for backend API
  // - Local dev (http://localhost:3000): use same origin => ""
  // - On GitHub Pages: replace with your Render backend URL
  const API_BASE_URL =
    location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://data-tagging-project.onrender.com";

  // ===== Basic DOM references =====
  const views = document.querySelectorAll(".view");
  const navLinks = document.querySelectorAll("[data-link]");
  const themeToggle = document.getElementById("themeToggle");

  const titleText = document.getElementById("titleText");
  const weekdaysEl = document.getElementById("weekdays");
  const gridEl = document.getElementById("grid");
  const pickedEl = document.getElementById("picked");

  // Search bar + results
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
  
  // Date range filter (inside Tag sidebar)
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
  const eventSportInput = document.getElementById("eventSport");
  const eventDetailsInput = document.getElementById("eventDetails");

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

  // Day events modal (for clicking entire day or "+N more")
  const dayEventsOverlay = document.getElementById("dayEventsOverlay");
  const dayEventsTitleEl = document.getElementById("dayEventsTitle");
  const dayEventsListEl = document.getElementById("dayEventsList");
  const closeDayEventsModalBtn = document.getElementById("closeDayEventsModal");

  // === Show / hide Sport & Details fields when tag is "Sports Events" ===
  // Dropdown for selecting event tag
  const eventCalSelect = document.getElementById('eventCal');

  // All fields that should appear only for sports events
  const sportOnlyFields = document.querySelectorAll('.sport-only');

  /**
   * Controls visibility of Sport and Details fields
   * - If tag = "Sports Events" → show fields
   * - Otherwise → hide fields and clear values
   */
  function updateSportFieldsVisibility() {
    const isSports = eventCalSelect.value === 'Sports Events';

    sportOnlyFields.forEach((el) => {
      el.classList.toggle('hidden', !isSports);
    });

    // If not Sports Events, clear the optional inputs
    if (!isSports) {
      const sportInput = document.getElementById('eventSport');
      const detailsInput = document.getElementById('eventDetails');

      if (sportInput) sportInput.value = '';
      if (detailsInput) detailsInput.value = '';
    }
  }

  // Run once when modal opens to ensure correct initial state
  updateSportFieldsVisibility();

  // Update fields when tag selection changes
  eventCalSelect.addEventListener('change', updateSportFieldsVisibility);

  // Tag filters (sidebar)
  const tagFilterInputs = document.querySelectorAll("[data-tag-filter]");

  // ===== State =====
  const today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth(); // 0-based
  let selectedDate = formatDate(today);

  let holidays = [];        // Holiday events from holidays.json
  let academicEvents = [];  // Academic events from backend (MySQL)
  let userEvents = [];      // User-created events from backend
  let weatherEvents = [];   // Weather events from ACIS APIs
  let sportsEvents = [];    // Sports events from sports_events.json

  // Normalize various date formats into "YYYY-MM-DD"
  // - ISO format like "2025-11-29T00:00:00.000Z" → "2025-11-29"
  // - Slash format "01/15/2029" → "2029-01-15"
  // - Already correct "2025-11-29" → unchanged
  function normalizeDateString(d) {
    if (!d) return null;

    // If string starts with YYYY-MM-DD, extract first 10 chars
    const isoMatch = d.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) {
      return isoMatch[1];   // Example: "2025-11-29T00:00:00.000Z" → "2025-11-29"
    }

    // Handle MM/DD/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
      const [mm, dd, yyyy] = d.split("/");
      return `${yyyy}-${mm.padStart(2,"0")}-${dd.padStart(2,"0")}`;
    }

    // Otherwise return as-is
    return d;
  }

  // Load user-created events from backend API
  async function loadUserEventsFromServer() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events`);
      if (!res.ok) {
        console.error("Failed to fetch user events:", res.status);
        userEvents = [];
        return;
      }

      const data = await res.json();

      // Normalize date for each event
      userEvents = (Array.isArray(data) ? data : []).map(ev => ({
        ...ev,
        date: normalizeDateString(ev.date),  // Convert "2025-11-29T00:00:00.000Z" → "2025-11-29"
      }));

      console.log("✅ User events loaded:", userEvents.length);
      console.log("Example normalized event:", userEvents[0]);

    } catch (err) {
      console.error("Error loading user events:", err);
      userEvents = [];
    }
  }

  // Load academic events (Categories='Academic') from backend API
  async function loadAcademicEventsFromServer() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/academic-events`);
      if (!res.ok) {
        console.error("Failed to fetch academic events:", res.status);
        academicEvents = [];
        return;
      }

      const data = await res.json();

      academicEvents = (Array.isArray(data) ? data : []).map(ev => {
        const normalizedDate    = normalizeDateString(ev.date);
        const normalizedEndDate = normalizeDateString(ev.endDate);

        return {
          ...ev,
          date: normalizedDate,
          endDate: normalizedEndDate, 
          tag: "Academic Calendar", 
        };
      });

      console.log("✅ Academic events loaded:", academicEvents.length);
      console.log("Sample academic event after normalize:", academicEvents[0]);
    } catch (err) {
      console.error("Error loading academic events from server:", err);
      academicEvents = [];
    }
  }

  // Maximum events displayed per day cell
  const MAX_EVENTS_PER_DAY = 3;

  // Date range filter state (YYYY-MM-DD or null)
  let dateFilterStart = null;
  let dateFilterEnd = null;

  // Currently selected tag filters
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


  // Determine sport icon based on event title keywords
  function getSportIconForEvent(ev) {
    // console.log("getSportIconForEvent ev =", ev);

    // Normalize sport & title: lowercase + remove spaces
    const rawSport = (ev.sport || "").toLowerCase();
    const rawTitle = (ev.title || "").toLowerCase();

    const sport = rawSport.replace(/\s+/g, "");
    const title = rawTitle.replace(/\s+/g, "");

    // ==== Check sport field first ====
    if (sport.includes("basketball")) return "🏀";
    if (sport.includes("football")) return "🏈";
    if (sport.includes("soccer")) return "⚽️";
    if (sport.includes("volleyball")) return "🏐";
    if (sport.includes("tennis")) return "🎾";
    if (sport.includes("hockey")) return "🏒";
    if (sport.includes("rowing")) return "🚣";
    if (sport.includes("swim") || sport.includes("diving")) return "🏊";
    if (sport.includes("wrestling")) return "🤼";

    // ==== Then check title (also normalized without spaces) ====
    if (title.includes("basketball")) return "🏀";
    if (title.includes("football")) return "🏈";
    if (title.includes("soccer")) return "⚽️";
    if (title.includes("volleyball")) return "🏐";
    if (title.includes("tennis")) return "🎾";
    if (title.includes("hockey")) return "🏒";
    if (title.includes("rowing")) return "🚣";
    if (title.includes("swim") || title.includes("diving")) return "🏊";
    if (title.includes("wrestling")) return "🤼";

    // Fallback: default medal icon if no match found
    return "🏅";
  }

  /**
   * Create an event pill element (<li>) for a given event.
   * - Shows sport icon for "Sports Events"
   * - Applies tag color class
   * - Adds delete button for user-created events
   */
  function createEventPill(ev) {
    const li = document.createElement("li");

    // Base text: title (with sport icon if needed)
    let text = ev.title || "";
    if (ev.tag === "Sports Events") {
      const icon = getSportIconForEvent(ev);
      text = `${icon} ${text}`;
    }
    li.textContent = text;

    // Base pill style
    li.classList.add("event-pill");

    // Tag color class (example: tag-holiday, tag-academic-calendar, tag-weather)
    if (ev.tag) {
      li.classList.add("tag-" + ev.tag.replace(/\s+/g, "-").toLowerCase());
    }

    // === Temperature-based color (Weather only) ===
    // If the event has avgt (average temperature), determine hot/cold class
    if (ev.tag === "Weather" && ev.avgt !== undefined) {
      const temp = parseFloat(ev.avgt);
      if (!Number.isNaN(temp)) {
        if (temp >= 80) {
          li.classList.add("weather-hot");   // Hot day (red)
        } else if (temp <= 32) {
          li.classList.add("weather-cold");  // Cold day (blue)
        }
      }
    }

    // Delete button for user-created events
    if (ev.source === "user") {
      const deleteBtn = document.createElement("span");
      deleteBtn.textContent = "🗑 ";
      deleteBtn.className = "delete-event-btn";
      deleteBtn.title = "Delete this event";

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteUserEventById(ev.id);
      });

      li.insertBefore(deleteBtn, li.firstChild);
    }

    return li;
  }

  // Delete a user-created event (backend + local state)
  async function deleteUserEventById(id) {
    const index = userEvents.findIndex((ev) => ev.id === id);
    if (index === -1) return;

    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("Failed to delete event:", res.status);
        alert("Failed to delete event on server. Please try again.");
        return;
      }

      // Remove from local array and re-render
      userEvents.splice(index, 1);
      renderCalendarGrid();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Error deleting event. Please check console for details.");
    }
  }

  // Convert YYYY-MM-DD to a human-readable date
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

  // ===== Date range filter =====
  function updateDateRangeFromInputs() {
    if (!rangeStartInput || !rangeEndInput) return;

    let startVal = rangeStartInput.value || null; // "YYYY-MM-DD" 或 null
    let endVal = rangeEndInput.value || null;

    dateFilterStart = startVal;
    dateFilterEnd = endVal;

    // Auto-swap if user inputs reversed range
    if (dateFilterStart && dateFilterEnd && dateFilterEnd < dateFilterStart) {
      const tmp = dateFilterStart;
      dateFilterStart = dateFilterEnd;
      dateFilterEnd = tmp;

      rangeStartInput.value = dateFilterStart;
      rangeEndInput.value = dateFilterEnd;
    }

    renderCalendarGrid();
  }

  // input change
  if (rangeStartInput && rangeEndInput) {
    rangeStartInput.addEventListener("change", updateDateRangeFromInputs);
    rangeEndInput.addEventListener("change", updateDateRangeFromInputs);
  }

  // clear filter
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
    // ====== Sports events add icon ======
    let title = ev.title || "(No title)";

    if (ev.tag === "Sports Events") {
      const icon = getSportIconForEvent(ev); 
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

    // Description / Details (support URL)
    const desc = ev.details || ev.description || "";

    if (desc) {
      detailDescEl.innerHTML = linkify(desc);
      detailDescRow.style.display = "";
    } else {
      detailDescRow.style.display = "none";
      detailDescEl.innerHTML = "";
    }


    // Sport type row
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

        // Remove leading “[Academic] ” or any “[Something] ” pattern
        titleText = titleText.replace(/^\[[^\]]+\]\s*/i, "");

        // Sports icon
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
    // when opening modal via "Create New Event", always reset edit mode
    editingEventId = null;
    // Default date = currently selected date (or today)
    eventDateInput.value = selectedDate || formatDate(today);
    eventTitleInput.value = "";
    eventStartInput.value = "";
    eventEndInput.value = "";
    eventLocationInput.value = "";
    tagSelect.value = "Academic Calendar";

    if (eventSportInput) eventSportInput.value = "";
    if (eventDetailsInput) eventDetailsInput.value = "";

    // Make sure Sport / Details visibility matches the current tag
    updateSportFieldsVisibility();

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

  // Handle create / edit event (user-created, stored on backend)
  eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = eventTitleInput.value.trim();
    const date = eventDateInput.value;
    const start = eventStartInput.value;
    const end = eventEndInput.value;
    const location = eventLocationInput.value.trim();
    const tag = tagSelect.value;
    const sport = eventSportInput ? eventSportInput.value.trim() : "";
    const details = eventDetailsInput ? eventDetailsInput.value.trim() : "";

    if (!title || !date) {
      alert("Title and Date are required.");
      return;
    }

    // Synchronize calendar view with the selected event date
    const [y, m, d] = date.split("-").map(Number);
    currentYear = y;
    currentMonth = m - 1;   // Date 的 month 是 0-based
    selectedDate = date;

    // Data payload for backend
    const payload = {
      title,
      date,
      start,
      end,
      location,
      tag,
      sport: tag === "Sports Events" && sport ? sport : null,
      details: details || null,
    };

    try {
      // ===== EDIT EXISTING EVENT =====
      if (editingEventId) {
        // 1) Delete the old event on backend
        const deleteRes = await fetch(`${API_BASE_URL}/api/events/${editingEventId}`, {
          method: "DELETE",
        });
        if (!deleteRes.ok) {
          console.error("Failed to delete old event before update:", deleteRes.status);
          alert("Failed to update event (delete step). Please try again.");
          return;
        }

        // 2) Create the new event on backend
        const createRes = await fetch(`${API_BASE_URL}/api/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!createRes.ok) {
          console.error("Failed to recreate event:", createRes.status);
          alert("Failed to update event (create step). Please try again.");
          return;
        }
        const createdEvent = await createRes.json();
        const normalizedEvent = {
          ...createdEvent,
          date: normalizeDateString(createdEvent.date),
        };

        // 3) Update local array
        const index = userEvents.findIndex((ev) => ev.id === editingEventId);
        if (index !== -1) {
          userEvents[index] = normalizedEvent;
        }

      // ===== CREATE NEW EVENT =====
      } else {
        const res = await fetch(`${API_BASE_URL}/api/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          console.error("Failed to create event:", res.status);
          alert("Failed to create event. Please try again.");
          return;
        }
        const createdEvent = await res.json();
        const normalizedEvent = {
          ...createdEvent,
          date: normalizeDateString(createdEvent.date),
        };
        userEvents.push(normalizedEvent);
      }

      closeEventModal();
      editingEventId = null;
      renderCalendarGrid();

    } catch (err) {
      console.error("Error creating/updating event:", err);
      alert("Error while saving event. Please check console for details.");
    }
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

  // Merge all event sources into one unified array (shared by search and getEventsForDate)
  function getAllEventsArray() {
    return [
      ...academicEvents,
      ...userEvents,
      ...holidays,
      ...sportsEvents,
      ...weatherEvents,
    ];
  }

  function getEventsForDate(dateStr) {
    const allEvents = getAllEventsArray();
    return allEvents.filter(
      (ev) => ev.date === dateStr && selectedTags.has(ev.tag)
    );
  }

  //  dateFilterStart ~ dateFilterEnd 
  function isDateInFilterRange(dateStr) {

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
        const li = createEventPill(ev);
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

  // ===== Search =====
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

    // hide claendar
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

    const termLower = term.toLowerCase();
    const allEvents = getAllEventsArray();

    const filteredEvents = allEvents.filter((ev) => {
      const title     = (ev.title || "").toLowerCase();
      const details   = (ev.details || ev.description || "").toLowerCase(); // 支援 details / description
      const location  = (ev.location || "").toLowerCase();
      const tag       = (ev.tag || "").toLowerCase();
      const sport     = (ev.sport || "").toLowerCase();

      return (
        title.includes(termLower) ||
        details.includes(termLower) ||
        location.includes(termLower) ||
        tag.includes(termLower) ||
        sport.includes(termLower)
      );
    });

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

  // Determine temperature color class based on average temperature (avgt)
  // Return "weather-hot", "weather-cold", or null
  function getTempClassFromAvgt(avgt) {
    if (avgt == null || avgt === "" || avgt === "M") return null;

    const t = parseFloat(avgt);
    if (Number.isNaN(t)) return null;

    // Thresholds can be adjusted
    if (t >= 80) {
      return "weather-hot";   // Hot day
    }
    if (t <= 32) {
      return "weather-cold";  // Cold day
    }

    return null;  // Normal temperature → no special color
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

  function linkify(text) {
    if (!text) return "";

    // clear .NET Task string
    text = text.replace(/System\.Threading\.Tasks\.Task`1\[System\.String\]/g, "");

    // 1. HTML escape
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 2. url change to <a>
    const urlPattern = /(https?:\/\/\S+)/g;
    escaped = escaped.replace(urlPattern, (url) => {
      const safeUrl = url.replace(/"/g, "&quot;");
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    // 3. change to <br>
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

  // Load user events + academic events from backend before first render
  await loadUserEventsFromServer();
  await loadAcademicEventsFromServer();

  // Render initial calendar (holidays + academic + weather + userEvents)
  renderCalendarGrid();

  // Load sports events, then re-render when finished
  loadSportsEvents();
});
