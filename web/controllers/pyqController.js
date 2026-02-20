const Department = require("../models/department");

exports.showDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.render("pyqs/index", { departments });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.openDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).send("Department not found");
    }

    res.redirect(department.driveLink);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};