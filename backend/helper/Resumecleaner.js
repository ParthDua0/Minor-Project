/**
 * Takes the raw output of parseResume() and turns it into clean, schema-ready data:
 * normalises text, converts dates, computes durations, drops junk entries and
 * writes a short human-readable note for every job.
 */

const MONTH_INDEX = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HIGHER_DEGREE_RE = /b\.?\s?tech|m\.?\s?tech|bachelor|master|b\.?\s?sc|m\.?\s?sc|bca|mca|mba|bba|ph\.?d/i;

/* ---------------------------- helpers ---------------------------- */

const clean = (value) => String(value ?? '')
    .replace(/[\u200b\u00a0]/g, ' ')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s|,\-–—•·:]+|[\s|,\-–—•·:]+$/g, '')
    .trim();

const fixCase = (value) => (
    value.includes(' ') && value === value.toUpperCase() && /[A-Z]/.test(value)
        ? value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
        : value
);

const truncate = (value, max) => (value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value);

const tokenToDate = (token, isEnd) => {
    if (!token) return null;
    if (/^(present|current|now|ongoing|till\s+date|to\s+date)$/i.test(token.trim())) return 'present';

    const yearMatch = token.match(/\d{4}/);
    if (!yearMatch) return null;
    const word = token.toLowerCase().match(/[a-z]{3}/);
    const numeric = token.match(/^(\d{1,2})[/-]/);

    let month;
    if (word) month = MONTH_INDEX[word[0]];
    else if (numeric) month = Number(numeric[1]) - 1;
    else month = isEnd ? 11 : 0; // year-only: Jan for start, Dec for end

    if (month === undefined || month < 0 || month > 11) return null;
    return new Date(Date.UTC(Number(yearMatch[0]), month, 1));
};

