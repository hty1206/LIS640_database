const express = require("express");
const fs = require("fs");
const path = require("path");

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

// Parse JSON body
app.use(express.json());

// Serve static files from /docs when testing locally
app.use(express.static(path.join(__dirname, "docs")));

const EVENTS_FILE = path.join(__dirname, "events.json");

// Read events.json safely
function readEvents() {
  try {
    const raw = fs.readFileSync(EVENTS_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

// Write events.json safely
function writeEvents(events) {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), "utf8");
}

// GET /api/events - return all user-created events
app.get("/api/events", (req, res) => {
  const events = readEvents();
  res.json(events);
});

// POST /api/events - create a new event
app.post("/api/events", (req, res) => {
  const { title, date, start, end, location, tag, sport, details, description } =
    req.body || {};

  if (!title || !date || !tag) {
    return res
      .status(400)
      .json({ error: "title, date, and tag are required" });
  }

  const events = readEvents();

  const newEvent = {
    id: Date.now(),
    source: "user",
    title,
    date,
    start: start || "",
    end: end || "",
    location: location || "",
    tag,
    sport: sport || null,
    details: finalDetails,
  };

  events.push(newEvent);
  writeEvents(events);

  res.status(201).json(newEvent);
});

// DELETE /api/events/:id - delete by id
app.delete("/api/events/:id", (req, res) => {
  const id = Number(req.params.id);
  const events = readEvents();
  const index = events.findIndex((ev) => ev.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Event not found" });
  }

  events.splice(index, 1);
  writeEvents(events);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
