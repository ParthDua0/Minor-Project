import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  FolderGit2,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  getProfileData,
  updateProfile,
  uploadResume,
  deleteResume,
} from "../api/apiProfile";

import AppLayout from "../components/layout/AppLayout";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

let idCounter = 0;
const newId = () => `${Date.now()}-${idCounter++}`;

const withIds = (list) =>
  (Array.isArray(list) ? list : []).map((item) => ({
    ...item,
    id: item.id || newId(),
  }));

/** ISO date -> "YYYY-MM" (value format of <input type="month">) */
const toMonthInput = (value) => (value ? String(value).slice(0, 7) : "");

const monthIndex = (yearMonth) => {
  const [year, month] = yearMonth.split("-").map(Number);
  return year * 12 + (month - 1);
};

/** Months between two "YYYY-MM" values, inclusive. Empty string if unknown. */
const calcMonths = (start, end, isCurrent) => {
  if (!start) return "";
  if (!isCurrent && !end) return "";

  const now = new Date();
  const from = monthIndex(start);
  const to = isCurrent
    ? now.getFullYear() * 12 + now.getMonth()
    : monthIndex(end);

  return to >= from ? to - from + 1 : "";
};

const formatDuration = (months) => {
  const total = Number(months);
  if (!total) return "";

  const years = Math.floor(total / 12);
  const rest = total % 12;
  const parts = [];

  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (rest) parts.push(`${rest} mo${rest > 1 ? "s" : ""}`);

  return parts.join(" ");
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const toNumber = (value) =>
  value === "" ||
  value === null ||
  value === undefined ||
  Number.isNaN(Number(value))
    ? undefined
    : Number(value);

/* ---- server -> form ---- */

const normalizeEducation = (list) => withIds(list);

const normalizeExperience = (list) =>
  withIds(list).map((item) => ({
    ...item,
    startDate: toMonthInput(item.startDate),
    endDate: toMonthInput(item.endDate),
    isCurrent: Boolean(item.isCurrent),
    highlights: Array.isArray(item.highlights) ? item.highlights : [],
  }));

const normalizeProjects = (list) =>
  withIds(list).map((item) => ({
    ...item,
    techText: (item.techStack || []).join(", "),
  }));

/* ---- form -> server ---- */

const serializeEducation = (list) =>
  list.map(({ id, ...item }) => ({
    ...item,
    year: toNumber(item.year),
    startYear: toNumber(item.startYear),
    cgpa: toNumber(item.cgpa),
    percentage: toNumber(item.percentage),
  }));

const serializeExperience = (list) =>
  list.map(({ id, ...item }) => ({
    ...item,
    startDate: item.startDate ? `${item.startDate}-01` : undefined,
    endDate:
      !item.isCurrent && item.endDate ? `${item.endDate}-01` : undefined,
    durationMonths: toNumber(item.durationMonths),
    highlights: (item.highlights || [])
      .map((line) => line.trim())
      .filter(Boolean),
  }));

const serializeProjects = (list) =>
  list.map(({ id, techText, ...item }) => ({
    ...item,
    techStack: (techText || "")
      .split(",")
      .map((tech) => tech.trim())
      .filter(Boolean),
  }));

const textareaClass = `
  w-full resize-none rounded-lg border border-slate-200
  bg-white px-3 py-2.5 text-xs text-slate-800
  outline-none transition
  placeholder:text-slate-300
  focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10
`;

/* -------------------------------------------------------------------------- */
/* FORM FIELD                                                                 */
/* -------------------------------------------------------------------------- */

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  min,
  max,
  step,
  disabled = false,
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] font-medium text-slate-600">
        {label}
      </label>

      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="
          h-10 w-full rounded-lg border border-slate-200
          bg-white px-3 text-xs text-slate-800
          outline-none transition
          placeholder:text-slate-300
          focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10
          disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400
        "
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TEXT AREA                                                                  */
/* -------------------------------------------------------------------------- */

