const Topic = require("../models/Topic");
const axios = require("axios");

exports.showPage = (req, res) => {
  res.render("mockPaper", { paper: null });
};

exports.generatePaper = async (req, res) => {
  try {
    const topics = await Topic.find({
      userId: req.session.user._id,
      importance: { $in: ["VV-IMP", "V-IMP"] }
    }).limit(10);

    if (!topics.length) {
      return res.render("mockPaper", {
        paper: "No important topics available to generate mock paper."
      });
    }

    const syllabusText = topics
      .map(t => `Topic: ${t.title}\nContent: ${t.content}`)
      .join("\n\n");

    const response = await axios.post(
      "http://127.0.0.1:8000/mock-paper",
      { syllabus: syllabusText }
    );

    res.render("mockPaper", { paper: response.data.paper });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate mock paper");
  }
};
