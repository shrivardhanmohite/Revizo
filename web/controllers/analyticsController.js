const Topic = require("../models/Topic");

exports.showAnalytics = async (req, res) => {
  const topics = await Topic.find({
    userId: req.session.user._id
  });

  const totalTopics = topics.length;

  const stageStats = {
    started: topics.filter(t => t.studyStage === "started").length,
    basics: topics.filter(t => t.studyStage === "basics").length,
    practice: topics.filter(t => t.studyStage === "practice").length,
    revision: topics.filter(t => t.studyStage === "revision").length,
    ready: topics.filter(t => t.studyStage === "ready").length
  };

  const importantTopics = topics.filter(
    t => t.importance === "VV-IMP" || t.importance === "V-IMP"
  );

  res.render("analytics", {
    totalTopics,
    stageStats,
    importantTotal: importantTopics.length,
    importantReady: importantTopics.filter(t => t.studyStage === "ready").length,
    importantNotReady:
      importantTopics.length -
      importantTopics.filter(t => t.studyStage === "ready").length
  });
};
