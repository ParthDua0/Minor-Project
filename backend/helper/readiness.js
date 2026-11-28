const { PASSING_SCORE, ROLE_SKILL_REQUIREMENTS } = require('../config/readiness');

const normalize = (value) => String(value || '').trim().toLowerCase();
const unique = (values) => [...new Set(values.map(normalize).filter(Boolean))];

function requiredSkillsForRoles(targetRoles = []) {
  const configuredRoles = unique(targetRoles).filter((role) => ROLE_SKILL_REQUIREMENTS[role]);
  return {
    configuredRoles,
    requiredSkills: unique(configuredRoles.flatMap((role) => ROLE_SKILL_REQUIREMENTS[role]))
  };
}

function calculateReadiness(targetRoles, assessments = []) {
  const { configuredRoles, requiredSkills } = requiredSkillsForRoles(targetRoles);
  const assessmentBySkill = new Map(assessments.map((assessment) => [normalize(assessment.skill), assessment]));
  const skillDetails = requiredSkills.map((skill) => {
    const assessment = assessmentBySkill.get(skill);
    const score = assessment?.score ?? null;
    // Score fallback keeps assessments created before the `passed` field usable.
    const passed = Boolean(assessment && (assessment.passed === true || Number(score) >= PASSING_SCORE));
    return { skill, required: true, score, passed, assessed: Boolean(assessment) };
  });
  const passedSkills = skillDetails.filter((detail) => detail.passed).map((detail) => detail.skill);
  const score = requiredSkills.length
    ? Math.round((passedSkills.length / requiredSkills.length) * 100)
    : null;

  return { score, configuredRoles, requiredSkills, passedSkills, skillDetails };
}

module.exports = { calculateReadiness, requiredSkillsForRoles, normalize };
