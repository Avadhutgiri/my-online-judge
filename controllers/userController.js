const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Team } = require("../models");
require("dotenv").config();

exports.registerUser = async (req, res) => {
    try {
        console.log(req.body); // Debug incoming request body
        const { username, email, password, is_junior, event_name } = req.body;

        if (typeof password !== 'string') {
            return res.status(400).json({ error: 'Password must be a string' });
        }

        const checkUser = await User.findOne({ where: { username, is_junior, event_name } });
        if (checkUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const SoloTeam = await Team.create({
            team_name: username,
            user1_id: null,
            user2_id: null,
            event_name,
            is_junior,
            score: 0
        });

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            is_junior,
            event_name,
            team_id: SoloTeam.id
        });

        await SoloTeam.update({ user1_id: newUser.id });

        res.status(201).json({ message: 'User registered successfully!', user: newUser.username });
    } catch (error) {
        res.status(400).json({ error: 'Error registering user', details: error.message });
    }
}

exports.RegisterTeam = async (req, res) => {
    try {
        const { team_name, username2 } = req.body;
        const { user1_id } = req.user.id;
        const event_name = req.user.event_name;

        const is_junior = req.user.event_name;

        const user1 = await User.findByPk(user1_id);

        if (!user1 || user1.team_id !== user1.id) {
            return res.status(400).json({ error: "User is not registered or already in a team." });
        }

        const user2 = await User.findOne({ where: { username: username2 } });

        if (!user2) {
            return res.status(404).json({ error: "Teammate not found. They must register first." });
        }

        if (user2.team_id !== user2.id) {
            return res.status(400).json({ error: "Teammate is already in a team." });
        }

        const team = await Team.create({
            team_name,
            user1_id,
            user2_id: user2.id,
            event_name,
            is_junior,
            score: 0
        })
        await Team.destroy({ where: { id: user1.team_id } });
        await Team.destroy({ where: { id: user2.team_id } });

        await User.update({ team_id: team.id }, { where: { id: user1_id } });
        await User.update({ team_id: team.id }, { where: { id: user2.id } });

        return res.status(201).json({ message: "Team registered successfully!", team: team.team_name });
    }
    catch (error) {
        console.error("Error registering team:", error);
        return res.status(500).json({ error: "Error registering team", details: error.message });
    }
}

exports.Login = async (req, res) => {
    try {
        const { username, password, team_login, team_name } = req.body;

        let user ;

        if (team_login){
            const team = await Team.findOne({ where: { team_name } });

            if(!team){
                return res.status(404).json({ error: "Team not found. Please register first." });
            }

            user = await User.findOne({ where: { username, team_id : team.id } });

            if (!user){
                return res.status(404).json({ error: "User not found in this team" });
            }
        }
        else{
            user = await User.findOne({ where: { username } });
            if (!user){
                return res.status(404).json({ error: "User not found. Please register first." });
            }

        }
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ error: "Invalid password." });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                event_name: user.event_name,
                is_junior: user.is_junior,
                team_id: user.team_id 
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.status(200).json({ message: "User logged in successfully", token:token, user: user.username, team_name: team_name });

    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Error logging in", details: error.message });
    }
}



exports.GetProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user profile' });
    }
};