const monthIndex = (d) => d.getUTCFullYear() * 12 + d.getUTCMonth();
const monthsBetween = (a, b) => monthIndex(b) - monthIndex(a) + 1;
const formatMonth = (d) => `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

const formatDuration = (months) => {
    const y = Math.floor(months / 12);
    const m = months % 12;
    const parts = [];
    if (y) parts.push(`${y} yr${y > 1 ? 's' : ''}`);
    if (m) parts.push(`${m} mo${m > 1 ? 's' : ''}`);
    return parts.join(' ') || '<1 mo';
};

const cleanPhone = (raw) => {
    if (!raw) return undefined;
    const digits = raw.replace(/[^\d+]/g, '');
    const count = digits.replace(/\D/g, '').length;
    if (count < 10 || count > 14) return undefined;
    const indian = digits.match(/^\+?91(\d{10})$/);
    if (indian) return `+91 ${indian[1].slice(0, 5)} ${indian[1].slice(5)}`;
    return digits;
};

/* --------------------------- experience --------------------------- */

const buildNote = ({ title, org, start, end, isCurrent, durationMonths, highlights }) => {
    const verb = isCurrent ? 'Working' : 'Worked';
    const role = title ? ` as ${title}` : '';
    const where = org ? ` at ${org}` : '';
    let period = '';
    if (start) period = isCurrent ? ` since ${formatMonth(start)}` : end ? ` from ${formatMonth(start)} to ${formatMonth(end)}` : ` from ${formatMonth(start)}`;
    const duration = durationMonths ? ` (${formatDuration(durationMonths)})` : '';

    const work = highlights.slice(0, 2).map((h) => h.replace(/[.\s]+$/, '')).join('; ');
    const keyWork = work ? ` Key work: ${truncate(work, 300)}.` : '';
    return `${verb}${role}${where}${period}${duration}.${keyWork}`;
};

const cleanExperience = (entry) => {
    const title = fixCase(clean(entry.title));
    const org = clean(entry.org);
    if (!title && !org) return null;

    const start = tokenToDate(entry.period?.start, false);
    const parsedEnd = tokenToDate(entry.period?.end, true);
    const isCurrent = parsedEnd === 'present';
    const end = isCurrent ? null : parsedEnd;
    const calcEnd = isCurrent ? new Date() : end;
    const durationMonths = start && calcEnd ? Math.max(0, monthsBetween(start, calcEnd)) : undefined;

    const highlights = (entry.bullets || [])
        .map(clean)
        .filter((b) => b.length > 3)
        .map((b) => truncate(b, 220))
        .slice(0, 6);

    return {
        title,
        org,
        startDate: start || undefined,
        endDate: end || undefined,
        isCurrent,
        durationMonths,
        highlights,
        description: buildNote({ title, org, start, end, isCurrent, durationMonths, highlights })
    };
};

const totalMonths = (experience) => {
    const spans = experience
        .filter((e) => e.startDate)
        .map((e) => [monthIndex(e.startDate), monthIndex(e.endDate || (e.isCurrent ? new Date() : e.startDate))])
        .sort((a, b) => a[0] - b[0]);

    let total = 0;
    let cur = null;
    for (const [s, e] of spans) {
        if (!cur || s > cur[1]) {
            if (cur) total += cur[1] - cur[0] + 1;
            cur = [s, e];
        } else {
            cur[1] = Math.max(cur[1], e);
        }
    }
    return cur ? total + cur[1] - cur[0] + 1 : 0;
};

/* ---------------------------- education ---------------------------- */

const cleanEducation = (entry) => {
    const degree = clean(entry.degree);
    const institute = clean(entry.institute);
    if (!degree && !institute) return null;

    const maxYear = new Date().getFullYear() + 10;
    const validYear = (y) => (y >= 1960 && y <= maxYear ? y : undefined);

    return {
        degree,
        branch: clean(entry.branch) || undefined,
        institute: institute || undefined,
        year: validYear(entry.year),
        startYear: validYear(entry.startYear),
        cgpa: entry.cgpa >= 0 && entry.cgpa <= 10 ? entry.cgpa : undefined,
        percentage: entry.percentage > 0 && entry.percentage <= 100 ? entry.percentage : undefined
    };
};

/* ----------------------------- projects ----------------------------- */

const cleanProject = (project) => {
    const bullets = (project.bullets || []).map(clean).filter((b) => b.length > 3);
    // Fall back to the first few words of the description if the title line was missing.
    const name = clean(project.name) || bullets[0]?.split(/\s+/).slice(0, 6).join(' ');
    if (!name) return null;
    return {
        name: truncate(name, 100),
        description: truncate(bullets.slice(0, 2).join(' '), 400) || undefined,
        techStack: [...new Set(project.techStack || [])].slice(0, 15),
        link: project.link || undefined
    };
};

const dedupeBy = (items, keyFn) => {
    const seen = new Set();
    return items.filter((item) => {
        const key = keyFn(item).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

/* ------------------------------ main ------------------------------ */

const cleanResume = (raw) => {
    const experience = dedupeBy(
        raw.experience.map(cleanExperience).filter(Boolean),
        (e) => `${e.title}|${e.org}`
    ).sort((a, b) => (b.startDate?.getTime() || 0) - (a.startDate?.getTime() || 0));

    const education = dedupeBy(
        raw.education.map(cleanEducation).filter(Boolean),
        (e) => `${e.degree}|${e.institute}`
    );

    const projects = dedupeBy(raw.projects.map(cleanProject).filter(Boolean), (p) => p.name);
    const totalExperienceMonths = totalMonths(experience);

    const degreeYears = education.filter((e) => HIGHER_DEGREE_RE.test(e.degree || '') && e.year).map((e) => e.year);
    const graduationYear = degreeYears.length ? Math.max(...degreeYears) : undefined;

    // Short overall note: use the resume's own summary, else generate one.
    let summary = clean(raw.summary);
    if (!summary && (experience.length || raw.skills.length)) {
        const latest = experience[0];
        const bits = [];
        if (totalExperienceMonths) bits.push(`${formatDuration(totalExperienceMonths)} of experience.`);
        if (latest) {
            bits.push(`Most recent role: ${[latest.title, latest.org && `at ${latest.org}`].filter(Boolean).join(' ')}${latest.isCurrent ? ' (current)' : ''}.`);
        }
        if (raw.skills.length) bits.push(`Key skills: ${raw.skills.slice(0, 8).join(', ')}.`);
        summary = bits.join(' ');
    }

    // Highest / most recent degree drives the branch + CGPA shown on the profile page.
    const primaryEducation = education
        .filter((e) => HIGHER_DEGREE_RE.test(e.degree || ''))
        .sort((a, b) => (b.year || 0) - (a.year || 0))[0];

    return {
        fullname: raw.name ? fixCase(clean(raw.name)) : undefined,
        branch: primaryEducation?.branch,
        cgpa: primaryEducation?.cgpa,
        email: raw.email?.toLowerCase(),
        phone: cleanPhone(raw.phone),
        linkedin: raw.links.linkedin,
        github: raw.links.github,
        portfolio: raw.links.portfolio,
        summary: truncate(summary, 600) || undefined,
        graduationYear,
        totalExperienceMonths,
        experience,
        education,
        projects,
        certifications: raw.certifications.slice(0, 15),
        skills: raw.skills
    };
};

module.exports = { cleanResume, formatDuration, totalMonths };