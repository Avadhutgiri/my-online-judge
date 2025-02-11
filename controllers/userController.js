const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


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

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            is_junior,
            event_name
        });


        res.status(201).json({ message: 'User registered successfully!', user: newUser.username });
    } catch (error) {
        res.status(400).json({ error: 'Error registering user', details: error.message });
    }
}

exports.loginUser = async (req, res) => {
    try {
        const { username, password, is_junior, event_name } = req.body;
        const user = await User.findOne({
            where: { username, is_junior, event_name },
        });

        if (!user) {
            return res.status(400).json({ error: "User not Found" });
        }
        const ValidPassword = await bcrypt.compare(password, user.password);

        if (!ValidPassword) {
            return res.status(400).json({ error: "Invalid Password" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                is_junior: user.is_junior,
                event_name: user.event_name,
            },
            process.env.JWT_SECRET,
            { expiresIn: "12h" }
        );
        res.status(200).json({ message: "User logged in successfully", token });
    } catch (error) {
        res
            .status(400)
            .json({ error: "Error logging in User", details: error.message });
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