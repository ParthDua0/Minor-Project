
const buildProfileResponse = (foundUser) => {
    const p = foundUser.profile?.toObject?.() || foundUser.profile || {};

    const completionChecks = [
        foundUser.fullname, foundUser.phone, foundUser.graduationYear,
        p.courseName, p.branch, p.cgpa != null, p.targetRoles?.length, p.resumeFileUrl,
        p.education?.length, p.experience?.length, p.parsedSkills?.length,
        p.projects?.length, p.linkedin || p.github
    ];
    const profileCompletion = Math.round(
        (completionChecks.filter(Boolean).length / completionChecks.length) * 100
    );

    return {
        user: {
            fullname: foundUser.fullname,
            email: foundUser.email,
            phone: foundUser.phone,
            graduationYear: foundUser.graduationYear,
            role: foundUser.role,
            onboardingCompleted: foundUser.onboardingCompleted
        },
        courseName: p.courseName,
        branch: p.branch,
        cgpa: p.cgpa,
        currentYear: p.currentYear,
        targetRoles: p.targetRoles || [],
        employmentType: p.employmentType,
        workPreference: p.workPreference || [],
        customGoal: p.customGoal,

        summary: p.summary,                                   // NEW
        linkedin: p.linkedin,                                 // NEW
        github: p.github,                                     // NEW
        portfolio: p.portfolio,                               // NEW
        education: p.education || [],
        experience: p.experience || [],
        projects: p.projects || [],                           // NEW
        certifications: p.certifications || [],               // NEW
        parsedSkills: p.parsedSkills || [],
        totalExperienceMonths: p.totalExperienceMonths || 0,  // NEW

        resume: {
            uploaded: Boolean(p.resumeFileUrl),
            url: p.resumeFileUrl,                             // NEW -> "View resume" link
            fileName: p.resumeFileName,
            uploadedAt: p.resumeParsedAt                      // NEW
        },
        profileCompletion
    };
};

module.exports = { buildProfileResponse };
