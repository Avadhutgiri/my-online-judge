const express = require("express");
const { User, Problem, Submission } = require("../models");
const adminAuthenticate = require("../middlewares/adminMiddleware");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')

const router = express.Router();

router.post('/register-admin', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await User.create({
            username,
            email,
            is_junior: false,
            event_name: "Clash",
            password: hashedPassword,
            role: 'admin'  // Ensure the role is set to admin
        });

        res.status(201).json({ message: 'Admin registered successfully!', admin: newAdmin.username });
    } catch (error) {
        res.status(400).json({ error: 'Error registering admin', details: error.message });
    }
});

// router.post('/login', async (req, res) => {
//     try{
//         const { username, password } = req.body;

//         const user = User.findOne({ where: { username} });

//         if(!user){
//             return res.status(404).json("User Not Found");
//         }
//         const ValidPassword = await bcrypt.compare(password, user.password);

//         if(!ValidPassword){
//             return res.status(400).json("Invalid Password")
//         }

//         const token = jwt.sign(
//             {
//             id : user.id,
//             username = user.username        }

//     )
//     }
// })


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

router.delete("/problems/:id", adminAuthenticate, async(req, res) => {
    try{
        const { id } = req.params;
        const problem = await Problem.findByPk(id);
        if(!problem){
            return res.status(404).json({ error: `Problem with ID ${id} not found` });
        }
        await problem.destroy();
    }
    catch(error){
        res.status(500).json({ error: 'Error deleting problem', details: error.message });
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

router.get('/stats', adminAuthenticate, async (req, res) => {
    try {
        const totalSubmissions = await Submission.count();
        const correctSubmissions = await Submission.count( { where: { result : 'Accepted'} });
        const wrongSubmissions = totalSubmissions - correctSubmissions;

        res.json({
            totalSubmissions,
            correctSubmissions,
            wrongSubmissions
        });
    }
    catch (error){
        res.status(500).json({ error: 'Error fetching stats', details: error.message});
    }
})

module.exports = router;