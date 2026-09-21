// src/pages/Profile.jsx

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Plus,
  Save,
  Trash2,
  Upload,
  AlertCircle,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  getProfileData,
  updateProfile,
  uploadResume,
} from "../api/apiProfile";

import AppLayout from "../components/layout/AppLayout";

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
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] font-medium text-slate-600">
        {label}
      </label>

      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="
          h-10 w-full rounded-lg border border-slate-200
          bg-white px-3 text-xs text-slate-800
          outline-none transition
          placeholder:text-slate-300
          focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10
        "
      />
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

/* -------------------------------------------------------------------------- */
/* RESUME SECTION                                                             */
/* -------------------------------------------------------------------------- */

function ResumeSection({
  resume,
  onFileSelect,
  uploading,
}) {
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
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    handleFiles(event.dataTransfer.files);
  };

  if (resume?.uploaded) {
    return (
      <SectionCard
        label="Resume"
        title="Your resume"
        action={
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] font-semibold text-teal-600 hover:text-teal-700"
          >
            Replace
          </button>
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(event) =>
            handleFiles(event.target.files)
          }
        />

        <div className="flex flex-col gap-4 rounded-xl border border-teal-100 bg-teal-50/50 p-4 sm:flex-row sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-teal-600 shadow-sm">
            <FileText size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-800">
              {resume.fileName}
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Resume uploaded successfully
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-medium text-teal-600">
            <CheckCircle2 size={14} />
            Uploaded
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
          <SparkleIcon />
          Resume parsing will identify your skills once the backend is connected.
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard label="Resume" title="Upload your resume">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(event) =>
          handleFiles(event.target.files)
        }
      />

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
            ? "Uploading your resume..."
            : "Drop your resume here"}
        </p>

        <p className="mt-1.5 text-[11px] text-slate-400">
          PDF or DOCX, up to 5 MB
          {" · "}
          <span className="font-medium text-teal-600">
            browse files
          </span>
        </p>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5">
        <FileText
          size={14}
          className="mt-0.5 shrink-0 text-blue-500"
        />

        <p className="text-[10px] leading-4 text-blue-600">
          Upload your latest resume. PlaceReady will eventually
          extract your skills and use them for readiness analysis
          and job matching.
        </p>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* EDUCATION                                                                  */
/* -------------------------------------------------------------------------- */

