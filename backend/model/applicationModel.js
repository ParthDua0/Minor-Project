
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },

    status: {
        type: String,
        enum: [
            'applied',
            'under_review',
            'shortlisted',
            'rejected',
            'hired',
            'withdrawn'
        ],
        default: 'applied'
    },

    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume'
    },

    appliedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// A student can apply to a job only once.
applicationSchema.index(
    { userId: 1, jobId: 1 },
    { unique: true }
);

module.exports = mongoose.model('Application', applicationSchema);