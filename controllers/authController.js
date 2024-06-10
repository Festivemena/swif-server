const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');

const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        const verificationCode = crypto.randomBytes(20).toString('hex');
        user.verificationCode = verificationCode;

        await user.save();

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Verify your email',
            text: `Please use the following code to verify your email: ${verificationCode}`,
        };

        transporter.sendMail(mailOptions);

        res.status(200).json({ msg: 'Registration successful, please check your email for the verification code' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

const verify = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid email or verification code' });

        if (user.verificationCode === verificationCode) {
            user.verified = true;
            user.verificationCode = null;
            await user.save();
            res.status(200).json({ msg: 'Email verified successfully' });
        } else {
            res.status(400).json({ msg: 'Invalid email or verification code' });
        }
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        if (!user.verified) return res.status(400).json({ msg: 'Please verify your email first' });

        const payload = { user: { id: user.id } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = { register, verify, login };
