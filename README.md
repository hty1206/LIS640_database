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

  <!-- Node.js -->

  <img src="https://img.shields.io/badge/Node.js-20.x-success?logo=node.js" />

  <!-- MySQL -->

  <img src="https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white" />

</p>

This repository contains the Transportation Services event calendar and MySQL database.
It integrates academic events, sports events, weather data, holiday data, and user-created events into a unified interactive calendar.

---

# 🛠 Skills & Technologies Used

## 📌 Backend & API

* Node.js (Express)
* RESTful API design
* JSON normalization
* CORS middleware
* Render cloud deployment

## 🗄 Database & Data Engineering

* MySQL relational design
* AWS RDS for MySQL
* SQL automation & ETL processing
* CircleSQL for data cleaning
* Data merging & normalization

## 🔄 CI/CD & Automation

* GitHub Actions

  * Scheduled cron workflow
  * ICS → JSON ETL pipeline
  * Auto-commit on data changes
* Node.js scripting for ingestion
* Automated updates to GitHub Pages

## 🌐 Frontend Development

* HTML / CSS / JavaScript
* Dynamic DOM manipulation
* Interactive event rendering
* Fetch API for asynchronous data

## ☁️ Cloud & Deployment

* GitHub Pages (frontend hosting)
* Render (backend hosting)
* AWS RDS (MySQL)
* Secure environment variable management

---

# 🌐 Live Demo (Frontend)

🔗 [https://hty1206.github.io/LIS640_database/](https://hty1206.github.io/LIS640_database/)

# 🗄 Backend API (Render)

🔗 [https://data-tagging-project.onrender.com](https://data-tagging-project.onrender.com)  
⚠️ Note: Adding or deleting events is only available through the Render backend API (https://data-tagging-project.onrender.com). This is the only link that saves data to the cloud database.  
The GitHub Pages frontend is for interface demonstration only.

---

# 🧩 Features

* 🎓 Academic calendar integration
* 🏈 Sports events auto-updated from ICS feed via GitHub Actions
* 🌧 Weather data integration
* 🎉 Holiday dataset from custom JSON
* 📝 User-created events CRUD
* 🔌 Node.js backend + AWS RDS
* 🖥 GitHub Pages frontend
* 🔄 Fully automated CI/CD data pipeline

---

# 📊 Data Sources

| Data Type                | Source URL / Origin                                                                      | Description                       | Update Method                           | Notes / Tech Used                   |
| ------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------- | ----------------------------------- |
| **Academic Calendar**    | [https://secfac.wisc.edu/academic-calendar/](https://secfac.wisc.edu/academic-calendar/) | UW–Madison academic calendar      | Web scraped → cleaned → stored in MySQL | CircleSQL cleaning                  |
| **Sports Events (ICS)**  | Google Calendar ICS feed                                                                 | UW Badgers sports schedule        | **Daily GitHub Actions ETL**            | Node.js parsing → JSON auto-commit  |
| **Weather (Historical)** | [https://climatology.nelson.wisc.edu](https://climatology.nelson.wisc.edu)               | Daily precipitation & temperature | Initial daily scraping                  | Imported to MySQL                   |
| **Holiday Data**         | `docs/data/holidays.json`                                                                | U.S. federal holidays             | Manual curation                         | Static JSON                         |
| **User Events**          | Created by frontend users                                                                | Custom user-added events          | Live insert → AWS RDS via API           | Stored in MySQL `user_events` table |

---

# 🏗 System Architecture

```
GitHub Pages (Frontend)
        |
        v
Render Node.js Backend  →  AWS RDS MySQL
        ^
        |
GitHub Actions (ICS → JSON daily update)
```

---

# 📦 Project Structure

```
LIS640_database/
│
├── db/                     # SQL schemas
├── dbt_project/            # dbt transformations
├── docs/                   # GitHub Pages frontend
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── data/
│       ├── sports_events.json
│       └── holidays.json
│
├── scripts/                # Automation scripts
│   └── generate_sports_events.js
│
├── server.js               # Render backend API
├── package.json
├── .github/
│   └── workflows/
│       └── update_sports.yml
│
└── README.md               # Project documentation
```

---

# 🔄 CI/CD & Data Pipeline

This project includes a fully automated ETL pipeline using GitHub Actions.

### ✨ Daily ICS → JSON ETL (Sports Events)

Workflow path:
`/.github/workflows/update_sports.yml`

Runs every day at **09:00 UTC**.

**Pipeline Steps:**

```
1. Download ICS feed from Google Calendar
2. Unfold multi-line ICS fields
3. Convert timestamps to America/Chicago
4. Normalize fields (summary, description, location)
5. Convert to structured JSON
6. Write → docs/data/sports_events.json
7. Commit only if data changed
```

### ✔ Benefits

* Zero manual maintenance
* Clean version history
* GitHub Pages always displays the newest sports events

---

# 🛢 Creating Your Own MySQL Database

1. Open **MySQL Workbench**
2. Go to **File → Open SQL Script**
3. Select `db/LIS640_full2.sql`
4. Run the entire script

   * `Ctrl + Shift + Enter`
   * or the lightning bolt icon
     ⚠ Do **not** highlight lines before running.
5. Refresh schemas → Tables will appear

---

# 🔍 Sample SQL Query

```sql
select EventStartDate, EventName, EventDesc, WeatherPrecip, WeatherAvgT
from events
join weather
  on events.EventStartDate = weather.WeatherDate
where EventStartDate between "2022-01-01" and "2022-01-31"
  and WeatherPrecip > 0;
```

---

# ⚙ Backend API Endpoints

### User Events

```
GET    /api/events
POST   /api/events
DELETE /api/events/:id
```

### Academic Calendar

```
GET    /api/academic-events
```

---

# 🧪 Local Development

### Start backend

```bash
npm install
node server.js
```

### Regenerate sports events JSON

```bash
node scripts/generate_sports_events.js
```

### Preview frontend locally

```
open docs/index.html  # macOS
```

---

# ⭐ Key Features Summary

* Unified multi-source event calendar
* AWS-hosted MySQL with real-time updates
* GitHub Actions CI/CD ETL pipeline
* Robust REST API backend
* Static, fast-loading frontend
* Clean & modular full-stack architecture

---

# 📜 License

For academic and educational use only.
