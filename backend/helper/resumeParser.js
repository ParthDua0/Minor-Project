const fs = require('fs/promises');
const path = require('path');



const SECTION_ALIASES = {
    summary: ['summary', 'professional summary', 'profile', 'objective', 'career objective', 'about me', 'about'],
    experience: ['experience', 'work experience', 'professional experience', 'employment', 'employment history', 'work history', 'internship', 'internships', 'internship experience'],
    education: ['education', 'academic background', 'academics', 'academic qualifications', 'educational qualifications', 'qualifications'],
    projects: ['projects', 'personal projects', 'academic projects', 'key projects', 'selected projects', 'technical projects', 'notable projects', 'project experience', 'open source', 'open source projects', 'side projects'],
    skills: ['skills', 'technical skills', 'key skills', 'core competencies', 'tech stack', 'technologies'],
    certifications: ['certifications', 'certificates', 'licenses', 'courses'],
    other: ['achievements', 'awards', 'honors', 'accomplishments', 'extracurricular', 'extracurricular activities', 'positions of responsibility', 'publications', 'interests', 'hobbies', 'languages', 'references']
};

const HEADING_LOOKUP = new Map(
    Object.entries(SECTION_ALIASES).flatMap(([key, names]) => names.map((name) => [name, key]))
);

const KNOWN_SKILLS = [
    'javascript', 'typescript', 'react', 'react native', 'next.js', 'node.js', 'express', 'nestjs', 'vue', 'angular',
    'three.js', 'redux', 'tailwind', 'bootstrap', 'html', 'css', 'sass', 'mongodb', 'mongoose', 'mysql',
    'postgresql', 'sql', 'redis', 'sqlite', 'prisma', 'sequelize', 'firebase', 'supabase', 'python', 'java',
    'c++', 'c#', 'php', 'django', 'flask', 'spring boot', 'git', 'github', 'docker', 'kubernetes', 'aws',
    'azure', 'gcp', 'linux', 'nginx', 'jenkins', 'ci/cd', 'rest api', 'graphql', 'websocket', 'socket.io',
    'jest', 'postman', 'figma', 'jwt', 'npm', 'webpack', 'vite', 'cloudinary', 'machine learning',
    'data analysis', 'pandas', 'numpy', 'tensorflow', 'flutter', 'excel', 'power bi',
    'tableau', 'r', 'scikit-learn', 'pytorch', 'computer vision', 'nlp', 'data structures',
    'algorithms', 'oop', 'operating systems', 'dbms', 'communication', 'problem solving',
    'leadership', 'agile', 'scrum', 'jira', 'salesforce', 'sap', 'ui/ux', 'canva',
    'digital marketing', 'seo', 'content writing', 'accounting', 'finance', 'autocad',
    'solidworks', 'matlab', 'embedded systems', 'arduino', 'networking', 'cybersecurity'
];
const AMBIGUOUS_SKILLS = new Set(['express', 'excel']);

const SKILL_ALIASES = {
    js: 'javascript', ts: 'typescript', reactjs: 'react', 'react.js': 'react', nodejs: 'node.js', node: 'node.js',
    expressjs: 'express', 'express.js': 'express', nextjs: 'next.js', vuejs: 'vue', 'vue.js': 'vue',
    mongo: 'mongodb', 'mongo db': 'mongodb', postgres: 'postgresql', threejs: 'three.js',
    tailwindcss: 'tailwind', 'tailwind css': 'tailwind', html5: 'html', css3: 'css', ml: 'machine learning',
    'restful api': 'rest api', 'restful apis': 'rest api', 'rest apis': 'rest api', k8s: 'kubernetes',
    'amazon web services': 'aws', 'google cloud': 'gcp', 'ms excel': 'excel', 'microsoft excel': 'excel',
    socketio: 'socket.io', 'scikit learn': 'scikit-learn', sklearn: 'scikit-learn',
    'natural language processing': 'nlp', 'user experience': 'ui/ux', ux: 'ui/ux',
    'search engine optimization': 'seo', 'object oriented programming': 'oop'
};

