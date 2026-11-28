const PASSING_SCORE = 70;

// Keys are normalized so the mapping can be shared by onboarding and profile role labels.
const ROLE_SKILL_REQUIREMENTS = {
  'software development engineer': ['javascript', 'data structures', 'algorithms', 'git', 'sql'],
  'software engineer': ['javascript', 'data structures', 'algorithms', 'git', 'sql'],
  'data analyst': ['sql', 'python', 'excel', 'power bi', 'statistics'],
  'data scientist': ['python', 'sql', 'statistics', 'machine learning', 'data visualization'],
  'ml engineer': ['python', 'machine learning', 'statistics', 'sql', 'docker'],
  'frontend developer': ['html', 'css', 'javascript', 'react', 'git'],
  'backend developer': ['javascript', 'node.js', 'sql', 'api design', 'git'],
  'full stack developer': ['html', 'css', 'javascript', 'react', 'node.js', 'sql'],
  'data engineer': ['sql', 'python', 'etl', 'data warehousing', 'git'],
  'devops / sre': ['linux', 'docker', 'ci/cd', 'cloud', 'monitoring'],
  'devops engineer': ['linux', 'docker', 'ci/cd', 'cloud', 'monitoring'],
  'business analyst': ['excel', 'sql', 'statistics', 'power bi', 'requirements analysis'],
  'product manager': ['product strategy', 'user research', 'analytics', 'roadmapping', 'communication'],
  'ui/ux designer': ['figma', 'user research', 'wireframing', 'prototyping', 'visual design'],
  'cybersecurity analyst': ['networking', 'linux', 'security fundamentals', 'siem', 'incident response']
};

module.exports = { PASSING_SCORE, ROLE_SKILL_REQUIREMENTS };
