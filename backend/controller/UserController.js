const user = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../helper/sendEmail');
const { totalMonths } = require('../helper/Resumecleaner');
const { buildProfileResponse } = require('../helper/Profileresponse');

const normalizeEmail = (email) => {
    if (!email || typeof email !== 'string' || !email.trim()) {
        return null;
    }

    return email.toLowerCase().trim();
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const foundUser = await user.findOne({ email: normalizedEmail }).select('+password')

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

const requestPasswordReset = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        if (!email) return res.status(400).json({ message: 'Email is required' });
        const foundUser = await user.findOne({ email }).select('+resetOtp +resetOtpExpiry');
        // Keep the response neutral so this endpoint cannot be used to enumerate accounts.
        if (!foundUser) return res.json({ message: 'If an account exists, a reset code has been sent.' });
        const code = String(Math.floor(100000 + Math.random() * 900000));
        foundUser.resetOtp = code;
        foundUser.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await foundUser.save();
        await sendEmail({
            email,
            subject: 'Reset your PlaceReady password',
            message: `<p>Use this code to reset your password:</p><h1 style="letter-spacing:6px">${code}</h1><p>This code expires in 10 minutes. Do not share it.</p>`
        });
        return res.json({ message: 'If an account exists, a reset code has been sent.' });
    } catch (error) {
        console.error('Password reset request error:', error);
        return res.status(500).json({ message: 'Unable to send reset code' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { code, password, confirmPassword } = req.body;
        if (!email || !code || !password || !confirmPassword) return res.status(400).json({ message: 'Email, code and both password fields are required' });
        if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });
        if (password.length < 8) return res.status(400).json({ message: 'Password must have at least 8 characters' });
        const foundUser = await user.findOne({ email }).select('+password +resetOtp +resetOtpExpiry');
        if (!foundUser || !foundUser.resetOtp || foundUser.resetOtp !== String(code) || !foundUser.resetOtpExpiry || foundUser.resetOtpExpiry < new Date()) {
            return res.status(400).json({ message: 'The reset code is invalid or has expired' });
        }
        foundUser.password = await bcrypt.hash(password, 10);
        foundUser.resetOtp = undefined;
        foundUser.resetOtpExpiry = undefined;
        await foundUser.save();
        return res.json({ message: 'Password reset successfully. You can now sign in.' });
    } catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({ message: 'Unable to reset password' });
    }
};

