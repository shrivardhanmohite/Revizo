require("dotenv").config({path:"./web/.env"});
const mongoose = require("mongoose");

// ✅ Correct path based on your structure
const Department = require("./web/models/department");

// 🔗 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log("Connection Error:", err));

async function seed() {
  try {
    // Clear old data
    await Department.deleteMany({});

    // Insert departments with your links
    await Department.insertMany([
      {
        name: "First Year",
        driveLink: "https://drive.google.com/drive/folders/1pst3QINxAxft0zCz_skP4le-zYevFsnn?usp=sharing",
        hasYearSegregation: false
      },
      {
        name: "Mechanical",
        driveLink: "https://drive.google.com/drive/folders/1rnCmoMUZfm9XrgLGF7jNO6DwEeM-tAjM?usp=sharing"
      },
      {
        name: "Food",
        driveLink: "https://drive.google.com/drive/folders/1YAcJDFa6dPEuMcsCARZDcz5ZCtSp_qZo?usp=sharing"
      },
      {
        name: "CST",
        driveLink: "https://drive.google.com/drive/folders/1jueMyXurthBZp3-jr5I9vgdP3qQqNEye?usp=sharing"
      },
      {
        name: "Chemical",
        driveLink: "https://drive.google.com/drive/folders/1MUi-7F0EGqTtxXFwDHsp8QWozZ-PPAUH?usp=sharing"
      },
      {
        name: "Civil",
        driveLink: "https://drive.google.com/drive/folders/1Jh9xCcEg-nG26x_XYCy1w4zoKOikZRRb?usp=sharing"
      }
    ]);

    console.log("Departments Seeded Successfully 🚀");
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding Error:", error);
    mongoose.connection.close();
  }
}

seed();