
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true
    },

    company: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    requiredSkills: [{
        type: String,
        lowercase: true,
        trim: true
    }],

    minCgpa: {
        type: Number,
        min: 0,
        max: 10
    },

    location: { type: String, trim: true },

    salaryRange: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 },
        currency: { type: String, default: 'INR' }
    },

    jobType: {
        type: String,
        enum: ['Full-time', 'Internship', 'Part-time', 'Contract']
    },

    expiresAt: { type: Date },

    isActive: {
        type: Boolean,
        default: true
    },

    postedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

jobSchema.index({ title: 'text', company: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);