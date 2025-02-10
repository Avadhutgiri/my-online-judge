const path = require("path");
const fs = require("fs");
const { Problem, ProblemSample } = require("../models");
const exp = require("constants");
exports.getProblems = async (req, res) => {
    try {
        const { event_name, is_junior } = req.user;

        // Fetch problems and include their samples
        const problems = await Problem.findAll({
            where: { event_name, is_junior },
            include: [{ model: ProblemSample, attributes: ['input', 'output', 'explanation'] }]
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

        res.json(response);
    } catch (error) {
        console.error("Error fetching problems:", error);
        res.status(500).json({ error: 'Error fetching problems', details: error.message });
    }
};


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

        res.json({ inputs, outputs });
    } catch (error) {
        res
            .status(500)
            .json({ error: "Error fetching test cases", details: error.message });
    }
}