function TextArea({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] font-medium text-slate-600">
        {label}
      </label>

      {hint && (
        <p className="mb-2 text-[10px] text-slate-400">{hint}</p>
      )}

      <textarea
        value={value ?? ""}
        onChange={onChange}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        className={textareaClass}
      />

      {maxLength && (
        <p className="mt-1.5 text-right text-[10px] text-slate-400">
          {(value || "").length}/{maxLength}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SECTION CARD                                                               */
/* -------------------------------------------------------------------------- */

function SectionCard({ title, label, children, action }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <h2 className="mt-1 text-sm font-semibold text-slate-900">
            {title}
          </h2>
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

function AddButton({ onClick, children = "Add entry" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700"
    >
      <Plus size={14} />
      {children}
    </button>
  );
}

function RemoveButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-[10px] font-medium text-red-500 hover:text-red-600"
    >
      <Trash2 size={13} />
      Remove
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* RESUME SECTION                                                             */
/* -------------------------------------------------------------------------- */

function ResumeSection({ resume, onFileSelect, onDelete, uploading, deleting }) {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    if (!files || !files.length) return;

    const file = files[0];

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF or DOCX file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Resume must be smaller than 5 MB.");
      return;
    }

    onFileSelect(file);

    // allow re-selecting the same file later
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    handleFiles(event.dataTransfer.files);
  };

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf,.docx"
      className="hidden"
      onChange={(event) => handleFiles(event.target.files)}
    />
  );

  /* ---------------------------- uploaded ---------------------------- */

  if (resume?.uploaded) {
    const uploadedOn = formatDate(resume.uploadedAt);

    return (
      <SectionCard
        label="Resume"
        title="Your resume"
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={uploading || deleting}
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload new resume"}
            </button>
            <button
              type="button"
              disabled={uploading || deleting}
              onClick={onDelete}
              className="text-[11px] font-semibold text-red-500 hover:text-red-600 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        }
      >
        {fileInput}

        <div className="flex flex-col gap-4 rounded-xl border border-teal-100 bg-teal-50/50 p-4 sm:flex-row sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-teal-600 shadow-sm">
            <FileText size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-800">
              {resume.fileName || "Uploaded resume"}
            </p>

            <p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
              <CheckCircle2 size={12} className="text-teal-600" />
              {uploadedOn
                ? `Uploaded and analysed on ${uploadedOn}`
                : "Uploaded and analysed"}
            </p>
          </div>

        </div>

        <p className="mt-3 text-[10px] text-slate-400">
          Replacing your resume re-reads it and refreshes your education,
          experience, projects and skills below. Any manual edits to those
          sections will be overwritten.
        </p>
      </SectionCard>
    );
  }

  /* --------------------------- not uploaded --------------------------- */

  return (
    <SectionCard label="Resume" title="Upload your resume">
      {fileInput}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          flex min-h-52.5 cursor-pointer flex-col items-center
          justify-center rounded-xl border border-dashed
          px-5 text-center transition
          ${
            dragging
              ? "border-teal-500 bg-teal-50"
              : "border-slate-300 bg-slate-50/40 hover:border-teal-400 hover:bg-teal-50/40"
          }
        `}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
          <Upload size={20} />
        </div>

        <p className="mt-4 text-sm font-medium text-slate-700">
          {uploading
            ? "Uploading and reading your resume..."
            : "Drop your resume here"}
        </p>

        <p className="mt-1.5 text-[11px] text-slate-400">
          PDF or DOCX, up to 5 MB ·{" "}
          <span className="font-medium text-teal-600">browse files</span>
        </p>

        <p className="mt-3 text-[10px] text-slate-400">
          We'll fill in your education, experience, projects and skills for you.
        </p>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* BASIC INFORMATION                                                          */
/* -------------------------------------------------------------------------- */

function BasicInformationSection({ profile, setProfile }) {
  const updateUser = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      user: {
        ...previous.user,
        [field]: value,
      },
    }));
  };

  const updateField = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <SectionCard label="About you" title="Basic information">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Full name"
          value={profile.user?.fullname}
          placeholder="Your full name"
          onChange={(event) => updateUser("fullname", event.target.value)}
        />

        <FormField
          label="Email"
          type="email"
          value={profile.user?.email}
          placeholder="your@email.com"
          onChange={(event) => updateUser("email", event.target.value)}
        />

        <FormField
          label="Phone"
          value={profile.user?.phone}
          placeholder="Phone number"
          onChange={(event) => updateUser("phone", event.target.value)}
        />

        <FormField
          label="Graduation year"
          type="number"
          value={profile.user?.graduationYear}
          placeholder="2027"
          onChange={(event) =>
            updateUser("graduationYear", event.target.value)
          }
        />

        <FormField
          label="Course name"
          value={profile.courseName}
          placeholder="e.g. Bachelor of Technology"
          onChange={(event) => updateField("courseName", event.target.value)}
        />

        <FormField
          label="Major / Branch"
          value={profile.branch}
          placeholder="Computer Science & Engineering"
          onChange={(event) => updateField("branch", event.target.value)}
        />

        <FormField
          label="Current year"
          type="number"
          min="1"
          max="6"
          value={profile.currentYear}
          placeholder="4"
          onChange={(event) =>
            updateField("currentYear", event.target.value)
          }
        />

        <FormField
          label="CGPA"
          type="number"
          min="0"
          max="10"
          step="0.01"
          value={profile.cgpa}
          placeholder="7.5"
          onChange={(event) => updateField("cgpa", event.target.value)}
        />

        <div className="hidden sm:block" />

        <FormField
          label="LinkedIn"
          value={profile.linkedin}
          placeholder="https://linkedin.com/in/username"
          onChange={(event) => updateField("linkedin", event.target.value)}
        />

        <FormField
          label="GitHub"
          value={profile.github}
          placeholder="https://github.com/username"
          onChange={(event) => updateField("github", event.target.value)}
        />

        <FormField
          label="Portfolio"
          value={profile.portfolio}
          placeholder="https://yourportfolio.dev"
          className="sm:col-span-2"
          onChange={(event) => updateField("portfolio", event.target.value)}
        />

        <TextArea
          label="Professional summary"
          hint="A short introduction recruiters will see. Filled from your resume when available."
          value={profile.summary}
          rows={3}
          maxLength={600}
          className="sm:col-span-2"
          placeholder="e.g. Full-stack developer with hands-on experience building web platforms..."
          onChange={(event) => updateField("summary", event.target.value)}
        />
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* CAREER GOALS & PREFERENCES                                                 */
/* -------------------------------------------------------------------------- */

function CareerGoalsSection({ profile, setProfile }) {
  const roleOptions = [
    "Software Engineer",
    "Data Analyst",
    "Data Scientist",
    "ML Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "UI/UX Designer",
    "Product Manager",
    "Business Analyst",
    "Cybersecurity Analyst",
  ];

  const updateField = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleRole = (role) => {
    const currentRoles = Array.isArray(profile.targetRoles)
      ? profile.targetRoles
      : [];

    const updatedRoles = currentRoles.includes(role)
      ? currentRoles.filter((item) => item !== role)
      : [...currentRoles, role];

    updateField("targetRoles", updatedRoles);
  };

  return (
    <SectionCard label="Career" title="Goals & preferences">
      <div className="space-y-6">
        {/* Target roles */}
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-slate-600">
            Target roles
          </label>

          <p className="mb-3 text-[10px] text-slate-400">
            Select the roles you are interested in for internships or
            placements.
          </p>

          <div className="flex flex-wrap gap-2">
            {roleOptions.map((role) => {
              const selected =
                Array.isArray(profile.targetRoles) &&
                profile.targetRoles.includes(role);

              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`
                    rounded-full border px-3 py-1.5
                    text-[11px] font-medium transition
                    ${
                      selected
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                    }
                  `}
                >
                  {role}
                </button>
              );
            })}
          </div>

          {Array.isArray(profile.targetRoles) &&
            profile.targetRoles.length > 0 && (
              <p className="mt-3 text-[10px] text-slate-400">
                {profile.targetRoles.length} role
                {profile.targetRoles.length !== 1 ? "s" : ""} selected
              </p>
            )}
        </div>

        {/* Custom goal */}
        <TextArea
          label="Career goal"
          hint="Tell us what you want to achieve during your placement preparation."
          value={profile.customGoal}
          rows={4}
          maxLength={500}
          placeholder="e.g. I want to secure a Data Analyst internship and become placement-ready for analytics roles."
          onChange={(event) => updateField("customGoal", event.target.value)}
        />
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* EDUCATION                                                                  */
/* -------------------------------------------------------------------------- */

function EducationSection({ education, setEducation }) {
  const addEducation = () => {
    setEducation((previous) => [
      ...previous,
      {
        id: newId(),
        degree: "",
        branch: "",
        institute: "",
        startYear: "",
        year: "",
        cgpa: "",
        percentage: "",
      },
    ]);
  };

  const removeEducation = (id) => {
    setEducation((previous) => previous.filter((item) => item.id !== id));
  };

  const updateEducation = (id, field, value) => {
    setEducation((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <SectionCard
      label="Education"
      title="Academic background"
      action={<AddButton onClick={addEducation} />}
    >
      <div className="space-y-5">
        {education.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
            <p className="text-xs font-medium text-slate-500">
              No education added yet
            </p>

            <button
              type="button"
              onClick={addEducation}
              className="mt-2 text-[11px] font-semibold text-teal-600"
            >
              Add education
            </button>
          </div>
        )}

        {education.map((item, index) => (
          <div
            key={item.id}
            className="relative rounded-xl border border-slate-200 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Education {index + 1}
              </span>

              <RemoveButton onClick={() => removeEducation(item.id)} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Degree"
                value={item.degree}
                placeholder="e.g. B.Tech"
                onChange={(event) =>
                  updateEducation(item.id, "degree", event.target.value)
                }
              />

              <FormField
                label="Branch"
                value={item.branch}
                placeholder="e.g. Computer Science"
                onChange={(event) =>
                  updateEducation(item.id, "branch", event.target.value)
                }
              />

              <FormField
                label="Institution"
                value={item.institute}
                placeholder="Your university"
                className="sm:col-span-2"
                onChange={(event) =>
                  updateEducation(item.id, "institute", event.target.value)
                }
              />

              <FormField
                label="Start year"
                type="number"
                value={item.startYear}
                placeholder="2023"
                onChange={(event) =>
                  updateEducation(item.id, "startYear", event.target.value)
                }
              />

              <FormField
                label="Graduation year"
                type="number"
                value={item.year}
                placeholder="2027"
                onChange={(event) =>
                  updateEducation(item.id, "year", event.target.value)
                }
              />

              <FormField
                label="CGPA (out of 10)"
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={item.cgpa}
                placeholder="7.5"
                onChange={(event) =>
                  updateEducation(item.id, "cgpa", event.target.value)
                }
              />

              <FormField
                label="Percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={item.percentage}
                placeholder="85"
                onChange={(event) =>
                  updateEducation(item.id, "percentage", event.target.value)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* EXPERIENCE                                                                 */
/* -------------------------------------------------------------------------- */

function ExperienceSection({
  experience,
  setExperience,
  totalExperienceMonths,
}) {
  const addExperience = () => {
    setExperience((previous) => [
      ...previous,
      {
        id: newId(),
        title: "",
        org: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        durationMonths: "",
        highlights: [],
        description: "",
      },
    ]);
  };

  const removeExperience = (id) => {
    setExperience((previous) => previous.filter((item) => item.id !== id));
  };

  /** patch = object of fields to change; duration is recalculated from dates */
  const updateExperience = (id, patch) => {
    setExperience((previous) =>
      previous.map((item) => {
        if (item.id !== id) return item;

        const next = { ...item, ...patch };

        if (
          "startDate" in patch ||
          "endDate" in patch ||
          "isCurrent" in patch
        ) {
          if (next.isCurrent) next.endDate = "";

          next.durationMonths = calcMonths(
            next.startDate,
            next.endDate,
            next.isCurrent
          );
        }

        return next;
      })
    );
  };

  const total = formatDuration(totalExperienceMonths);

  return (
    <SectionCard
      label="Experience"
      title="Work experience"
      action={
        <div className="flex items-center gap-4">
          {total && (
            <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600 sm:inline">
              Total: {total}
            </span>
          )}

          <AddButton onClick={addExperience} />
        </div>
      }
    >
      <div className="space-y-5">
        {experience.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
            <BriefcaseBusiness
              size={20}
              className="mx-auto text-slate-300"
            />

            <p className="mt-2 text-xs font-medium text-slate-500">
              No experience added yet
            </p>

            <button
              type="button"
              onClick={addExperience}
              className="mt-2 text-[11px] font-semibold text-teal-600"
            >
              Add your first experience
            </button>
          </div>
        )}

        {experience.map((item, index) => {
          const duration = formatDuration(item.durationMonths);

          return (
            <div
              key={item.id}
              className="relative rounded-xl border border-slate-200 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Experience {index + 1}
                  {item.isCurrent && (
                    <span className="ml-2 rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-semibold normal-case tracking-normal text-teal-700">
                      Current
                    </span>
                  )}
                </span>

                <RemoveButton onClick={() => removeExperience(item.id)} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="Job title"
                  value={item.title}
                  placeholder="e.g. Data Analyst Intern"
                  onChange={(event) =>
                    updateExperience(item.id, { title: event.target.value })
                  }
                />

                <FormField
                  label="Company"
                  value={item.org}
                  placeholder="Company name"
                  onChange={(event) =>
                    updateExperience(item.id, { org: event.target.value })
                  }
                />

                <FormField
                  label="Start date"
                  type="month"
                  value={item.startDate}
                  onChange={(event) =>
                    updateExperience(item.id, {
                      startDate: event.target.value,
                    })
                  }
                />

                <FormField
                  label="End date"
                  type="month"
                  value={item.endDate}
                  disabled={item.isCurrent}
                  onChange={(event) =>
                    updateExperience(item.id, {
                      endDate: event.target.value,
                    })
                  }
                />

                <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2">
                  <label className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-600">
                    <input
                      type="checkbox"
                      checked={item.isCurrent}
                      onChange={(event) =>
                        updateExperience(item.id, {
                          isCurrent: event.target.checked,
                        })
                      }
                      className="h-3.5 w-3.5 rounded border-slate-300 accent-teal-600"
                    />
                    I currently work here
                  </label>

                  {duration && (
                    <span className="text-[11px] font-medium text-slate-500">
                      Duration: {duration}
                    </span>
                  )}
                </div>

                <TextArea
                  label="Summary"
                  hint="A short note about this role. Generated from your resume; edit it however you like."
                  value={item.description}
                  rows={3}
                  className="sm:col-span-2"
                  placeholder="Describe your responsibilities, projects, achievements, or impact..."
                  onChange={(event) =>
                    updateExperience(item.id, {
                      description: event.target.value,
                    })
                  }
                />

                <TextArea
                  label="Key points"
                  hint="One achievement or responsibility per line."
                  value={(item.highlights || []).join("\n")}
                  rows={4}
                  className="sm:col-span-2"
                  placeholder={"Built a React dashboard used by 500+ students\nReduced page load time by 40%"}
                  onChange={(event) =>
                    updateExperience(item.id, {
                      highlights: event.target.value.split("\n"),
                    })
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* PROJECTS                                                                   */
/* -------------------------------------------------------------------------- */

function ProjectsSection({ projects, setProjects }) {
  const addProject = () => {
    setProjects((previous) => [
      ...previous,
      {
        id: newId(),
        name: "",
        description: "",
        techText: "",
        link: "",
      },
    ]);
  };

  const removeProject = (id) => {
    setProjects((previous) => previous.filter((item) => item.id !== id));
  };

  const updateProject = (id, field, value) => {
    setProjects((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <SectionCard
      label="Projects"
      title="Projects & open source"
      action={<AddButton onClick={addProject}>Add project</AddButton>}
    >
      <div className="space-y-5">
        {projects.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
            <FolderGit2 size={20} className="mx-auto text-slate-300" />

            <p className="mt-2 text-xs font-medium text-slate-500">
              No projects added yet
            </p>

            <button
              type="button"
              onClick={addProject}
              className="mt-2 text-[11px] font-semibold text-teal-600"
            >
              Add a project
            </button>
          </div>
        )}

        {projects.map((item, index) => (
          <div
            key={item.id}
            className="relative rounded-xl border border-slate-200 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Project {index + 1}
              </span>

              <RemoveButton onClick={() => removeProject(item.id)} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Project name"
                value={item.name}
                placeholder="e.g. Hostel Management System"
                onChange={(event) =>
                  updateProject(item.id, "name", event.target.value)
                }
              />

              <FormField
                label="Link"
                value={item.link}
                placeholder="https://github.com/you/project"
                onChange={(event) =>
                  updateProject(item.id, "link", event.target.value)
                }
              />

              <FormField
                label="Tech stack"
                value={item.techText}
                placeholder="React, Node.js, MongoDB"
                className="sm:col-span-2"
                onChange={(event) =>
                  updateProject(item.id, "techText", event.target.value)
                }
              />

              <TextArea
                label="Description"
                value={item.description}
                rows={3}
                className="sm:col-span-2"
                placeholder="What does it do and what was your contribution?"
                onChange={(event) =>
                  updateProject(item.id, "description", event.target.value)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* SKILLS                                                                     */
/* -------------------------------------------------------------------------- */

function SkillsSection({ skills, setSkills }) {
  const [draft, setDraft] = useState("");

  const addSkill = () => {
    const skill = draft.trim().toLowerCase();

    if (!skill) return;

    setSkills((previous) =>
      previous.includes(skill) ? previous : [...previous, skill]
    );
    setDraft("");
  };

  const removeSkill = (skill) => {
    setSkills((previous) => previous.filter((item) => item !== skill));
  };

  return (
    <SectionCard label="Skills" title="Your skills">
      {skills.length === 0 ? (
        <p className="mb-4 text-xs text-slate-400">
          No skills yet. Upload your resume to extract them automatically, or
          add them below.
        </p>
      ) : (
        <div className="mb-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1.5 rounded-full bg-teal-50 py-1.5 pl-3 pr-2 text-[11px] font-medium text-teal-700"
            >
              {skill}

              <button
                type="button"
                onClick={() => removeSkill(skill)}
                aria-label={`Remove ${skill}`}
                className="rounded-full p-0.5 text-teal-500 hover:bg-teal-100 hover:text-teal-700"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addSkill();
            }
          }}
          placeholder="Add a skill and press Enter"
          className="
            h-10 min-w-0 flex-1 rounded-lg border border-slate-200
            bg-white px-3 text-xs text-slate-800
            outline-none transition
            placeholder:text-slate-300
            focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10
          "
        />

        <button
          type="button"
          onClick={addSkill}
          className="rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:border-teal-300 hover:text-teal-700"
        >
          Add
        </button>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* CERTIFICATIONS                                                             */
/* -------------------------------------------------------------------------- */

function CertificationsSection({ certifications, setCertifications }) {
  return (
    <SectionCard label="Certifications" title="Certificates & courses">
      <div className="flex items-start gap-3">
        <div className="mt-6 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 sm:flex">
          <Award size={17} />
        </div>

        <TextArea
          label="Certifications"
          hint="One certification per line."
          value={certifications.join("\n")}
          rows={4}
          className="min-w-0 flex-1"
          placeholder={"AWS Cloud Practitioner\nMeta Front-End Developer Certificate"}
          onChange={(event) =>
            setCertifications(event.target.value.split("\n"))
          }
        />
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* LOADING                                                                    */
/* -------------------------------------------------------------------------- */

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div>
        <div className="h-8 w-40 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-72 rounded bg-slate-200" />
      </div>

      <div className="h-70 rounded-2xl bg-slate-200" />
      <div className="h-52.5 rounded-2xl bg-slate-200" />
      <div className="h-75 rounded-2xl bg-slate-200" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ERROR                                                                      */
/* -------------------------------------------------------------------------- */

function ProfileError({ onRetry }) {
  return (
    <div className="flex min-h-125 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertCircle size={20} />
        </div>

        <h2 className="mt-4 text-sm font-semibold text-slate-900">
          Couldn't load your profile
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Something went wrong while fetching your profile.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PROFILE PAGE                                                               */
/* -------------------------------------------------------------------------- */

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [skills, setSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  /* ------------------------------------------------------------------------ */
  /* APPLY SERVER DATA TO FORM STATE                                          */
  /* ------------------------------------------------------------------------ */

  const applyProfileData = (data) => {
    setProfile(data);
    setEducation(normalizeEducation(data.education));
    setExperience(normalizeExperience(data.experience));
    setProjects(normalizeProjects(data.projects));
    setCertifications(data.certifications || []);
    setSkills(data.parsedSkills || []);
  };

  /* ------------------------------------------------------------------------ */
  /* LOAD PROFILE                                                             */
  /* ------------------------------------------------------------------------ */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getProfileData();

      applyProfileData(data);
    } catch (err) {
      console.error("Profile loading failed:", err);

      setError(
        err?.response?.data?.message || "Failed to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* RESUME UPLOAD                                                            */
  /* ------------------------------------------------------------------------ */

  const handleResumeUpload = async (file) => {
    try {
      setUploading(true);
      setSaveMessage("");
      setError(null);

      await uploadResume(file);

      const updated = await getProfileData();

      applyProfileData(updated);

      const found = [
        [updated.experience?.length, "experience"],
        [updated.education?.length, "education"],
        [updated.projects?.length, "project"],
        [updated.parsedSkills?.length, "skill"],
      ]
        .filter(([count]) => count)
        .map(([count, name]) =>
          name === "experience" || name === "education"
            ? `${count} ${name} ${count === 1 ? "entry" : "entries"}`
            : `${count} ${name}${count === 1 ? "" : "s"}`
        );

      setSaveMessage(
        found.length
          ? `Resume analysed. We found ${found.join(", ")}. Please review the details below.`
          : "Resume uploaded, but we couldn't find details to fill in. Please add them manually."
      );
    } catch (err) {
      console.error("Resume upload failed:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to upload resume."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm("Delete this resume? You can upload a new one anytime.")) return;

    try {
      setDeletingResume(true);
      setError(null);
      setSaveMessage("");
      await deleteResume();
      applyProfileData(await getProfileData());
      setSaveMessage("Resume deleted successfully.");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete the resume.");
    } finally {
      setDeletingResume(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* SAVE PROFILE                                                             */
  /* ------------------------------------------------------------------------ */

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage("");
      setError(null);

      const updatedProfile = {
        ...profile,
        education: serializeEducation(education),
        experience: serializeExperience(experience),
        projects: serializeProjects(projects),
        certifications: certifications
          .map((item) => item.trim())
          .filter(Boolean),
        parsedSkills: skills,
      };

      const result = await updateProfile(updatedProfile);

      const freshProfile = await getProfileData();

      applyProfileData(freshProfile);

      setSaveMessage(result?.message || "Profile saved successfully.");

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (err) {
      console.error("Profile update failed:", err);

      setError(
        err?.response?.data?.message || "Failed to save your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* LOADING                                                                  */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <AppLayout user={null} readiness={null} pageTitle="My Profile">
        <main className="mx-auto w-full max-w-275 min-w-0 px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
          <ProfileSkeleton />
        </main>
      </AppLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* ERROR                                                                    */
  /* ------------------------------------------------------------------------ */

  if (error && !profile) {
    return (
      <AppLayout user={null} readiness={null} pageTitle="My Profile">
        <main className="w-full min-w-0 px-4 sm:px-6 lg:px-8">
          <ProfileError onRetry={loadProfile} />
        </main>
      </AppLayout>
    );
  }

  if (!profile) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* MAIN                                                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <AppLayout
      user={profile.user}
      readiness={null}
      pageTitle="My Profile"
      pageLabel="Student workspace"
    >
      <main className="mx-auto w-full max-w-275 min-w-0 px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
        {/* Page header */}
        <div className="mb-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />

                <span className="text-[11px] font-medium text-slate-400">
                  Student profile
                </span>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                My Profile
              </h1>

              <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                Keep your profile updated to improve your placement readiness.
              </p>
            </div>

            {/* Profile completion */}
            <div className="flex items-center gap-2">
              <div className="hidden text-right sm:block">
                <p className="text-[10px] text-slate-400">
                  Profile completeness
                </p>

                <p className="text-sm font-semibold text-slate-800">
                  {profile.profileCompletion}%
                </p>
              </div>

              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-teal-600 transition-all duration-500"
                  style={{
                    width: `${profile.profileCompletion}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* Success */}
        {saveMessage && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-xs font-medium text-teal-700">
            <CheckCircle2 size={15} />
            {saveMessage}
          </div>
        )}

        {/* Profile content */}
        <div className="space-y-5">
          {/* Resume first: uploading it fills in most of the sections below */}
          <ResumeSection
            resume={profile.resume}
            onFileSelect={handleResumeUpload}
            onDelete={handleResumeDelete}
            uploading={uploading}
            deleting={deletingResume}
          />

          <BasicInformationSection
            profile={profile}
            setProfile={setProfile}
          />

          <EducationSection
            education={education}
            setEducation={setEducation}
          />

          <ExperienceSection
            experience={experience}
            setExperience={setExperience}
            totalExperienceMonths={profile.totalExperienceMonths}
          />

          <ProjectsSection
            projects={projects}
            setProjects={setProjects}
          />

          <SkillsSection skills={skills} setSkills={setSkills} />

          <CertificationsSection
            certifications={certifications}
            setCertifications={setCertifications}
          />

          <CareerGoalsSection
            profile={profile}
            setProfile={setProfile}
          />

          {/* Save */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading}
              className="
                flex w-full items-center justify-center gap-2
                rounded-lg bg-teal-600 px-5 py-2.5
                text-xs font-semibold text-white
                transition hover:bg-teal-700
                disabled:cursor-not-allowed disabled:opacity-60
                sm:w-fit
              "
            >
              {saving ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save profile
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
