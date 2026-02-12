const Topic = require("../models/Topic");

exports.showPlanner = async (req, res) => {
  const examDate = req.query.examDate ? new Date(req.query.examDate) : null;
  const today = new Date();
  let daysLeft = null;

  if (examDate) {
    daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
  }

  const topics = await Topic.find({
    userId: req.session.user._id
  }).sort({ importance: -1 });

  const stats = {
    started: topics.filter(t => t.studyStage === "started").length,
    basics: topics.filter(t => t.studyStage === "basics").length,
    practice: topics.filter(t => t.studyStage === "practice").length,
    revision: topics.filter(t => t.studyStage === "revision").length,
    ready: topics.filter(t => t.studyStage === "ready").length
  };

  res.render("studyPlanner", { topics, examDate, daysLeft, stats });
};

exports.updateStage = async (req, res) => {
  const { topicId, studyStage } = req.body;

  await Topic.findOneAndUpdate(
    { _id: topicId, userId: req.session.user._id },
    { studyStage }
  );

  res.redirect("/study-planner");
};
