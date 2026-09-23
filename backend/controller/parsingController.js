const user = require('../model/userModel');
const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');
const { extractResumeText, parseResume } = require('../helper/resumeParser');

const userresumeupload = async (req, res) => {
    let resumeFile;

    try {
        const userId = req.user?.userId;
        resumeFile = req.file || req.files?.resume?.[0] || req.files?.file?.[0] || req.files?.resumeFile?.[0];

        if (!userId) {
            return res.status(401).json({ error: 'Authentication token is required' });
        }

        if (!resumeFile) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const foundUser = await user.findById(userId);

        if (!foundUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const resumeText = await extractResumeText(resumeFile);
        const parsedResume = parseResume(resumeText);
        const uploadedResume = await cloudinary.uploader.upload(resumeFile.path, {
            folder: 'student-resumes',
            resource_type: 'raw',
            use_filename: true,
            unique_filename: true
        });
        const currentProfile = foundUser.profile?.toObject?.() || foundUser.profile || {};

        foundUser.profile = {
            ...currentProfile,
            education: parsedResume.education,
            experience: parsedResume.experience,
            resumeFileUrl: uploadedResume.secure_url,
            resumePublicId: uploadedResume.public_id,
            resumeText,
            parsedSkills: parsedResume.parsedSkills,
            linkedin: parsedResume.linkedin,
            github: parsedResume.github,
            portfolio: parsedResume.portfolio
        };

        if (!foundUser.fullname && parsedResume.fullname) foundUser.fullname = parsedResume.fullname;
        if (!foundUser.phone && parsedResume.phone) foundUser.phone = parsedResume.phone;

        await foundUser.save();

        res.status(200).json({
            message: 'Resume uploaded and parsed successfully',
            user: foundUser,
            parsedResume
        });
    } catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    } finally {
        if (resumeFile?.path) {
            await fs.unlink(resumeFile.path).catch((error) => {
                console.error('Error deleting local resume file:', error.message);
            });
        }
    }
};

module.exports = { userresumeupload };
