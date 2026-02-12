const { createEvents } = require("ics");
const fs = require("fs");
const path = require("path");

// ===============================
// Generate Exam Calendar Event
// ===============================
exports.generateExamCalendar = async (req, res) => {
  try {
    const { examDate } = req.body;

    const [year, month, day] = examDate.split("-").map(Number);

    const events = [
      {
        title: "📘 Exam Day",
        description: "Exam scheduled via EduAI",
        start: [year, month, day],
        duration: { hours: 3 }
      }
    ];

    createEvents(events, (error, value) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Calendar generation failed");
      }

      const filePath = path.join(__dirname, "../temp/eduai-exam.ics");
      fs.writeFileSync(filePath, value);

      res.download(filePath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate calendar");
  }
};
// ===============================
// Generate Intelligent Study Planner Calendar
// ===============================
exports.generateStudyPlannerCalendar = async (req, res) => {
  try {
    const { examDate, preference } = req.body; 
    // preference = "morning" | "evening"

    const exam = new Date(examDate);
    const today = new Date();

    const daysLeft = Math.ceil(
      (exam - today) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft <= 0) {
      return res.status(400).send("Invalid exam date");
    }

    const topics = await Topic.find({
      userId: req.session.user._id
    });

    if (!topics.length) {
      return res.status(400).send("No topics available");
    }

    const events = [];
    let topicIndex = 0;

    for (let i = 0; i < daysLeft; i++) {
      const studyDate = new Date(today);
      studyDate.setDate(today.getDate() + i + 1);

      const isRevisionDay = i >= daysLeft - 3;

      let title, description, duration, color;

      // ⏱ Time preference
      const startHour = preference === "morning" ? 6 : 19;

      if (isRevisionDay) {
        title = "🔁 Revision Day";
        description = "Final revision before exam (EduAI)";
        duration = { hours: 2 };
        color = "blue";
      } else {
        const topic = topics[topicIndex % topics.length];

        duration = topic.importance === "VV-IMP"
          ? { hours: 3 }
          : { hours: 2 };

        title = `📘 Study: ${topic.title}`;
        description = `Importance: ${topic.importance}`;

        color =
          topic.importance === "VV-IMP"
            ? "red"
            : topic.importance === "IMP"
            ? "orange"
            : "green";

        topicIndex++;
      }

      events.push({
        title,
        description,
        start: [
          studyDate.getFullYear(),
          studyDate.getMonth() + 1,
          studyDate.getDate(),
          startHour,
          0
        ],
        duration,
        categories: [color] // color hint (supported by most calendars)
      });
    }

    createEvents(events, (error, value) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Calendar generation failed");
      }

      const filePath = path.join(
        __dirname,
        "../temp/eduai-smart-study-planner.ics"
      );

      fs.writeFileSync(filePath, value);
      res.download(filePath);
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate study planner calendar");
  }
};