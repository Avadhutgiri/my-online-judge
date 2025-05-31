const fs = require('fs');
const { User, Submission } = require('../models');
const { Problem, ProblemSample, Team } = require('../models');

const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");


exports.registerAdmin = async (req, res) => {
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
}

exports.loginAdmin = async (req, res) => {
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
            { expiresIn: "1d" }
        );
        res.cookie("token", token, {
            httpOnly: true,    // Prevents JavaScript access
            secure: true, // Secure only in production
            sameSite: "None", // Helps prevent CSRF attacks
            maxAge: 2 * 60 * 60 * 1000 // 2 hours
        });
        res.status(200).json({ message: "User logged in successfully", token });
    } catch (error) {
        res
            .status(400)
            .json({ error: "Error logging in User", details: error.message });
    }
}


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: [
                "id",
                "username",
                "email",
                "is_junior",
                "event_name",
                "role",
                "created_at",
            ],
        });
        res.json(users);
    } catch (error) {
        res
            .status(500)
            .json({ error: "Error fetching users", details: error.message });
    }
}

exports.getAllTeams = async (req, res) => {
    try {
        const teams = await Team.findAll({
            attributes: [
                "id",
                "team_name",
                "user1_id",
                "user2_id",
                "event_name",
                "is_junior",
                "score",
                "correct_submission",
                "wrong_submission",
                "first_solve_time",
            ],
            include: [
                {
                    model: User,
                    as: 'Users',
                    attributes: ['id', 'username', 'email']
                }
            ]
        });
        res.json({ teams });
    } catch (error) {
        res.status(500).json({ error: "Error fetching teams", details: error.message });
    }
}
exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.findAll({
            attributes: [
                "id",
                "title",
                "is_junior",
                "event_name",
                "created_at",
                "test_case_path",
            ],
        });
        res.json(problems);
    } catch (error) {
        res.status(500).json({ error: "Error fetching problems", details: error.message });
    }
}
// Get all submissions without filters
exports.getAllSubmissions = async (req, res) => {
    try {
        // console.log("getAllSubmissions");
        const submissions = await Submission.findAll({
            include: [
                {
                    model: Problem,
                    as: 'Problem',
                    attributes: ['title']
                },
                {
                    model: Team,
                    as: 'Team',
                    attributes: ['team_name']
                }
            ],
            attributes: ['id', 'team_id', 'problem_id', 'result',  'submitted_at', 'code','language']
        });
        // console.log(submissions);
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: "Error fetching submissions", details: error.message });
    }
}

// Get submissions filtered by event_name and is_junior
exports.getSubmissionsByEvent = async (req, res) => {
    try {
        const { event_name, is_junior } = req.query;

        const submissions = await Submission.findAll({
            include: [
                {
                    model: Problem,
                    attributes: ['title']
                },
                {
                    model: Team,
                    attributes: ['team_name']
                }
            ],
            where: { event_name, is_junior },
            attributes: ['id', 'team_id', 'problem_id', 'result', 'execution_time', 'memory_usage', 'created_at']
        });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching submissions', details: error.message });
    }
}

// Get submissions filtered by team_id
exports.getSubmissionsByTeam = async (req, res) => {
    try {
        const { team_id } = req.query;

        const submissions = await Submission.findAll({
            include: [
                {
                    model: Problem,
                    attributes: ['title']
                },
                {
                    model: Team,
                    attributes: ['team_name']
                }
            ],
            where: { team_id },
            attributes: ['id', 'problem_id', 'result', 'execution_time', 'memory_usage', 'created_at']
        });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching submissions', details: error.message });
    }
}

exports.addProblem = async (req, res) => {
    try {
        const {
            title, description, score, input_format, output_format,
            constraints, test_case_path, is_junior, event_name,
            time_limit, memory_limit, samples
        } = req.body;

        // Validate required fields
        if (!title || !input_format || !output_format || !event_name) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // Validate samples array
        if (!Array.isArray(samples) || samples.length === 0) {
            return res.status(400).json({ error: "Samples must be a non-empty array." });
        }

        // Create the problem in the database
        const newProblem = await Problem.create({
            title, description, score, input_format, output_format,
            constraints, test_case_path, is_junior, event_name,
            time_limit, memory_limit
        });

        // Insert samples into the ProblemSample table, including the explanation
        const problemSamples = samples.map(sample => ({
            problem_id: newProblem.id,
            input: sample.input,
            output: sample.output,
            explanation: sample.explanation || null
        }));

        await ProblemSample.bulkCreate(problemSamples);

        res.status(201).json({
            message: "Problem created successfully with samples",
            problem: newProblem
        });
    } catch (error) {
        console.error("Error creating problem:", error);
        res.status(500).json({ error: "Error creating problem", details: error.message });
    }
};



exports.putProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, score, input_format, output_format, constraints, test_case_path } = req.body;

        const problem = await Problem.findByPk(id);
        if (!problem) {
            return res.status(404).json({ error: `Problem with ID ${id} not found` });
        }

        problem.title = title || problem.title;
        problem.description = description || problem.description;
        problem.input_format = input_format || problem.input_format;
        problem.score = score || problem.score;
        problem.output_format = output_format || problem.output_format;
        problem.constraints = constraints || problem.constraints;
        problem.test_case_path = test_case_path || problem.test_case_path;

        await problem.save();

        res.json({ message: "Problem updated successfully", problem });
    } catch (error) {
        res
            .status(500)
            .json({ error: "Error updating problem", details: error.message });
    }
}

exports.deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const problem = await Problem.findByPk(id);
        if (!problem) {
            return res.status(404).json({ error: `Problem with ID ${id} not found` });
        }
        await problem.destroy();

        res.status(200).json({ message: `Problem with ID ${id} deleted successfully` });
    } catch (error) {
        res.status(500).json({ error: "Error deleting problem", details: error.message });
    }
}

exports.addSolution = async (req, res) => {
    try {
        const { problem_id } = req.body;

        const problem = await Problem.findByPk(problem_id);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded!' });
        }
        problem.solution = `problems/${problem_id}/`;
        await problem.save();

        res.json({ message: 'Solution uploaded successfully!' });

    }
    catch (error) {
        res.status(500).json({ error: "Error uploading solution", details: error.message });
    }
}
exports.uploadTestcases = async (req, res) => {
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
}

// Get all teams and allfrom that team 
exports.getTeams = async (req, res) => {
    try {
        const { event_name, is_junior } = req.query; // Extract filters from query parameters

        // Define the filter conditions
        const filters = {};
        if (event_name) filters.event_name = event_name; 
        if (is_junior !== undefined) filters.is_junior = is_junior === "true"; 

        // Fetch teams based on filters with their associated users
        const teams = await Team.findAll({
            where: filters,
            include: [
                {
                    model: User,
                    as: "Users",
                    attributes: ["id", "username", "email"], // Fetch only necessary fields
                },
            ],
            attributes: ["id", "team_name", "event_name", "is_junior"],
        });

        res.json({ status: "success", data: teams });
    } catch (error) {
        console.error("Error fetching teams with users:", error);
        res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
}

// Get submission by its id
exports.getSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await Submission.findByPk(id, {
            include: [
                {
                    model: Problem,
                    attributes: ['title']
                },
                {
                    model: Team,
                    attributes: ['team_name']
                }
            ]
        });

        if (!submission) {
            return res.status(404).json({ error: "Submission not found" });
        }

        res.json(submission);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching submission', details: error.message });
    }
}