function EducationSection({
  education,
  setEducation,
}) {
  const updateField = (field, value) => {
    setEducation((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <SectionCard
      label="Education"
      title="Academic background"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Degree & Branch"
          value={education.degree}
          placeholder="e.g. B.Tech Computer Science"
          onChange={(event) =>
            updateField("degree", event.target.value)
          }
        />

        <FormField
          label="Institution"
          value={education.institution}
          placeholder="Your university"
          onChange={(event) =>
            updateField("institution", event.target.value)
          }
        />

        <FormField
          label="Duration"
          value={education.duration}
          placeholder="e.g. 2023-2027"
          onChange={(event) =>
            updateField("duration", event.target.value)
          }
        />

        <FormField
          label="GPA / CGPA"
          value={education.cgpa}
          placeholder="e.g. 7.5 / 10"
          onChange={(event) =>
            updateField("cgpa", event.target.value)
          }
        />
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
}) {
  const addExperience = () => {
    setExperience((previous) => [
      ...previous,
      {
        id: Date.now(),
        jobTitle: "",
        company: "",
        description: "",
        startDate: "",
        endDate: "",
      },
    ]);
  };

  const removeExperience = (id) => {
    setExperience((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const updateExperience = (
    id,
    field,
    value
  ) => {
    setExperience((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  return (
    <SectionCard
      label="Experience"
      title="Work experience"
      action={
        <button
          type="button"
          onClick={addExperience}
          className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700"
        >
          <Plus size={14} />
          Add entry
        </button>
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

        {experience.map((item, index) => (
          <div
            key={item.id}
            className="relative rounded-xl border border-slate-200 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Experience {index + 1}
              </span>

              {experience.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    removeExperience(item.id)
                  }
                  className="flex items-center gap-1 text-[10px] font-medium text-red-500 hover:text-red-600"
                >
                  <Trash2 size={13} />
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Job Title"
                value={item.jobTitle}
                placeholder="e.g. Data Analyst Intern"
                onChange={(event) =>
                  updateExperience(
                    item.id,
                    "jobTitle",
                    event.target.value
                  )
                }
              />

              <FormField
                label="Company"
                value={item.company}
                placeholder="Company name"
                onChange={(event) =>
                  updateExperience(
                    item.id,
                    "company",
                    event.target.value
                  )
                }
              />

              <FormField
                label="Start Date"
                value={item.startDate}
                placeholder="e.g. June 2026"
                onChange={(event) =>
                  updateExperience(
                    item.id,
                    "startDate",
                    event.target.value
                  )
                }
              />

              <FormField
                label="End Date"
                value={item.endDate}
                placeholder="e.g. August 2026"
                onChange={(event) =>
                  updateExperience(
                    item.id,
                    "endDate",
                    event.target.value
                  )
                }
              />

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[11px] font-medium text-slate-600">
                  Description
                </label>

                <textarea
                  value={item.description || ""}
                  onChange={(event) =>
                    updateExperience(
                      item.id,
                      "description",
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Describe your responsibilities, projects, achievements, or impact..."
                  className="
                    w-full resize-none rounded-lg border border-slate-200
                    bg-white px-3 py-2.5 text-xs text-slate-800
                    outline-none transition
                    placeholder:text-slate-300
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10
                  "
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* SMALL ICON                                                                 */
/* -------------------------------------------------------------------------- */

function SparkleIcon() {
  return (
    <span className="mt-0.5 text-blue-500">
      ✦
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* LOADING                                                                     */
/* -------------------------------------------------------------------------- */

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div>
        <div className="h-8 w-40 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-72 rounded bg-slate-200" />
      </div>

      <div className="h-52.5 rounded-2xl bg-slate-200" />

      <div className="h-55 rounded-2xl bg-slate-200" />

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

  const [education, setEducation] =
    useState(null);

  const [experience, setExperience] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [saveMessage, setSaveMessage] =
    useState("");

  /* ------------------------------------------------------------------------ */
  /* LOAD PROFILE                                                             */
  /* ------------------------------------------------------------------------ */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getProfileData();

      setProfile(data);
      setEducation(data.education);
      setExperience(data.experience || []);
    } catch (err) {
      console.error(
        "Profile loading failed:",
        err
      );

      setError(
        "Failed to load your profile."
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

      const result =
        await uploadResume(file);

      if (result.success) {
        setProfile((previous) => ({
          ...previous,
          resume: result.resume,
        }));

        setSaveMessage(
          "Resume uploaded successfully."
        );
      }
    } catch (err) {
      console.error(
        "Resume upload failed:",
        err
      );

      setError(
        "Failed to upload resume."
      );
    } finally {
      setUploading(false);
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
        education,
        experience,
      };

      const result =
        await updateProfile(
          updatedProfile
        );

      if (result.success) {
        setProfile((previous) => ({
          ...previous,
          education,
          experience,
        }));

        setSaveMessage(
          "Profile saved successfully."
        );

        setTimeout(() => {
          setSaveMessage("");
        }, 3000);
      }
    } catch (err) {
      console.error(
        "Profile update failed:",
        err
      );

      setError(
        "Failed to save your profile."
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
      <AppLayout
        user={null}
        readiness={null}
        pageTitle="My Profile"
      >
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
      <AppLayout
        user={null}
        readiness={null}
        pageTitle="My Profile"
      >
        <main className="w-full min-w-0 px-4 sm:px-6 lg:px-8">
          <ProfileError onRetry={loadProfile} />
        </main>
      </AppLayout>
    );
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
                Keep your profile updated to improve your readiness score.
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
          {/* Resume */}
          <ResumeSection
            resume={profile.resume}
            onFileSelect={handleResumeUpload}
            uploading={uploading}
          />

          {/* Education */}
          <EducationSection
            education={education}
            setEducation={setEducation}
          />

          {/* Experience */}
          <ExperienceSection
            experience={experience}
            setExperience={setExperience}
          />

          {/* Save */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
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