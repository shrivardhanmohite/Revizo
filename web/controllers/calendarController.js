const Topic = require("../models/Topic");
const googleService = require("../utils/googleCalendarService");

// ===============================
// Start Google OAuth Flow
// ===============================
exports.connectGoogle = (req, res) => {
  const url = googleService.getAuthUrl();
  res.redirect(url);
};

// ===============================
// OAuth Callback
// ===============================
exports.oauthCallback = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("Authorization code missing");

    const tokens = await googleService.getToken(code);
    req.session.googleTokens = tokens;

    res.redirect("/study-planner");

  } catch (err) {
    console.error("OAuth Error:", err);
    res.status(500).send("Google authentication failed");
  }
};

// ===============================
// Add Exam Event
// ===============================
exports.generateExamCalendar = async (req, res) => {
  try {
    if (!req.session.googleTokens)
      return res.redirect("/calendar/connect");

    const { examDate } = req.body;
    if (!examDate) return res.status(400).send("Exam date required");

    googleService.setCredentials(req.session.googleTokens);

    const exam = new Date(examDate);

    await googleService.insertEvent({
      summary: "📘 Exam Day",
      description: "Exam scheduled via Revizo",
      start: {
        dateTime: exam.toISOString(),
        timeZone: "Asia/Kolkata"
      },
      end: {
        dateTime: new Date(
          exam.getTime() + 3 * 60 * 60 * 1000
        ).toISOString(),
        timeZone: "Asia/Kolkata"
      }
    });

    res.send("✅ Exam added to Google Calendar");

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add exam");
  }
};

// ===============================
// Add Smart Study Planner
// ===============================
exports.generateStudyPlannerCalendar = async (req, res) => {
  try {
    if (!req.session.googleTokens)
      return res.redirect("/calendar/connect");

    const { examDate, preference } = req.body;
    if (!examDate) return res.status(400).send("Exam date required");

    googleService.setCredentials(req.session.googleTokens);

    const exam = new Date(examDate);
    const today = new Date();

    const daysLeft = Math.ceil(
      (exam - today) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft <= 0)
      return res.status(400).send("Invalid exam date");

    const topics = await Topic.find({
      userId: req.session.user._id
    });

    if (!topics.length)
      return res.status(400).send("No topics available");

    let topicIndex = 0;

    for (let i = 0; i < daysLeft; i++) {

      const studyDate = new Date(today);
      studyDate.setDate(today.getDate() + i + 1);

      const isRevisionDay = i >= daysLeft - 3;
      const startHour = preference === "morning" ? 6 : 19;

      let summary, description, durationHours;

      if (isRevisionDay) {
        summary = "🔁 Revision Day";
        description = "Final revision before exam";
        durationHours = 2;
      } else {
        const topic = topics[topicIndex % topics.length];
        durationHours = topic.importance === "VV-IMP" ? 3 : 2;
        summary = `📘 Study: ${topic.title}`;
        description = `Importance: ${topic.importance}`;
        topicIndex++;
      }

      const startTime = new Date(
        studyDate.getFullYear(),
        studyDate.getMonth(),
        studyDate.getDate(),
        startHour,
        0
      );

      const endTime = new Date(
        startTime.getTime() + durationHours * 60 * 60 * 1000
      );

      await googleService.insertEvent({
        summary,
        description,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: "Asia/Kolkata"
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "Asia/Kolkata"
        }
      });
    }

    res.send("✅ Smart Study Plan added");

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate study planner");
  }
};
