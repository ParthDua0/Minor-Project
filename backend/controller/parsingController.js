const user = require('../model/userModel');
const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const { extractResumeText, parseResume } = require('../helper/resumeParser');
const { cleanResume } = require('../helper/resumeCleaner');
const { buildProfileResponse } = require('../helper/Profileresponse');

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

        // 1. Extract text -> 2. parse into sections -> 3. clean / normalise
        const resumeText = await extractResumeText(resumeFile);
        if (resumeText.length < 50) {
            return res.status(422).json({
                error: 'Could not read any text from this resume. If it is a scanned image, upload a text-based PDF or DOCX.'
            });
        }
        const rawParsed = parseResume(resumeText);
        const parsed = cleanResume(rawParsed);

        const uploadedResume = await cloudinary.uploader.upload(resumeFile.path, {
            folder: 'student-resumes',
            resource_type: 'raw',
            use_filename: true,
            unique_filename: true
        });

        const previousPublicId = foundUser.profile?.resumePublicId;
        const currentProfile = foundUser.profile?.toObject?.() || foundUser.profile || {};

        // Only overwrite a field when the parser actually found something,
        // so a weak parse never wipes data the user already has.
        const nextProfile = {
            ...currentProfile,
            resumeFileUrl: uploadedResume.secure_url,
            resumePublicId: uploadedResume.public_id,
            resumeFileName: resumeFile.originalname,
            resumeText,
            resumeParsedAt: new Date()
        };
        const setIfFound = (key, value) => {
            if (Array.isArray(value) ? value.length : value) nextProfile[key] = value;
        };
        setIfFound('summary', parsed.summary);
        setIfFound('education', parsed.education);
        setIfFound('experience', parsed.experience);
        setIfFound('projects', parsed.projects);
        setIfFound('certifications', parsed.certifications);
        setIfFound('parsedSkills', parsed.skills);
        setIfFound('linkedin', parsed.linkedin);
        setIfFound('github', parsed.github);
        setIfFound('portfolio', parsed.portfolio);
        if (parsed.experience.length) nextProfile.totalExperienceMonths = parsed.totalExperienceMonths;

        // Fill academic basics from the resume only when the student hasn't set them.
        if (!nextProfile.branch && parsed.branch) nextProfile.branch = parsed.branch;
        if (nextProfile.cgpa == null && parsed.cgpa != null) nextProfile.cgpa = parsed.cgpa;

        foundUser.profile = nextProfile;

        if (!foundUser.fullname && parsed.fullname) foundUser.fullname = parsed.fullname;
        if (!foundUser.phone && parsed.phone) foundUser.phone = parsed.phone;
        if (!foundUser.graduationYear && parsed.graduationYear) foundUser.graduationYear = parsed.graduationYear;

        await foundUser.save();

        // Remove the previous resume from Cloudinary so old files don't pile up.
        if (previousPublicId && previousPublicId !== uploadedResume.public_id) {
            cloudinary.uploader.destroy(previousPublicId, { resource_type: 'raw' }).catch((err) => {
                console.error('Error deleting old resume from Cloudinary:', err.message);
            });
        }

        res.status(200).json({
            message: 'Resume uploaded and parsed successfully',
            profile: buildProfileResponse(foundUser),
            parsedResume: parsed,
            // add ?debug=1 to the upload URL to see what the parser saw
            ...(req.query?.debug === '1' && { debug: { rawParsed, textPreview: resumeText.slice(0, 3000) } })
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

const deleteResume = async (req, res) => {
    try {
        const foundUser = await user.findById(req.user?.userId);
        if (!foundUser) return res.status(404).json({ error: 'User not found' });

        const publicId = foundUser.profile?.resumePublicId;
        if (publicId) {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        }

        if (!foundUser.profile) foundUser.profile = {};
        foundUser.profile.resumeFileUrl = undefined;
        foundUser.profile.resumePublicId = undefined;
        foundUser.profile.resumeFileName = undefined;
        foundUser.profile.resumeText = undefined;
        foundUser.profile.resumeParsedAt = undefined;
        await foundUser.save();

        return res.status(200).json({
            message: 'Resume deleted successfully',
            profile: buildProfileResponse(foundUser)
        });
    } catch (error) {
        console.error('Error deleting resume:', error);
        return res.status(500).json({ error: 'Unable to delete the resume' });
    }
};

const getResumeLink = async (req, res) => {
    try {
        const foundUser = await user.findById(req.user?.userId);
        if (!foundUser) return res.status(404).json({ error: 'User not found' });

        const publicId = foundUser.profile?.resumePublicId;
        const savedUrl = foundUser.profile?.resumeFileUrl;
        if (!publicId && !savedUrl) return res.status(404).json({ error: 'No resume uploaded' });

        let url = savedUrl;
        if (publicId) {
            const asset = await cloudinary.api.resource(publicId, {
                resource_type: 'raw',
                type: 'upload'
            });
            const extension = path.extname(publicId).slice(1) || asset.format || 'pdf';
            const idWithoutExtension = extension
                ? publicId.slice(0, -(extension.length + 1))
                : publicId;

            url = cloudinary.utils.private_download_url(idWithoutExtension, extension, {
                resource_type: 'raw',
                type: 'upload',
                expires_at: Math.floor(Date.now() / 1000) + 60 * 60
            });

        }

        return res.status(200).json({ url, publicId });
    } catch (error) {
        console.error('Error resolving Cloudinary resume link:', error.message);
        return res.status(502).json({ error: 'Could not retrieve the resume from Cloudinary' });
    }
};

module.exports = { userresumeupload, deleteResume, getResumeLink };
