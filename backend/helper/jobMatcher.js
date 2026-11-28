const normalize = (value) => String(value || '').trim().toLowerCase();
const unique = (values) => [...new Set(values.map(normalize).filter(Boolean))];
const { PASSING_SCORE } = require('../config/readiness');

function studentSkills(student) {
  const profile = student.profile || {};
  return unique([
    ...(profile.parsedSkills || []),
    ...((profile.projects || []).flatMap((project) => project.techStack || []))
  ]);
}

function matchJob(student, job, assessmentBySkill = {}) {
  const skills = studentSkills(student);
  const required = unique(job.requiredSkills || []);
  const matchedSkills = required.filter((skill) => skills.includes(skill));
  const missingSkills = required.filter((skill) => !skills.includes(skill));
  const skillScore = required.length ? (matchedSkills.length / required.length) * 70 : 45;
  const cgpaEligible = !job.minCgpa || Number(student.profile?.cgpa || 0) >= job.minCgpa;
  const cgpaScore = !job.minCgpa ? 10 : cgpaEligible ? 10 : 0;
  const experienceScore = Math.min(Number(student.profile?.totalExperienceMonths || 0) / 12, 1) * 10;
  const verified = matchedSkills.filter((skill) => (assessmentBySkill[skill] || 0) >= PASSING_SCORE).length;
  const assessmentScore = required.length ? (verified / required.length) * 10 : 5;
  const score = Math.round(Math.min(100, skillScore + cgpaScore + experienceScore + assessmentScore));
  return { score, matchedSkills, missingSkills, cgpaEligible, isFit: score >= 55 && cgpaEligible };
}

module.exports = { matchJob, studentSkills, normalize };
