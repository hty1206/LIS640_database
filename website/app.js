(function () {
  // ===== Persisted settings =====
  const THEME_KEY = 'pref_theme';
  const DATE_SIZE_KEY = 'pref_date_size';

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'light' ? 'Light' : 'Dark';
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    setTheme(saved);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', () => {
      const next = (localStorage.getItem(THEME_KEY) || 'dark') === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }

  function setDateSize(px) {
    document.documentElement.style.setProperty('--date-size', px + 'px');
    localStorage.setItem(DATE_SIZE_KEY, String(px));
    const out = document.getElementById('dateSizeVal');
    if (out) out.textContent = String(px);
  }

  function initDateSizeControl() {
    const range = document.getElementById('dateSizeRange');
    if (!range) return;
    const saved = parseInt(localStorage.getItem(DATE_SIZE_KEY) || '14', 10);
    range.value = String(saved);
    setDateSize(saved);
    range.addEventListener('input', () => setDateSize(parseInt(range.value, 10)));
  }

  // ===== Simple Router =====
  const routes = {
    '#calendar': 'view-calendar',
    '#tableau': 'view-tableau',
  };
  function show(hash) {
    if (!routes[hash]) hash = '#calendar';
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(routes[hash]).classList.remove('hidden');
    if (hash === '#calendar' && !window.__calendarInit) { initCalendar(); window.__calendarInit = true; }
  }
  window.addEventListener('hashchange', () => show(location.hash));
  document.querySelectorAll('[data-link]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); location.hash = a.getAttribute('href');
  }));

  // Init global UI prefs first
  initTheme();
  initDateSizeControl();
  show(location.hash || '#calendar');

  // ===== Calendar =====
  function initCalendar(){
    const grid = document.getElementById('grid');
    const titleText = document.getElementById('titleText');
    const weekdaysEl = document.getElementById('weekdays');
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const todayBtn = document.getElementById('todayBtn');
    const picked = document.getElementById('picked');

    const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    weekdaysEl.innerHTML = weekdays.map(d => `<div class="weekday">${d}</div>`).join('');
    months.forEach((m, idx) => { const opt = document.createElement('option'); opt.value = idx; opt.textContent = m; monthSelect.appendChild(opt); });
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 60; y <= currentYear + 20; y++) { const opt = document.createElement('option'); opt.value = y; opt.textContent = String(y); yearSelect.appendChild(opt); }

    let viewDate = new Date(); viewDate.setDate(1); let selectedDate = new Date();

    function daysInMonth(y,m){ return new Date(y, m+1, 0).getDate(); }
    function sameYMD(a,b){ return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }

    function render(){
      const y=viewDate.getFullYear(); const m=viewDate.getMonth();
      titleText.textContent = `${months[m]} ${y}`; monthSelect.value=m; yearSelect.value=String(y);

      const firstWeekday = new Date(y,m,1).getDay();
      const totalDays = daysInMonth(y,m); const prevMonthDays = daysInMonth(y,m-1);

      const cells=[];
      for(let i=0;i<firstWeekday;i++){ const d=prevMonthDays-firstWeekday+1+i; cells.push({d,other:true,date:new Date(y,m-1,d)}); }
      for(let d=1; d<=totalDays; d++) cells.push({d,other:false,date:new Date(y,m,d)});
      while(cells.length%7!==0 || cells.length<42){
        const d=cells.length-(firstWeekday+totalDays)+1; cells.push({d,other:true,date:new Date(y,m+1,d)});
      }
      const today=new Date();
      grid.innerHTML = cells.map(({d,other,date})=>{
        const isToday=sameYMD(date,today); const isSelected=sameYMD(date,selectedDate);
        const classes=['cell',other?'disabled':'',isToday?'today':'',isSelected?'selected':''].filter(Boolean).join(' ');
        return `<div class="${classes}" data-date="${date.toISOString()}">
          <div class="date-num">${d}</div>
          <div class="badges"></div>
        </div>`;
      }).join('');
      grid.querySelectorAll('.cell').forEach(el=>{
        if (el.classList.contains('disabled')) return;
        el.addEventListener('click',()=>{
          const dt=new Date(el.dataset.date);
          selectedDate=dt;
          picked.textContent=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
          render();
        });
      });
    }

    prevBtn.addEventListener('click',()=>{ viewDate.setMonth(viewDate.getMonth()-1); render(); });
    nextBtn.addEventListener('click',()=>{ viewDate.setMonth(viewDate.getMonth()+1); render(); });
    todayBtn.addEventListener('click',()=>{ const t=new Date(); viewDate=new Date(t.getFullYear(), t.getMonth(), 1); selectedDate=t; render(); });
    monthSelect.addEventListener('change',()=>{ viewDate.setMonth(parseInt(monthSelect.value,10)); render(); });
    yearSelect.addEventListener('change',()=>{ viewDate.setFullYear(parseInt(yearSelect.value,10)); render(); });

    render();
  }

  // ===== Tableau Embed =====
  const tableauUrlInput = document.getElementById('tableauUrl');
  const tableauFrame = document.getElementById('tableauFrame');
  const loadBtn = document.getElementById('loadTableau');
  if (loadBtn) {
    loadBtn.addEventListener('click', ()=>{
      const url = tableauUrlInput.value.trim();
      if (!url) return alert('Please paste a Tableau visualization link.');
      tableauFrame.src = url; // Public works directly; for Server add auth later.
      location.hash = '#tableau';
    });
  }
})();
