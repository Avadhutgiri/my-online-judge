const express = require("express");
const { User, Problem, Submission } = require("../models");
const adminAuthenticate = require("../middlewares/adminMiddleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer"); // Make sure this is correctly imported
const fs = require("fs");
const path = require("path");
const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
      destination: (req, file, cb) => {
          const { problem_id } = req.body;
          const destinationPath = path.join(__dirname, '../problems', `${problem_id}`);
          
          // Create the directory if it doesn't exist
          if (!fs.existsSync(destinationPath)) {
              fs.mkdirSync(destinationPath, { recursive: true });
          }

          // Save all uploaded files in the 'inputs' directory
          cb(null, destinationPath);
      },
      filename: (req, file, cb) => {
          cb(null, file.originalname);
      }
  }),
  fileFilter: (req, file, cb) => {
      // Optional: Filter files (e.g., only .txt files)
      if (path.extname(file.originalname) !== '.txt') {
          return cb(new Error('Only .txt files are allowed!'), false);
      }
      cb(null, true);
  }
});

router.post("/problems", adminAuthenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      score,
      input_format,
      output_format,
      constraints,
      test_case_path,
      is_junior,
      event_name,
      time_limit,
      memory_limit,
      sample_input,       // New field
      sample_output       // New field
    } = req.body;

    // Validate the required fields
    if (!title || !input_format || !output_format || !event_name) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Create a new problem
    const newProblem = await Problem.create({
      title,
      description,
      score,
      input_format,
      output_format,
      constraints,
      test_case_path,
      is_junior,
      event_name,
      time_limit,
      memory_limit,
      sample_input,      // Store sample input
      sample_output      // Store sample output
    });

    res.status(201).json({
      message: "Problem created successfully",
      problem: newProblem,
    });
  } catch (error) {
    console.error("Error creating problem:", error);
    res.status(500).json({ error: "Error creating problem", details: error.message });
  }
});


router.post('/upload-testcases', adminAuthenticate, upload.array('files'), async (req, res) => {
  try {
    const { problem_id } = req.body;

    // Validate problem existence
    const problem = await Problem.findByPk(problem_id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded!' });
    }

    // Update test case path in the database
    problem.test_case_path = `problems/${problem_id}/`;
    await problem.save();

    res.json({ message: 'Test cases uploaded successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error uploading test cases', details: error.message });
  }
});


router.post("/register-admin", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await User.create({
      username,
      email,
      is_junior: false,
      event_name: "Clash",
      password: hashedPassword,
      role: "admin", // Ensure the role is set to admin
    });

    res.status(201).json({
      message: "Admin registered successfully!",
      admin: newAdmin.username,
    });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error registering admin", details: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json("User Not Found");
    }
    const ValidPassword = await bcrypt.compare(password, user.password);

    if (!ValidPassword) {
      return res.status(400).json("Invalid Password");
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        is_junior: user.is_junior,
        event_name: user.event_name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "User logged in successfully", token });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error logging in User", details: error.message });
  }
});

router.get("/users", adminAuthenticate, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "username",
        "email",
        "score",
        "is_junior",
        "event_name",
        "correct_submission",
        "wrong_submission",
      ],
    });
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching users", details: error.message });
  }
});

router.post("/problems", adminAuthenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      input_format,
      output_format,
      constraints,
      test_cases,
      is_junior,
      event_name,
    } = req.body;
    const newProblem = await Problem.create({
      title,
      description,
      input_format,
      output_format,
      constraints,
      test_cases,
      is_junior,
      event_name,
    });
    res.status(201).json({
      message: "Problem created successfully",
      problem: newProblem.newProblem,
    });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error creating problem", details: error.message });
  }
});

router.put("/problems/:id", adminAuthenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      input_format,
      output_format,
      constraints,
      test_cases,
    } = req.body;

    const problem = await Problem.findByPk(id);
    if (!problem) {
      return res.status(404).json({ error: `Problem with ID ${id} not found` });
    }

    problem.title = title || problem.title;
    problem.description = description || problem.description;
    problem.input_format = input_format || problem.input_format;
    problem.output_format = output_format || problem.output_format;
    problem.constraints = constraints || problem.constraints;
    problem.test_cases = test_cases || problem.test_cases;

    await problem.save();

    res.json({ message: "Problem updated successfully", problem });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating problem", details: error.message });
  }
});

router.delete("/problems/:id", adminAuthenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findByPk(id);
    if (!problem) {
      return res.status(404).json({ error: `Problem with ID ${id} not found` });
    }
    await problem.destroy();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting problem", details: error.message });
  }
});

router.get("/submissions", adminAuthenticate, async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      attributes: [
        "id",
        "user_id",
        "problem_id",
        "result",
        "execution_time",
        "memory_usage",
      ],
    });
    res.json(submissions);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching submissions", details: error.message });
  }
});

router.get("/stats", adminAuthenticate, async (req, res) => {
  try {
    const totalSubmissions = await Submission.count();
    const correctSubmissions = await Submission.count({
      where: { result: "Accepted" },
    });
    const wrongSubmissions = totalSubmissions - correctSubmissions;

    res.json({
      totalSubmissions,
      correctSubmissions,
      wrongSubmissions,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching stats", details: error.message });
  }
});

module.exports = router;
