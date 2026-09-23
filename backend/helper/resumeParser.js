const fs = require('fs/promises');
const path = require('path');

const KNOWN_SKILLS = [
    'javascript', 'typescript', 'react', 'node.js', 'nodejs', 'express',
    'mongodb', 'mongoose', 'mysql', 'postgresql', 'python', 'java', 'c++',
    'c#', 'html', 'css', 'tailwind', 'bootstrap', 'git', 'github', 'docker',
    'aws', 'azure', 'firebase', 'redux', 'next.js', 'rest api', 'graphql',
    'machine learning', 'data analysis', 'excel', 'power bi'
];

const normalizeText = (text) => text.replace(/\r/g, '\n').replace(/[ \t]+/g, ' ').trim();

const requireOptional = (packageName) => {
    try {
        return require(packageName);
    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') return null;
        throw error;
    }
};

const extractResumeText = async (file) => {
    const ext = path.extname(file.originalname || file.path).toLowerCase();

    if (file.mimetype === 'text/plain' || ext === '.txt') {
        return normalizeText(await fs.readFile(file.path, 'utf8'));
    }

    if (file.mimetype === 'application/pdf' || ext === '.pdf') {
        const pdfParser = requireOptional('pdf-parse');
        if (!pdfParser) {
            throw new Error('PDF parsing requires the pdf-parse package. Run npm install pdf-parse in backend.');
        }

        const buffer = await fs.readFile(file.path);
        if (typeof pdfParser === 'function') {
            const data = await pdfParser(buffer);
            return normalizeText(data.text || '');
        }

        const parser = new pdfParser.PDFParse({ data: buffer });
        try {
            const data = await parser.getText();
            return normalizeText(data.text || '');
        } finally {
            await parser.destroy();
        }
    }

    if (
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        ext === '.docx'
    ) {
        const mammoth = requireOptional('mammoth');
        if (!mammoth) {
            throw new Error('DOCX parsing requires the mammoth package. Run npm install mammoth in backend.');
        }

        const result = await mammoth.extractRawText({ path: file.path });
        return normalizeText(result.value || '');
    }

    throw new Error('Unsupported resume format. Please upload a PDF, DOCX, or TXT file.');
};

const sectionText = (text, names) => {
    const escaped = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(?:^|\\n)\\s*(?:${escaped})\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\s*(?:education|experience|work experience|projects|skills|technical skills|certifications|achievements|contact)\\s*:?\\s*\\n|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
};

const parseListLines = (section) => section
    .split(/\n+/)
    .map((line) => line.replace(/^[-*\d.)\s]+/, '').trim())
    .filter(Boolean);

const parseEducation = (text) => {
    const lines = parseListLines(sectionText(text, ['education']));
    return lines.slice(0, 5).map((line) => {
        const year = line.match(/\b(19|20)\d{2}\b/);
        const cgpa = line.match(/\b(?:cgpa|gpa)\s*:?\s*(\d+(?:\.\d+)?)/i);

        return {
            degree: line,
            year: year ? Number(year[0]) : undefined,
            cgpa: cgpa ? Number(cgpa[1]) : undefined
        };
    });
};

const parseExperience = (text) => {
    const lines = parseListLines(sectionText(text, ['experience', 'work experience', 'employment']));
    return lines.slice(0, 5).map((line) => ({
        title: line,
        description: line
    }));
};

const parseSkills = (text) => {
    const lowerText = text.toLowerCase();
    const skillsFromKnownList = KNOWN_SKILLS.filter((skill) => lowerText.includes(skill));
    const skillsSection = sectionText(text, ['skills', 'technical skills']);
    const skillsFromSection = skillsSection
        .split(/[,|;\n]/)
        .map((skill) => skill.replace(/^[-*\s]+/, '').trim().toLowerCase())
        .filter((skill) => skill.length > 1 && skill.length < 40);

    return [...new Set([...skillsFromKnownList, ...skillsFromSection])].slice(0, 40);
};

const parseResume = (text) => {
    const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
    const phone = text.match(/(?:\+?\d[\d\s().-]{8,}\d)/)?.[0]?.replace(/\s+/g, ' ').trim();
    const linkedin = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+/i)?.[0];
    const github = text.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)]+/i)?.[0];
    const portfolio = text.match(/https?:\/\/(?![^/]*(?:linkedin|github)\.com)[^\s)]+/i)?.[0];
    const firstLine = text.split('\n').map((line) => line.trim()).find(Boolean);

    return {
        fullname: firstLine && !firstLine.includes('@') && firstLine.length <= 80 ? firstLine : undefined,
        email,
        phone,
        education: parseEducation(text),
        experience: parseExperience(text),
        parsedSkills: parseSkills(text),
        linkedin,
        github,
        portfolio
    };
};

module.exports = {
    extractResumeText,
    parseResume
};
