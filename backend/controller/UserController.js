const user = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const foundUser = await user.findOne({ email })

        if (!foundUser) {
            return res.status(401).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, foundUser.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password please try again' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: foundUser._id, role: foundUser.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
        res.json({
            success: true,
            token : token,});
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const sendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const foundUser = await user.findOne({ email });

        if (foundUser) {
            return res.status(404).json({ message: 'User already exists' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Set OTP and expiry time (e.g., 5 minutes from now)
        foundUser.otp = otp;
        foundUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
       const newUser = new user({
            email,
            otp: otp,
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
        });

        await newUser.save();

        console.log(`OTP for ${email}: ${otp}`);

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error during sending OTP:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const foundUser = await user.findOne({ email });

        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP is valid and not expired
        if (foundUser.otp !== otp || foundUser.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Mark OTP as verified
        foundUser.otpVerified = true;
        await foundUser.save();

        res.json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const registerUser = async (req, res) => {
    const { fullname, email, password, confirm_password, phone, role ,graduationYear } = req.body;

    try {
        const foundUser = await user.findOne({ email });

        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        if(confirm_password !== password){
            return res.status(400).json({ message: 'Password and confirm password do not match' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        foundUser.fullname = fullname;
        foundUser.password = hashedPassword;
        foundUser.confirm_password = hashedPassword;
        foundUser.phone = phone;
        foundUser.role = role;
        foundUser.graduationYear = graduationYear;
        foundUser.verifiyed = true; // Mark user as verified after registration
        await foundUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    loginUser,
    sendOtp,
    verifyOtp,
    registerUser
};