const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const foundUser = await user.findOne({ email: normalizedEmail });

    if (foundUser && foundUser.otpVerified) { 
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    if (foundUser) {
      foundUser.otp = otp;
      foundUser.otpExpiry = otpExpiry;
      foundUser.otpVerified = false;
      await foundUser.save();
    } else {
      const newUser = new user({
        email: normalizedEmail,
        otp,
        otpExpiry,
        otpVerified: false,
      });

      await newUser.save();
    }



    await sendVerificationCode(otp, normalizedEmail, res);


    async function sendVerificationCode(otp, email, res) {
  try {
      const message = generateEmailTemplate(otp)
      await sendEmail({ email, subject: "Your Verification Code", message })
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
  const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

  const foundUser = await user.findOne({
  email: normalizedEmail,
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
    const { fullname, email, password, confirm_password, phone, role ,graduationYear, company, designation } = req.body;

    try {
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const foundUser = await user.findOne({ email: normalizedEmail });

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
        foundUser.role = ['student', 'recruiter'].includes(role) ? role : 'student';
        foundUser.graduationYear = graduationYear;
        if (foundUser.role === 'recruiter') foundUser.recruiterProfile = { company, designation };
        foundUser.verifiyed = true; // Mark user as verified after registration
        await foundUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const str = (v) => (typeof v === 'string' ? v.trim() : undefined);
const num = (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? undefined : Number(v));
const date = (v) => {
    if (!v) return undefined;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
};
const strList = (list) => (Array.isArray(list) ? list.map(str).filter(Boolean) : []);
 
const cleanEducation = (list) => list
    .map((e) => ({
        degree: str(e.degree),
        branch: str(e.branch),
        institute: str(e.institute),
        startYear: num(e.startYear),
        year: num(e.year),
        cgpa: num(e.cgpa),
        percentage: num(e.percentage)
    }))
    .filter((e) => e.degree || e.institute);
 
const cleanExperience = (list) => list
    .map((e) => {
        const isCurrent = Boolean(e.isCurrent);
        return {
            title: str(e.title),
            org: str(e.org),
            startDate: date(e.startDate),
            endDate: isCurrent ? undefined : date(e.endDate),
            isCurrent,
            durationMonths: num(e.durationMonths),
            highlights: strList(e.highlights),
            description: str(e.description)
        };
    })
    .filter((e) => e.title || e.org);
 
const cleanProjects = (list) => list
    .map((p) => ({
        name: str(p.name),
        description: str(p.description),
        techStack: strList(p.techStack),
        link: str(p.link)
    }))
    .filter((p) => p.name);
 

 
const updateUser = async (req, res) => {
    const { userId } = req.user; // Set by auth middleware
    const body = req.body || {};
 
    // Accept both nested ({ user: {...}, profile: {...} }) and flat payloads.
    const u = { ...body, ...(body.user || {}) };
    const p = { ...body, ...(body.profile || {}) };
 
    try {
        const foundUser = await user.findById(userId);
 
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }
 
        /* ---- basic user information ---- */
        if (u.fullname !== undefined) foundUser.fullname = str(u.fullname);
        if (u.email !== undefined && str(u.email)) foundUser.email = str(u.email);
        if (u.phone !== undefined) foundUser.phone = str(u.phone);
        if (u.graduationYear !== undefined) foundUser.graduationYear = num(u.graduationYear);
        if (u.onboardingCompleted === true) foundUser.onboardingCompleted = true;
 
        if (!foundUser.profile) foundUser.profile = {};
 
        /* ---- profile lists ---- */
        if (Array.isArray(p.education)) {
            foundUser.profile.education = cleanEducation(p.education);
        }
 
        if (Array.isArray(p.experience)) {
            const experience = cleanExperience(p.experience);
            foundUser.profile.experience = experience;
            foundUser.profile.totalExperienceMonths = totalMonths(experience);
        }
 
        if (Array.isArray(p.projects)) {
            foundUser.profile.projects = cleanProjects(p.projects);
        }
 
        if (Array.isArray(p.certifications)) {
            foundUser.profile.certifications = strList(p.certifications);
        }
 
        if (Array.isArray(p.parsedSkills)) {
            foundUser.profile.parsedSkills = [...new Set(strList(p.parsedSkills).map((s) => s.toLowerCase()))];
        }
 
        if (Array.isArray(p.targetRoles)) {
            foundUser.profile.targetRoles = strList(p.targetRoles);
        }
 
        if (Array.isArray(p.workPreference)) {
            foundUser.profile.workPreference = strList(p.workPreference);
        }
 
        /* ---- simple profile fields ---- */
        if (p.courseName !== undefined) foundUser.profile.courseName = str(p.courseName);
        if (p.branch !== undefined) foundUser.profile.branch = str(p.branch);
        if (p.cgpa !== undefined) foundUser.profile.cgpa = num(p.cgpa);
        if (p.currentYear !== undefined) foundUser.profile.currentYear = num(p.currentYear);
        if (p.employmentType !== undefined) foundUser.profile.employmentType = str(p.employmentType);
        if (p.customGoal !== undefined) foundUser.profile.customGoal = str(p.customGoal);
        if (p.summary !== undefined) foundUser.profile.summary = str(p.summary);
 
        /* ---- links ---- */
        if (p.linkedin !== undefined) foundUser.profile.linkedin = str(p.linkedin);
        if (p.github !== undefined) foundUser.profile.github = str(p.github);
        if (p.portfolio !== undefined) foundUser.profile.portfolio = str(p.portfolio);
 
        await foundUser.save();
 
        return res.status(200).json({
            message: 'Profile updated successfully',
            profile: buildProfileResponse(foundUser)
        });
    } catch (error) {
        console.error('Error updating profile:', error);
 
        if (error.code === 11000) {
            return res.status(409).json({ message: 'That email is already in use.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: Object.values(error.errors)[0]?.message || 'Invalid profile data' });
        }
 
        return res.status(500).json({ message: 'Internal server error' });
    }
};



const addResume = async (req, res) => {
    const { userId } = req.user;
    const { resumeFileUrl, resumePublicId, resumeText } = req.body;
 
    if (!resumeFileUrl) {
        return res.status(400).json({ message: 'resumeFileUrl is required' });
    }
 
    try {
        const foundUser = await user.findById(userId);
 
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }
 
        if (!foundUser.profile) {
            foundUser.profile = {};
        }
 
        foundUser.profile.resumeFileUrl = resumeFileUrl;
        if (resumePublicId !== undefined) foundUser.profile.resumePublicId = resumePublicId;
        if (resumeText !== undefined) foundUser.profile.resumeText = resumeText;
 
        await foundUser.save();
 
        return res.status(201).json({
            message: 'Resume added successfully',
            profile: buildProfileResponse(foundUser)
        });
    } catch (error) {
        console.error('Error adding resume:', error);
        return res.status(500).json({ message: 'Internal server error' });
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

        res.status(200).json(buildProfileResponse(foundUser));
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    loginUser,
    requestPasswordReset,
    resetPassword,
    sendOtp,
    verifyOtp,
    registerUser,
    updateUser,
    deleteUser,
    logoutUser,
    addResume,
    userinfo
};
