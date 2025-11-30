# 📘 Transportation Services Calendar & Database
<p align="center">

  <!-- Frontend -->
  <a href="https://hty1206.github.io/LIS640_database/docs/">
    <img src="https://img.shields.io/badge/Frontend-GitHub%20Pages-blue?logo=github" />
  </a>

  <!-- Backend -->
  <a href="https://data-tagging-project.onrender.com">
    <img src="https://img.shields.io/badge/Backend-Render-green?logo=render" />
  </a>

  <!-- CI/CD Status -->
  <a href="https://github.com/hty1206/LIS640_database/actions">
    <img src="https://github.com/hty1206/LIS640_database/actions/workflows/update_sports.yml/badge.svg" />
  </a>

  <!-- Node.js -->
  <img src="https://img.shields.io/badge/Node.js-20.x-success?logo=node.js" />

  <!-- MySQL -->
  <img src="https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white" />

</p>

Hello! This is a repository for the Transportation Services database and event calendar.  
This repository contains the Transportation Services event calendar and accompanying MySQL database.  
The system integrates academic events, sports events, weather data, holiday data, and user-created events into a unified calendar interface.

---

## 🌐 Live Demo (Frontend)

**GitHub Pages (static site)**
🔗 [https://hty1206.github.io/LIS640_database/](https://hty1206.github.io/LIS640_database/)

---

## 🗄 Backend API (Render)

**Render Node.js API service**
🔗 [https://data-tagging-project.onrender.com](https://data-tagging-project.onrender.com)

The backend handles user-created events, academic calendar queries, and connects to an AWS RDS MySQL database.

---

# 🧩 Features

* 🎓 Academic calendar integration
* 🏈 Sports events auto-updated daily from Google Calendar ICS via GitHub Actions
* 🌧 Weather data integration
* 🎉 Holiday JSON dataset
* 📝 User-created event CRUD (create/delete)
* 🔌 Node.js backend on Render + AWS MySQL
* 🖥 Static frontend on GitHub Pages
* 🔄 CI/CD pipeline for automated data refresh

---

# 🏗 System Architecture

```
GitHub Pages (Frontend)
        |
        v
Render Node.js Backend → AWS RDS MySQL
        ^
        |
GitHub Actions (ICS → JSON daily update)
```

---

# 📂 Project Structure

```
LIS640_database/
├── db/                     # SQL schema
├── docs/                   # Frontend (GitHub Pages)
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── data/
│       ├── sports_events.json
│       └── holidays.json
├── scripts/
│   └── generate_sports_events.js
├── server.js               # Backend API (Render)
├── .github/workflows/      # CI/CD pipeline
└── README.md
```

---

# 🛢 Creating Your Own MySQL Database (Manual Setup)

To build your own copy of the database:

1. Open **MySQL Workbench**
2. Create a new MySQL instance or open an existing one
3. Go to **File → Open SQL Script**
4. Navigate to the `db/` folder of this repository
5. Select **LIS640_full2.sql**
6. Run the entire script using:

   * `Ctrl + Shift + Enter` (Windows)
   * or click the **lightning bolt** icon
     ⚠ **Do NOT highlight/select any SQL** before running. If you do, Workbench will only run the selected portion.
7. Refresh your schema panel. You should now see all tables created.

---

# 🔍 Test Query Example

This sample query retrieves all events in **January 2022** that had measurable precipitation:

```sql
select EventStartDate, EventName, EventDesc, WeatherPrecip, WeatherAvgT
from events
join weather
     on events.EventStartDate = weather.WeatherDate
where EventStartDate between "2022-01-01" and "2022-01-31"
  and WeatherPrecip > 0;
```

---

# 🔄 Automated Data Pipeline (GitHub Actions)

Daily at 09:00 UTC:

```
1. Fetch ICS from Google Calendar
2. Parse + clean ICS fields
3. Write → docs/data/sports_events.json
4. Auto-commit only if the dataset has changed
```

Workflow file:
`/.github/workflows/update_sports.yml`

---

# ⚙️ Backend API Endpoints

### User Events

```
GET    /api/events        → Get all user-created events
POST   /api/events        → Insert new event
DELETE /api/events/:id    → Delete event
```

### Academic Calendar

```
GET /api/academic-events  → Fetch academic events (Categories='Academic')
```

---

# ⭐ Key Features Summary

* Unified multi-source event calendar
* Real-time MySQL-backed user event storage
* Fully automated sports event ingestion
* Clear frontend-backend separation
* Cloud-hosted REST API
* Clean, modular project structure

---

# 📜 License

For academic and educational use only.
