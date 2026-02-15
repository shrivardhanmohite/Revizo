const Topic = require("../models/Topic");

exports.showPlanner = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const today = new Date();
    let examDate = null;
    let daysLeft = null;
    let progressPercent = null;
    let completionPercent = 0;
    let dailySuggestion = null;

    if (req.query.examDate) {
      examDate = new Date(req.query.examDate);

      daysLeft = Math.ceil(
        (examDate - today) / (1000 * 60 * 60 * 24)
      );

      if (daysLeft > 0) {
        const totalDuration = daysLeft + 1;
        progressPercent = Math.max(
          0,
          Math.min(100, 100 - (daysLeft / totalDuration) * 100)
        );
      }
    }

    const topics = await Topic.find({
      userId: req.session.user._id
    });

    const stats = {
      started: topics.filter(t => t.studyStage === "started").length,
      basics: topics.filter(t => t.studyStage === "basics").length,
      practice: topics.filter(t => t.studyStage === "practice").length,
      revision: topics.filter(t => t.studyStage === "revision").length,
      ready: topics.filter(t => t.studyStage === "ready").length
    };

    // Completion %
    if (topics.length > 0) {
      completionPercent = Math.round(
        (stats.ready / topics.length) * 100
      );
    }

    // AI Smart Suggestion
    const priorityMap = {
      "VV-IMP": 4,
      "IMP": 3,
      "M-IMP": 2,
      "V-IMP": 1
    };

    const pending = topics
      .filter(t => t.studyStage !== "ready")
      .sort((a, b) =>
        priorityMap[b.importance] - priorityMap[a.importance]
      );

    if (pending.length > 0) {
      dailySuggestion = pending[0];
    }

    res.render("studyPlanner", {
      topics,
      examDate,
      daysLeft,
      stats,
      googleConnected: !!req.session.googleTokens,
      progressPercent,
      completionPercent,
      dailySuggestion
    });

  } catch (err) {
    console.error("Study Planner Error:", err);
    res.status(500).send("Failed to load study planner");
  }
};

exports.updateStage = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const { topicId, studyStage } = req.body;

    await Topic.findOneAndUpdate(
      { _id: topicId, userId: req.session.user._id },
      { studyStage }
    );

    res.redirect("/study-planner");

  } catch (err) {
    console.error("Update Stage Error:", err);
    res.status(500).send("Failed to update stage");
  }
};
