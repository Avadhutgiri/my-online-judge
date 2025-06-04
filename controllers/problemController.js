const path = require("path");
const fs = require("fs");
const { Problem, ProblemSample, Submission } = require("../models");
const exp = require("constants");
exports.getProblems = async (req, res) => {
    try {
        const { event_name, is_junior } = req.user;

        // Fetch problems and include their samples
        const problems = await Problem.findAll({
            where: { event_name, is_junior },
            include: [{ model: ProblemSample, attributes: ['input', 'output', 'explanation']}]
        });

        if (problems.length === 0) {
            return res.status(404).json({ error: "No problems found" });
        }

        // Transform the response to include sample data
        const response = problems.map(problem => ({
            id: problem.id,
            title: problem.title,
            description: problem.description,
            input_format: problem.input_format,
            output_format: problem.output_format,
            constraints: problem.constraints,
            score: problem.score,
            event_name: problem.event_name,
            is_junior: problem.is_junior,
            samples: problem.ProblemSamples.map(sample => ({
                input: sample.input,
                output: sample.output,
                explanation: sample.explanation
            }))
        }));

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching problems:", error);
        res.status(500).json({ error: 'Error fetching problems', details: error.message });
    }
};

exports.getProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const problem_id = id;
        console.log("this is params",req.params);
        console.log("this is pid",id);
        const problem = await Problem.findByPk(problem_id, {
            include: [{ model: ProblemSample, attributes: ['input', 'output', 'explanation']}]
        });

        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        const response = {
            id: problem.id,
            title: problem.title,
            description: problem.description,
            input_format: problem.input_format,
            output_format: problem.output_format,
            constraints: problem.constraints,
            score: problem.score,
            event_name: problem.event_name,
            is_junior: problem.is_junior,
            samples: problem.ProblemSamples.map(sample => ({
                input: sample.input,
                output: sample.output,
                explanation: sample.explanation
            })),
            time_limit: problem.time_limit,
            memory_limit: problem.memory_limit,
            test_case_path: problem.test_case_path,
            solution: problem.solution
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching problem:", error);
        res.status(500).json({ error: 'Error fetching problem', details: error.message });
    }
}


exports.getTestCase = async (req, res) => {
    try {
        const { problem_id } = req.params;
        const problem = await Problem.findByPk(problem_id);

        if (!problem || !problem.test_case_path) {
            return res.status(404).json({ error: "Problem or test cases not found" });
        }

        const testCaseDir = path.join(__dirname, "../", problem.test_case_path);
        console.log(__dirname);
        console.log(testCaseDir);
        const files = fs.readdirSync(testCaseDir);

        const inputs = files.filter((file) => file.startsWith("input"));
        const outputs = files.filter((file) => file.startsWith("output"));

        res.status(200).json({ inputs, outputs });
    } catch (error) {
        res
            .status(500)
            .json({ error: "Error fetching test cases", details: error.message });
    }
}

exports.getProblemStats = async (req, res) => {
    try {
        const { problem_id } = req.params;

        // Ensure problem_id is a valid number
        if (isNaN(problem_id)) {
            return res.status(400).json({ status: "error", message: "Invalid problem ID" });
        }

        const problemStats = await Submission.findOne({
            attributes: [
                'problem_id',
                [Submission.sequelize.fn('COUNT', Submission.sequelize.col('id')), 'total_submissions'],
                [Submission.sequelize.fn('SUM', Submission.sequelize.literal("CASE WHEN result = 'Accepted' THEN 1 ELSE 0 END")), 'correct_submissions'],
                [Submission.sequelize.fn('SUM', Submission.sequelize.literal("CASE WHEN result != 'Accepted' THEN 1 ELSE 0 END")), 'wrong_submissions']
            ],
            where: { problem_id },  // Filter by problem_id
            group: ['problem_id'],
            raw: true
        });

        // If no submissions found, return empty stats
        if (!problemStats) {
            return res.status(200).json({
                status: "success",
                data: {
                    problem_id,
                    total_submissions: 0,
                    correct_submissions: 0,
                    wrong_submissions: 0,
                    success_rate: "0%"
                }
            });
        }

        // Calculate success rate
        const successRate = problemStats.total_submissions > 0
            ? ((problemStats.correct_submissions / problemStats.total_submissions) * 100).toFixed(2) + "%"
            : "0%";

        // Format response
        const formattedStats = {
            problem_id: problemStats.problem_id,
            total_submissions: problemStats.total_submissions,
            correct_submissions: problemStats.correct_submissions,
            wrong_submissions: problemStats.wrong_submissions,
            success_rate: successRate
        };

        res.status(200).json({ status: "success", data: formattedStats });

    } catch (error) {
        console.error("Error fetching problem stats:", error);
        res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};
