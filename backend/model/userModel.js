const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
    degree: { type: String, trim: true },
    branch: { type: String, trim: true },
    institute: { type: String, trim: true },
    startYear: { type: Number },
    year: { type: Number },
    cgpa: { type: Number, min: 0, max: 10 },
    percentage: { type: Number, min: 0, max: 100 }
}, { _id: false });

const experienceSchema = new mongoose.Schema({
    title: { type: String, trim: true },
    org: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    durationMonths: { type: Number, min: 0 },
    highlights: [{ type: String, trim: true }],
    // Auto-generated short note, e.g. "Worked as X at Y from Jun 2023 to May 2026 (3 yrs). Key work: ..."
    description: { type: String, trim: true }
}, { _id: false });

const projectSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    techStack: [{ type: String, trim: true }],
    link: { type: String, trim: true }
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
        courseName: { type: String, trim: true },
        branch: { type: String, trim: true },
        cgpa: { type: Number, min: 0, max: 10 },
        currentYear: { type: Number, min: 1, max: 6 },
        employmentType: { type: String, trim: true },
        workPreference: [{ type: String, trim: true }],
        customGoal: { type: String, trim: true, maxlength: 500 },

        summary: { type: String, trim: true },
        totalExperienceMonths: { type: Number, min: 0, default: 0 },

        education: [educationSchema],
        experience: [experienceSchema],
        projects: [projectSchema],
        certifications: [{ type: String, trim: true }],

        resumeFileUrl: { type: String },
        resumePublicId: { type: String },
        resumeFileName: { type: String, trim: true },
        resumeText: { type: String, select: false },
        resumeParsedAt: { type: Date },

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

    lastLogin: { type: Date },
    onboardingCompleted: { type: Boolean, default: false }
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