const MONTH = '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const DATE_TOKEN = `(?:\\b${MONTH}\\.?,?\\s*\\d{4}|\\b\\d{1,2}[/-]\\d{4}|\\b\\d{4}\\b)`;
const RANGE_RE = new RegExp(
    `(${DATE_TOKEN})\\s*(?:[-–—]+|\\bto\\b)\\s*(${DATE_TOKEN}|present|current|now|ongoing|till\\s+date|to\\s+date)`,
    'i'
);

const BULLET_RE = /^\s*(?:[-–—*•●▪◦▸►■>]|\d+[.)])\s+/;
const ROLE_RE = /\b(developer|engineer|intern|internship|trainee|analyst|manager|lead|architect|consultant|designer|administrator|associate|executive|officer|scientist|researcher|assistant|specialist|programmer|tester|sde|freelancer?|founder|co-founder|head|director|coordinator|volunteer)\b/i;
const ORG_RE = /\b(university|college|institute|school|pvt|private|ltd|limited|inc|llc|corp|corporation|technologies|solutions|systems|labs|services|consulting|company|foundation|academy|bank|studio|infotech|enterprises|group)\b/i;
const DEGREE_RE = /\b(?:b\.?\s?tech|m\.?\s?tech|b\.?\s?sc|m\.?\s?sc|b\.?\s?c\.?a|m\.?\s?c\.?a|b\.?\s?com|m\.?\s?com|mba|bba|ph\.?d|bachelor(?:'s)?|master(?:'s)?|diploma|higher secondary|senior secondary|secondary|intermediate|high school|matriculation|class (?:x|xii|10|12)|(?:10|12)th|xii)\b/i;
const INSTITUTE_RE = /\b(?:university|college|institute|institution|school|academy|iit|nit|iiit|polytechnic|vidyalaya|vidyapeeth)\b/i;



