const fs = require("fs");
const https = require("https");
const path = require("path");

const ICS_URL =
  "https://calendar.google.com/calendar/ical/7obkojq4b78kbqg9v0l8s2s6kcg9usfk%40import.calendar.google.com/public/basic.ics";

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Status code: ${res.statusCode}`));
          return;
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

function pad(n) {
  return n < 10 ? "0" + n : String(n);
}


function parseIcsDateTime(raw) {
  if (!raw) return { date: null, time: null };


  if (/^\d{8}$/.test(raw)) {
    const y = raw.slice(0, 4);
    const m = raw.slice(4, 6);
    const d = raw.slice(6, 8);
    return { date: `${y}-${m}-${d}`, time: null };
  }

  // 有時間
  const isUtc = raw.endsWith("Z");
  const y = parseInt(raw.slice(0, 4), 10);
  const m = parseInt(raw.slice(4, 6), 10);
  const d = parseInt(raw.slice(6, 8), 10);
  const hh = parseInt(raw.slice(9, 11), 10);
  const mm = parseInt(raw.slice(11, 13), 10);

  let dateObj;
  if (isUtc) {

    dateObj = new Date(Date.UTC(y, m - 1, d, hh, mm));
  } else {

    dateObj = new Date(y, m - 1, d, hh, mm);
  }


  const local = new Date(
    dateObj.toLocaleString("en-US", { timeZone: "America/Chicago" })
  );

  const ly = local.getFullYear();
  const lm = local.getMonth(); // 0-based
  const ld = local.getDate();
  const lhh = local.getHours();
  const lmm = local.getMinutes();

  const dateStr = `${ly}-${pad(lm + 1)}-${pad(ld)}`;


  let suffix = lhh >= 12 ? "pm" : "am";
  let displayHour = lhh % 12;
  if (displayHour === 0) displayHour = 12;
  const timeStr = `${displayHour}:${pad(lmm)}${suffix}`;

  return { date: dateStr, time: timeStr };
}

async function main() {
  console.log("Fetching ICS from Google Calendar...");
  const icsText = await fetchText(ICS_URL);


  const rawLines = icsText.split(/\r?\n/);
  const unfolded = [];
  for (const line of rawLines) {
    if (/^[ \t]/.test(line) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += line.trimStart();
    } else {
      unfolded.push(line);
    }
  }

  const blocks = unfolded.join("\n").split("BEGIN:VEVENT").slice(1);
  const events = [];

  for (const block of blocks) {
    const lines = block.split(/\r?\n/);

    let summary = null;
    let location = null;
    let description = null;
    let dtStartRaw = null;
    let dtEndRaw = null;

    for (const line of lines) {
      if (line.startsWith("DTSTART")) {
        dtStartRaw = line.split(":")[1]?.trim() || null;
      }

      if (line.startsWith("DTEND")) {
        dtEndRaw = line.split(":")[1]?.trim() || null;
      }

      if (line.startsWith("SUMMARY:")) {
        summary = line.replace("SUMMARY:", "").trim();
      }

      if (line.startsWith("LOCATION:")) {
        location = line.replace("LOCATION:", "").trim();
        location = location.replace(/\\,/g, ", ").replace(/\\n/g, " ");
      }

      if (line.startsWith("DESCRIPTION:")) {
        description = line.replace("DESCRIPTION:", "").trim();
      }
    }

    const startInfo = parseIcsDateTime(dtStartRaw);
    const endInfo = parseIcsDateTime(dtEndRaw);
    const dateStr = startInfo.date;
    const startTime = startInfo.time;
    const endTime = endInfo.time;

    if (dateStr && summary) {
      let descText = description || "";

      descText = descText.replace(/\\n/g, "\n");

      descText = descText.replace(/&amp;/g, "&");

      descText = descText.replace(
        /System\.Threading\.Tasks\.Task`1\[System\.String\]/g,
        ""
      );

      const lines = descText.split("\n").map(l => l.trim());
      if (lines.length > 0) {
        const firstLine = lines[0];
        if (firstLine === summary || firstLine.startsWith(summary)) {
          lines.shift();
        }
      }
      descText = lines.join("\n");

      descText = descText.replace(/\n{2,}/g, "\n\n").trim();

      events.push({
        date: dateStr,          
        title: summary,
        location: location || "",
        start: startTime,       
        end: endTime,           
        description: descText,  
        tag: "Sports Events",
      });
    }

  }

  const outputPath = path.join(__dirname, "..", "docs", "data", "sports_events.json");

  fs.writeFileSync(
    outputPath,
    JSON.stringify(events, null, 2),
    "utf-8"
  );
  console.log(`Generated ${events.length} sports events -> ${outputPath}`);
}


main().catch((err) => {
  console.error(err);
  process.exit(1);
});
