const Job = require('../model/jobModel');
const User = require('../model/userModel');
const Assessment = require('../model/assessmentModel');
const { matchJob } = require('../helper/jobMatcher');

const requireRecruiter = (req, res) => {
  if (!['recruiter', 'admin'].includes(req.user?.role)) {
    res.status(403).json({ message: 'Recruiter access is required' });
    return false;
  }
  return true;
};

const createJob = async (req, res) => {
  if (!requireRecruiter(req, res)) return;
  try {
    const body = req.body || {};
    if (!body.title || !body.company || !body.description) return res.status(400).json({ message: 'Title, company and description are required' });
    const requiredSkills = [...new Set((body.requiredSkills || []).map((s) => String(s).trim().toLowerCase()).filter(Boolean))];
    const job = await Job.create({ ...body, requiredSkills, recruiterId: req.user.userId });
    res.status(201).json({ job });
  } catch (error) { res.status(400).json({ message: error.message || 'Unable to create job' }); }
};

const listJobs = async (req, res) => {
  const jobs = await Job.find({ isActive: true, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }).sort({ postedAt: -1 }).lean();
  res.json({ jobs });
};

const matchedJobs = async (req, res) => {
  const student = await User.findById(req.user.userId).lean();
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const assessments = await Assessment.find({ studentId: student._id }).lean();
  const scores = Object.fromEntries(assessments.map((a) => [a.skill, a.score]));
  const jobs = await Job.find({ isActive: true, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }).sort({ postedAt: -1 }).lean();
  const matches = jobs.map((job) => ({ ...job, match: matchJob(student, job, scores) })).sort((a, b) => b.match.score - a.match.score);
  res.json({ jobs: matches, fitJobs: matches.filter((job) => job.match.isFit) });
};

const recruiterJobs = async (req, res) => {
  if (!requireRecruiter(req, res)) return;
  const jobs = await Job.find({ recruiterId: req.user.userId }).sort({ postedAt: -1 });
  res.json({ jobs });
};
module.exports = { createJob, listJobs, matchedJobs, recruiterJobs };
