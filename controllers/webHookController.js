const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const Team = require('../models/Team');

async function updateDatabase(submissionId, updateData) {
    console.log(`Updating database for submission ${submissionId}:`, updateData);

    try {
        const { status,failed_test_case, message } = updateData;

        // Find submission, user, and problem records
        const submission = await Submission.findByPk(submissionId);
        if (!submission) {
            console.log(`Submission ${submissionId} not found in database.`);
            return { error: `Submission ${submissionId} not found` };
        }

        const team = await Team.findByPk(submission.team_id);
        const problem = await Problem.findByPk(submission.problem_id);

        if (!team || !problem) {
            console.log(`User or Problem not found.`);
            return { error: "User or Problem not found for submission." };
        }

        const existingCorrectSubmission = await Submission.findOne({
            where: {
                team_id: submission.team_id,
                problem_id: submission.problem_id,
                result: 'Accepted'
            }
        });

        if (status.toLowerCase() === 'accepted') {
            if (!existingCorrectSubmission) {
                team.score += problem.score;
                team.correct_submission += 1;
            }
            if (!team.first_solve_time) {
                team.first_solve_time = new Date();
            }

        }
        else {
            team.wrong_submission += 1;
        }

        // Save updated records
        await team.save();
        submission.result = status;
        submission.result = status;
        if (failed_test_case) {
            submission.failed_test_case = failed_test_case;
        }
        if (message) {
            submission.message = message;
        }
        await team.save();

        await submission.save();

        console.log(`Database updated successfully for submission ${submissionId}.`);
        return { success: true };
    } catch (error) {
        console.error(`Error updating database for submission ${submissionId}:`, error);
        return { error: "Database update failed" };
    }
}
exports.RunWebhook = async (req, res) => {
    try {
        const { submission_id, status, message, user_output } = req.body;

        if (status === "executed_successfully") {
            console.log(`Run Result: ${submission_id}`);
            console.log(`User Output: ${user_output}`);
        } else {
            console.log(`Run Error: ${submission_id}`);
            console.log(`Message: ${message}`);
        }

        res.status(200).json({ message: "Run webhook processed successfully." });
    } catch (error) {
        console.error("Error processing run webhook:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.SystemWebhook = async (req, res) => {
    try {
        const { submission_id, status, message, expected_output } = req.body;

        if (status === "executed_successfully") {
            console.log(`Run Result: ${submission_id}`);
            console.log(`Expected Output: ${expected_output}`);
        } else {
            console.log(`Run Error: ${submission_id}`);
            console.log(`Message: ${message}`);
        }

        res.status(200).json({ message: "System webhook processed successfully." });
    } catch (error) {
        console.error("Error processing system webhook:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};


exports.SubmitWebhook = async (req, res) => {
    try {
        const { submission_id, status, message, failed_test_case } = req.body;

        if (status === "Accepted") {
            console.log(`Submission Accepted: ${submission_id}`);
        } else {
            console.log(`Submission Failed: ${submission_id}`);
            console.log(`Failed Test Case: ${failed_test_case}`);
            console.log(`Message: ${message}`);
        }

        // Update the database
        const dbResponse = await updateDatabase(submission_id, { status, message, failed_test_case });
        if (dbResponse?.error) {
            return res.status(500).json({ message: dbResponse.error });
        }

        res.status(200).json({ message: "Submit webhook processed successfully." });
    } catch (error) {
        console.error("Error processing submit webhook:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}