const normalizeText = (text) => text
    .replace(/\r\n?/g, '\n')
    .replace(/[\uf0b7\uf0a7\uf0d8\u2022]/g, '•')
    .replace(/[\u00a0\u200b\u2028]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

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
            throw new Error('PDF parsing requires the pdf-parse package.');
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


/*  Section splitting */


const detectHeading = (line) => {
    if (line.length > 45) return null;
    const clean = line
        .replace(/[:：]\s*$/, '')
        .replace(/[^a-zA-Z& ]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    const key = HEADING_LOOKUP.get(clean) || HEADING_LOOKUP.get(clean.replace(/&/g, 'and'));
    if (key) return key;
 
    if (/^(?:[a-z]+ ){0,2}projects$|^projects (?:and|&) [a-z ]+$/.test(clean)) return 'projects';
    return null;
};

const splitSections = (text) => {
    const sections = { header: [] };
    let current = 'header';

    for (const raw of text.split('\n')) {
        const line = raw.trim();
        if (!line) continue;
        let key = detectHeading(line);

        if (key === 'skills' && ['projects', 'experience'].includes(current) && /^tech(?:nologies| stack)\s*:?$/i.test(line)) key = null;
        if (key) {
            current = key;
            sections[current] = sections[current] || [];
            continue;
        }
        sections[current].push(line);
    }
    return sections;
};

const isBullet = (line) => BULLET_RE.test(line);
const stripBullet = (line) => line.replace(BULLET_RE, '').trim();


/*  Contact info */


const withProtocol = (url) => (url && !/^https?:\/\//i.test(url) ? `https://${url}` : url);
const trimUrl = (url) => url && url.replace(/[).,;|]+$/, '');

const extractPhone = (text) => {
    const indian = text.match(/(?<![\d/])(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\d)/);
    if (indian) return indian[0].trim();
    const intl = text.match(/\+\d{1,3}[\s-]?\d[\d\s-]{7,12}\d/);
    return intl ? intl[0].trim() : undefined;
};

const extractLinks = (text, headerLines) => {
    const linkedin = text.match(/(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/[^\s|,;)]+/i)?.[0];
    const githubUser = text.match(/github\.com\/([A-Za-z0-9-]+)/i)?.[1];
    const linkedInHandle = text.match(/linkedin(?:\s+profile)?\s*[:|\-]\s*([A-Za-z0-9-]{3,100})/i)?.[1];
    const githubHandle = text.match(/github\s*[:|\-]\s*(@?[A-Za-z0-9-]{1,100})/i)?.[1]?.replace(/^@/, '');

    const urls = [...text.matchAll(/(?:https?:\/\/|www\.)[^\s|,;)]+/gi)]
        .map((m) => trimUrl(m[0]))
        .filter((u) => !/linkedin\.com|github\.com|npmjs\.com|cloudinary\.com|mailto:/i.test(u));
    const preferred = urls.find((u) => /portfolio|vercel\.app|netlify\.app|github\.io|\.dev\b|\.me\b/i.test(u));
    const inHeader = urls.find((u) => headerLines.slice(0, 10).join(' ').includes(u));

    return {
        linkedin: withProtocol(trimUrl(linkedin)) || (linkedInHandle ? `https://www.linkedin.com/in/${linkedInHandle}` : undefined),
        github: githubUser || githubHandle ? `https://github.com/${githubUser || githubHandle}` : undefined,
        portfolio: withProtocol(preferred || inHeader)
    };
};

const extractName = (headerLines) => headerLines.slice(0, 6).find((line) =>
    !/[@\d]|https?:|www\.|resume|curriculum|vitae/i.test(line) &&
    /^[A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z][A-Za-z.'-]*){1,3}$/.test(line) &&
    !ROLE_RE.test(line)
);


/*  Experience */


const HEADER_SPLIT_RE = /\s*[|•·]\s*|\s+[-–—@]\s+|,\s+|\s+at\s+/i;

const looksLikeHeaderLine = (line) =>
    line !== undefined && !isBullet(line) && line.length <= 90 && !/[.!]$/.test(line) &&
    (ROLE_RE.test(line) || ORG_RE.test(line)) && !RANGE_RE.test(line);

const splitTitleOrg = (headerText) => {
    const parts = headerText.split(HEADER_SPLIT_RE).map((p) => p.trim()).filter(Boolean);
    if (!parts.length) return {};

    const titleIdx = parts.findIndex((p) => ROLE_RE.test(p));
    const idx = titleIdx === -1 ? 0 : titleIdx;
    const others = parts.filter((_, i) => i !== idx);
    const org = others.find((p) => ORG_RE.test(p)) || others[0];
    return { title: parts[idx], org };
};

const groupBullets = (lines) => {
    const bullets = [];
    for (const line of lines) {
        if (isBullet(line) || !bullets.length || !/^[a-z]/.test(line)) bullets.push(stripBullet(line));
        else bullets[bullets.length - 1] += ` ${line}`;
    }
    return bullets;
};

const parseExperience = (lines) => {
    const anchors = lines
        .map((line, i) => (!isBullet(line) && line.length <= 120 && RANGE_RE.test(line) ? i : -1))
        .filter((i) => i !== -1);

    const blocks = [];
    let lastAnchor = -1;

    for (const idx of anchors) {
        const range = lines[idx].match(RANGE_RE);
        const rest = lines[idx].replace(RANGE_RE, ' ').replace(/\s+/g, ' ').trim();
        const header = rest ? [rest] : [];
        let start = idx;
        let end = idx;

        const maxPrev = rest ? 1 : 2;
        for (let k = 0; k < maxPrev; k += 1) {
            const p = start - 1;
            if (p > lastAnchor && looksLikeHeaderLine(lines[p])) {
                header.unshift(lines[p]);
                start = p;
            }
        }

        const nextAnchor = anchors.find((a) => a > idx) ?? lines.length;
        const headerText = header.join(' | ');
        const incomplete = !ROLE_RE.test(headerText) || headerText.split(HEADER_SPLIT_RE).length < 2;
        if (incomplete && end + 1 < nextAnchor && looksLikeHeaderLine(lines[end + 1])) {
            header.push(lines[end + 1]);
            end += 1;
        }

        blocks.push({ start, end, header: header.join(' | '), period: { start: range[1], end: range[2] } });
        lastAnchor = idx;
    }

    return blocks.map((block, i) => {
        const bodyEnd = i + 1 < blocks.length ? blocks[i + 1].start : lines.length;
        return {
            ...splitTitleOrg(block.header),
            period: block.period,
            bullets: groupBullets(lines.slice(block.end + 1, bodyEnd))
        };
    });
};


/*  Education  */


const CGPA_RE = /\b(?:c\.?g\.?p\.?a|g\.?p\.?a)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)|(\d(?:\.\d+)?)\s*\/\s*10\b/i;
const PERCENT_RE = /(\d{2}(?:\.\d+)?)\s*%|(?:percentage|marks|score)\s*[:\-]?\s*(\d{2}(?:\.\d+)?)/i;
const YEAR_RANGE_RE = /\(?\b(?:19|20)\d{2}\b(?:\s*(?:[-–—]|to)\s*(?:(?:19|20)\d{2}|present|expected))?\)?/gi;

const parseEducation = (lines) => {
    const blocks = [];
    let cur = null;

    for (const line of lines) {
        const hasDegree = DEGREE_RE.test(line);
        const hasInst = INSTITUTE_RE.test(line);
        if (!cur || (hasDegree && cur.hasDegree) || (hasInst && cur.hasInst)) {
            cur = { lines: [], hasDegree: false, hasInst: false };
            blocks.push(cur);
        }
        cur.lines.push(line);
        cur.hasDegree ||= hasDegree;
        cur.hasInst ||= hasInst;
    }

    return blocks.map(({ lines: block }) => {
        const text = block.join(' | ');
        const cgpaMatch = text.match(CGPA_RE);
        const pctMatch = text.match(PERCENT_RE);
        const years = [...text.matchAll(/\b(19[89]\d|20\d{2})\b/g)].map((m) => Number(m[1]));

        const parts = text
            .replace(CGPA_RE, ' ').replace(PERCENT_RE, ' ').replace(YEAR_RANGE_RE, ' ')
            .split(/\s*\|\s*|\s+[-–—]\s+|,\s+/)
            .map((p) => p.trim())
            .filter((p) => p.length > 1 && !/^(expected|graduated|batch|year)\W*$/i.test(p));

        let degreePart = parts.find((p) => DEGREE_RE.test(p));
        let institute = parts.find((p) => INSTITUTE_RE.test(p) && p !== degreePart);

        if (degreePart && !institute && INSTITUTE_RE.test(degreePart)) {
            const m = degreePart.match(/^(.*?)\s+(?:from|at)\s+(.+)$/i);
            if (m) [, degreePart, institute] = m;
        }

        let degree = degreePart;
        let branch;
        const inMatch = degreePart?.match(/^(.*?)\s+in\s+(.+)$/i);
        const parenMatch = degreePart?.match(/^(.*?)\s*\((.+?)\)\s*$/);
        if (inMatch) [, degree, branch] = inMatch;
        else if (parenMatch) [, degree, branch] = parenMatch;

        return {
            degree,
            branch,
            institute,
            year: years.length ? Math.max(...years) : undefined,
            startYear: years.length > 1 ? Math.min(...years) : undefined,
            cgpa: cgpaMatch ? Number(cgpaMatch[1] || cgpaMatch[2]) : undefined,
            percentage: pctMatch ? Number(pctMatch[1] || pctMatch[2]) : undefined
        };
    });
};


/*  Skills, projects, certifications */

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const KNOWN_SKILL_RES = KNOWN_SKILLS.map((skill) => [
    skill,
    new RegExp(`(?<![a-z0-9+#.])${escapeRe(skill)}(?![a-z0-9+#])`, 'i')
]);

const canonicalSkill = (skill) => SKILL_ALIASES[skill] || skill;

const parseSkills = (skillLines, wholeText) => {
    const fromSection = skillLines
        .flatMap((line) => stripBullet(line)
            .replace(/^[^:,|]{1,40}:\s*/, '')
            .replace(/\([^)]*\)/g, '')
            .split(/[,|;•·●▪]|\s{2,}/))
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length >= 2 && s.length <= 30 && s.split(/\s+/).length <= 3 && !/^\d+$/.test(s))
        .map(canonicalSkill);

    const sectionText = skillLines.join('\n');
    const fromKnown = KNOWN_SKILL_RES
        .filter(([skill, re]) => re.test(AMBIGUOUS_SKILLS.has(skill) ? sectionText : wholeText))
        .map(([skill]) => skill);

    return [...new Set([...fromSection, ...fromKnown])].slice(0, 50);
};

