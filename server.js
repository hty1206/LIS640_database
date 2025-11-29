const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== CORS: allow your GitHub Pages origin =====
const ALLOWED_ORIGIN = "https://hty1206.github.io";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Parse JSON request body
app.use(express.json());

// Serve local static files for development/testing
app.use(express.static(path.join(__dirname, "docs")));

// ===== MySQL connection pool (AWS RDS: Trans_Project) =====
const pool = mysql.createPool({
  host: process.env.AWS_DB_HOST,
  user: process.env.AWS_DB_USER,
  password: process.env.AWS_DB_PASSWORD,
  database: process.env.AWS_DB_NAME,
  port: process.env.AWS_DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

/* ============================================================
   1. USER-CREATED EVENTS (stored in Trans_Project.user_events)
   ============================================================ */

// GET /api/events — Return all user-created events
app.get("/api/events", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM user_events ORDER BY date, start"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error in GET /api/events:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/events — Insert a new user-created event
app.post("/api/events", async (req, res) => {
  try {
    const body = req.body || {};

    const title = typeof body.title === "string" ? body.title : "";
    const date = typeof body.date === "string" ? body.date : "";
    const start = typeof body.start === "string" ? body.start : "";
    const end = typeof body.end === "string" ? body.end : "";
    const location =
      typeof body.location === "string" ? body.location : "";
    const tag = typeof body.tag === "string" ? body.tag : "";
    const sport = typeof body.sport === "string" ? body.sport : null;

    // Determine details/description field
    let finalDetails = null;
    if (typeof body.details === "string" && body.details.trim() !== "") {
      finalDetails = body.details.trim();
    } else if (
      typeof body.description === "string" &&
      body.description.trim() !== ""
    ) {
      finalDetails = body.description.trim();
    }

    // Required fields validation
    if (!title || !date || !tag) {
      return res
        .status(400)
        .json({ error: "title, date, and tag are required" });
    }

    // Additional validation for Sports Events
    if (tag === "Sports Events" && (!sport || sport.trim() === "")) {
      return res
        .status(400)
        .json({ error: "sport is required when tag is 'Sports Events'" });
    }

    // Insert into user_events
    const [result] = await pool.query(
      `INSERT INTO user_events
       (source, title, date, start, end, location, tag, sport, details)
       VALUES ('user', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, date, start, end, location, tag, sport, finalDetails]
    );

    // Fetch the newly inserted row
    const [rows] = await pool.query(
      "SELECT * FROM user_events WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error in POST /api/events:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/events/:id — Remove a single user-created event
app.delete("/api/events/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM user_events WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /api/events/:id:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ============================================================
   2. ACADEMIC EVENTS (read-only from app_calendar_export)
   Only return rows where Categories = 'Academic'
   ============================================================ */

// GET /api/academic-events — Read academic category events only
app.get("/api/academic-events", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         Subject,
         \`Start Date\`    AS startDate,
         \`End Date\`      AS endDate,
         \`All Day Event\` AS allDayEvent,
         Description,
         Categories
       FROM app_calendar_export
       WHERE Categories = 'Academic'
       ORDER BY \`Start Date\``
    );

    // Normalize MySQL result format to frontend-friendly structure
    const events = rows.map((r, idx) => ({
      id: `academic-${idx + 1}`,
      source: "academic",
      title: r.Subject,
      date: r.startDate,
      start: null,
      end: null,
      location: null,
      tag: "Academic Calendar",
      sport: null,
      details: r.Description || null,
      endDate: r.endDate,
      allDayEvent: r.allDayEvent,
    }));

    res.json(events);
  } catch (err) {
    console.error("Error in GET /api/academic-events:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===== Launch server =====
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
