
const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
    degree: { type: String, trim: true },
    branch: { type: String, trim: true },
    institute: { type: String, trim: true },
    year: { type: Number },
    cgpa: { type: Number, min: 0, max: 10 }
}, { _id: false });

const experienceSchema = new mongoose.Schema({
    title: { type: String, trim: true },
    org: { type: String, trim: true },
    durationMonths: { type: Number, min: 0 },
    description: { type: String, trim: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,

        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    graduationYear: {
        type: Number,
        min: 1960,
        max: new Date().getFullYear() + 10 // Allowing future graduation years up to 10 years ahead
    },

    password: {
        type: String,

        select: false
    },
    role: {
        type: String,
        enum: ['student', 'recruiter', 'admin'],
        default: 'student',
    },
   otp: {
  type: String,
  select: false,
},
otpExpiry: {
  type: Date,
  select: false, 
},
    otpVerified: {
        type: Boolean,
        default: false
    },
    verifiyed: {
        type: Boolean,
        default: false
    },
    jwtToken: {
        type: String,
        select: false
    },
    jwtTokenExpiry: {
        type: Date,
        select: false
    },

    phone: { type: String, trim: true },

    profile: {
        education: [educationSchema],
        experience: [experienceSchema],

        resumeFileUrl: { type: String },
        resumePublicId: { type: String },
        resumeText: { type: String, select: false },

        parsedSkills: [{
            type: String,
            trim: true,
            lowercase: true
        }],

        targetRoles: [{ type: String, trim: true }],

        linkedin: { type: String, trim: true },
        github: { type: String, trim: true },
        portfolio: { type: String, trim: true }
    },

    isActive: {
        type: Boolean,
        default: true
    },

    lastLogin: { type: Date }
}, {
    timestamps: true
});

userSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: 30 * 60,
        partialFilterExpression: { verifiyed: false }
    }
);

module.exports = mongoose.model('User', userSchema);
