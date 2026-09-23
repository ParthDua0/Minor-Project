const user = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../helper/sendEmail');


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const foundUser = await user.findOne({ email: email.toLowerCase().trim() }).select('+password')

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


    sendVerificationCode(otp, normalizedEmail, res);


    async function sendVerificationCode(otp, email, res) {
  try {
      const message = generateEmailTemplate(otp)
      sendEmail({ email, subject: "Your Verification Code", message })
      res.status(200).json({
        success: true,
        message: "verification code send successfully to your email",
      })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "verification code failed to send",
    }) 
  }
}
 
function generateEmailTemplate(otp) {
  return `
  <!DOCTYPE html> 
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
  </head>

  <body style="
    margin: 0;
    padding: 0;
    background-color: #f4f6f8;
    font-family: Arial, Helvetica, sans-serif;
    color: #24292f;
  ">

    <table width="100%" cellpadding="0" cellspacing="0"
      role="presentation"
      style="background-color: #f4f6f8; padding: 35px 12px;">

      <tr>
        <td align="center">

          <table width="100%" cellpadding="0" cellspacing="0"
            role="presentation"
            style="
              max-width: 560px;
              background-color: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            ">

            <!-- Header -->
            <tr>
              <td style="
                padding: 24px 32px;
                border-bottom: 1px solid #e5e7eb;
              ">
                <h2 style="
                  margin: 0;
                  font-size: 20px;
                  font-weight: 700;
                  color: #1d4ed8;
                ">
                  Career Readiness Portal
                </h2>

                <p style="
                  margin: 6px 0 0;
                  font-size: 13px;
                  color: #6b7280;
                ">
                  Account Verification
                </p>
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding: 32px;">

                <h1 style="
                  margin: 0 0 18px;
                  font-size: 22px;
                  font-weight: 600;
                  color: #111827;
                ">
                  Verify your email address
                </h1>

                <p style="
                  margin: 0 0 16px;
                  font-size: 15px;
                  line-height: 1.7;
                  color: #4b5563;
                ">
                  Hello,
                </p>

                <p style="
                  margin: 0 0 24px;
                  font-size: 15px;
                  line-height: 1.7;
                  color: #4b5563;
                ">
                  We received a request to verify your email address
                  for your Career Readiness Portal account.
                  Please use the verification code below to continue.
                </p>

                <!-- OTP -->
                <div style="
                  padding: 22px;
                  background-color: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 6px;
                  text-align: center;
                  margin-bottom: 24px;
                ">

                  <p style="
                    margin: 0 0 12px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748b;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                  ">
                    Your verification code
                  </p>

                  <p style="
                    margin: 0;
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: 8px;
                    color: #1e293b;
                  ">
                    ${otp}
                  </p>

                </div>

                <p style="
                  margin: 0 0 16px;
                  font-size: 14px;
                  line-height: 1.7;
                  color: #4b5563;
                ">
                  This code will expire in
                  <strong>10 minutes</strong>.
                  Please do not share it with anyone.
                </p>

                <p style="
                  margin: 0;
                  font-size: 14px;
                  line-height: 1.7;
                  color: #4b5563;
                ">
                  If you did not request this verification,
                  you can safely ignore this email.
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="
                padding: 20px 32px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
              ">

                <p style="
                  margin: 0 0 8px;
                  font-size: 13px;
                  color: #374151;
                  font-weight: 600;
                ">
                  Career Readiness Portal Team
                </p>

                <p style="
                  margin: 0;
                  font-size: 12px;
                  line-height: 1.6;
                  color: #9ca3af;
                ">
                  This is an automated email regarding your account.
                  Please do not reply to this message.
                </p>

              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}

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
        const foundUser = await user.findOne({ email: email.toLowerCase().trim() });

        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!foundUser.otpVerified) {
            return res.status(403).json({ message: 'Please verify your email OTP before registration' });
        }
        if(confirm_password !== password){
            return res.status(400).json({ message: 'Password and confirm password do not match' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        foundUser.fullname = fullname;
        foundUser.password = hashedPassword;
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

const updateUser = async (req, res) => {
    const { userId } = tokenData = req.user; // Assuming you have middleware that sets req.user with the decoded JWT data
    const { fullname, email, phone, role, graduationYear } = req.body;

    try {
        const foundUser = await user.findById(userId);

        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        foundUser.fullname = fullname || foundUser.fullname;
        foundUser.email = email || foundUser.email;
        foundUser.phone = phone || foundUser.phone;
        foundUser.role = role || foundUser.role;
        foundUser.graduationYear = graduationYear || foundUser.graduationYear;

        await foundUser.save();

        res.status(200).json({ 
            message: 'User updated successfully', user: foundUser
         });
    } catch (error) {
        console.error('Error during user update:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const foundUser = await user.findById(userId);

        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.findByIdAndDelete(userId);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error during user deletion:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const logoutUser = async (req, res) => {
    const { userId } = req.user

    try {
        const foundUser = await user.findById(userId);

        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Clear JWT token and expiry
        foundUser.jwtToken = undefined;
        foundUser.jwtTokenExpiry = undefined;

        await foundUser.save();

        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error during user logout:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const userinfo = async (req, res) => {
    const { userId } = req.user; 

    try {
        const foundUser = await user.findById(userId);

        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user: foundUser });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    loginUser,
    sendOtp,
    verifyOtp,
    registerUser,
    updateUser,
    deleteUser,
    logoutUser,
    userinfo
};