const DATE_TOKEN_G = new RegExp(DATE_TOKEN, 'gi');

const parseProjects = (lines) => {
    const projects = [];
    let cur = null;
    let last = 'none'; // 'header' | 'bullet' | 'text'
    let prevEnded = false; // did the previous line end a sentence?
    let expectTech = false; // saw a lone "Tech Stack" label; next line is the list

    for (const line of lines) {
        if (cur && expectTech) {
            cur.bullets.push(`Tech: ${stripBullet(line)}`);
            expectTech = false;
            last = 'text';
            prevEnded = true;
            continue;
        }
        if (cur && /^tech(?:nologies| stack)\s*:?$/i.test(line)) {
            expectTech = true;
            continue;
        }

        if (isBullet(line)) {
            if (!cur) { cur = { header: '', bullets: [] }; projects.push(cur); }
            cur.bullets.push(stripBullet(line));
            last = 'bullet';
            prevEnded = /[.!?]$/.test(line);
            continue;
        }

        if (cur && /^(?:tech(?:nologies)?(?:\s*stack)?|built with|tools|stack)\s*:/i.test(line)) {
            cur.bullets.push(line);
            last = 'text';
            prevEnded = true;
            continue;
        }

        // wrapped bullet (previous bullet has not finished its sentence)
        if (last === 'bullet' && /^[a-z(]/.test(line) && !prevEnded) {
            cur.bullets[cur.bullets.length - 1] += ` ${line}`;
            prevEnded = /[.!?]$/.test(line);
            continue;
        }

        const titleLike = line.length <= 90 && line.split(/\s+/).length <= 10 && /^[A-Za-z0-9]/.test(line) && !/[.;,]$/.test(line);
        const strong = /https?:\/\/|\s\|\s|\s[–—]\s/.test(line) || RANGE_RE.test(line);
        const startsNew = !cur || (titleLike && (strong || last === 'bullet' || (last === 'text' && prevEnded)));

        if (startsNew) {
            cur = { header: line, bullets: [] };
            projects.push(cur);
            last = 'header';
            prevEnded = false;
        } else {
            cur.bullets.push(line);
            last = 'text';
            prevEnded = /[.!?]$/.test(line);
        }
    }

    return projects.map(({ header, bullets }) => {
        const link = header.match(/https?:\/\/\S+/)?.[0];
        const headerText = header
            .replace(/https?:\/\/\S+/g, ' ')
            .replace(/\(\s*(?:github|live|link|demo|source|code)[^)]*\)/gi, ' ')
            .replace(RANGE_RE, ' ')
            .replace(DATE_TOKEN_G, ' ');
        const [name, ...techParts] = headerText.split(/\s*[|–—]\s*|\s+-\s+/);
        const techIdx = bullets.findIndex((b) => /^(?:tech(?:nologies)?(?:\s*stack)?|built with|tools|stack)\s*:/i.test(b));
        const techText = [techParts.join(','), techIdx >= 0 ? bullets[techIdx].replace(/^[^:]+:\s*/, '') : ''].join(',');
        return {
            name: name?.trim(),
            techStack: techText.split(/[,;]/).map((t) => t.trim().toLowerCase()).filter(Boolean).map(canonicalSkill),
            link: trimUrl(link),
            bullets: bullets.filter((_, i) => i !== techIdx)
        };
    });
};

const parseCertifications = (lines) => [...new Set(lines.map(stripBullet).filter((l) => l.length > 2 && l.length <= 150))];

/*  Public API     */


const parseResume = (text) => {
    const sections = splitSections(text);

    return {
        name: extractName(sections.header),
        email: text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0],
        phone: extractPhone(sections.header.join(' ') || text),
        links: extractLinks(text, sections.header),
        summary: (sections.summary || []).join(' '),
        experience: parseExperience(sections.experience || []),
        education: parseEducation(sections.education || []),
        projects: parseProjects(sections.projects || []),
        certifications: parseCertifications(sections.certifications || []),
        skills: parseSkills(sections.skills || [], text.replace(/(?:https?:\/\/|www\.)\S+|\b(?:linkedin|github)\.com\/\S*/gi, ' ')),
        sectionsFound: Object.keys(sections).filter((k) => sections[k].length)
    };
};

module.exports = { extractResumeText, parseResume, normalizeText };
