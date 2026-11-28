const User = require('../model/userModel');
const Assessment = require('../model/assessmentModel');
const { calculateReadiness } = require('../helper/readiness');

const getReadiness = async (req, res) => {
  const student = await User.findById(req.user.userId).lean();
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const assessments = await Assessment.find({ studentId: student._id }).lean();
  const result = calculateReadiness(student.profile?.targetRoles || [], assessments);
  const readiness = {
    score: result.score,
    change: 0,
    status: result.score === null ? 'Career requirements not configured' : result.score >= 70 ? 'Placement ready' : 'Building readiness',
    description: result.score === null
      ? 'Select a career goal with configured skill requirements to calculate readiness.'
      : 'Based on passed assessments for your selected career goals.'
  };

  res.json({
    readiness,
    passingScore: 70,
    configuredRoles: result.configuredRoles,
    requiredSkills: result.requiredSkills,
    passedSkills: result.passedSkills,
    skillDetails: result.skillDetails
  });
};

module.exports = { getReadiness };
