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
    const normalizedEmail = email.toLowerCase().trim();

    const foundUser = await user.findOne({
      email: normalizedEmail,
    });

    if (foundUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = new user({
      email: normalizedEmail,
      otp,
      otpExpiry,
      otpVerified: false,
    });

    await newUser.save();

    // Development only — remove in production
    console.log(`OTP for ${normalizedEmail}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP generated successfully",
    });

  } catch (error) {
    console.error("Error sending OTP:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
  const foundUser = await user.findOne({
  email: email.toLowerCase().trim(),
}).select("+otp +otpExpiry");
console.log("Found user for OTP verification:", foundUser);

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      !foundUser.otp ||
      foundUser.otp !== String(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      !foundUser.otpExpiry ||
      new Date() > new Date(foundUser.otpExpiry)
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    foundUser.otpVerified = true;
    foundUser.verified = true;

    // Clear OTP after successful verification
    foundUser.otp = undefined;
    foundUser.otpExpiry = undefined;

    await foundUser.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
