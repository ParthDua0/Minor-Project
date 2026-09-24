import { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  X,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { uploadResume } from "../../api/apiIntroduction";

export default function IntroStep2({
  data,
  updateProfile,
  onBack,
  onContinue,
}) {
  const fileInputRef = useRef(null);

  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [parsedData, setParsedData] = useState(
    data.extractedData || null
  );

  useEffect(() => {
    if (data.extractedData) {
      setParsedData(data.extractedData);
    }
  }, [data.extractedData]);

  const handleFile = async (file) => {
    if (!file) return;

    setError("");

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF or DOCX resume.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Resume must be smaller than 5 MB.");
      return;
    }

    try {
      setUploading(true);

      setParsedData(null);

      updateProfile({
        resume: file,
        extractedData: null,
      });

      const result = await uploadResume(file);

      console.log("Resume parsing response:", result);

      const extracted = result?.parsedResume;

      if (!extracted) {
        throw new Error(
          "Resume was uploaded, but no parsed data was returned."
        );
      }

      setParsedData(extracted);

      updateProfile({
        resume: file,
        extractedData: extracted,
      });
    } catch (error) {
      console.error("Resume upload failed:", error);

      setParsedData(null);

      updateProfile({
        resume: null,
        extractedData: null,
      });

      setError(
        error?.response?.data?.error ||
          error?.message ||
          "Unable to upload and process your resume."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const removeResume = () => {
    updateProfile({
      resume: null,
      extractedData: null,
    });

    setParsedData(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* -----------------------------------------
     Generic parsed field
  ----------------------------------------- */

  const updateParsedField = (field, value) => {
    const updated = {
      ...(parsedData || {}),
      [field]: value,
    };

    setParsedData(updated);

    updateProfile({
      extractedData: updated,
    });
  };

  /* -----------------------------------------
     Education
  ----------------------------------------- */

  const updateEducation = (index, field, value) => {
    const education = [...(parsedData?.education || [])];

    education[index] = {
      ...education[index],
      [field]: value,
    };

    updateParsedField("education", education);
  };

  const addEducation = () => {
    const education = [
      ...(parsedData?.education || []),
      {
        degree: "",
        year: "",
        cgpa: "",
      },
    ];

    updateParsedField("education", education);
  };

  const removeEducation = (index) => {
    const education = [...(parsedData?.education || [])];

    education.splice(index, 1);

    updateParsedField("education", education);
  };

  /* -----------------------------------------
     Experience
  ----------------------------------------- */

  const updateExperience = (index, field, value) => {
    const experience = [...(parsedData?.experience || [])];

    experience[index] = {
      ...experience[index],
      [field]: value,
    };

    updateParsedField("experience", experience);
  };

  const addExperience = () => {
    const experience = [
      ...(parsedData?.experience || []),
      {
        title: "",
        description: "",
      },
    ];

    updateParsedField("experience", experience);
  };

  const removeExperience = (index) => {
    const experience = [...(parsedData?.experience || [])];

    experience.splice(index, 1);

    updateParsedField("experience", experience);
  };

  /* -----------------------------------------
     Skills
  ----------------------------------------- */

  const updateSkill = (index, value) => {
    const skills = [...(parsedData?.parsedSkills || [])];

    skills[index] = value;

    updateParsedField("parsedSkills", skills);
  };

  const addSkill = () => {
    updateParsedField("parsedSkills", [
      ...(parsedData?.parsedSkills || []),
      "",
    ]);
  };

  const removeSkill = (index) => {
    const skills = [...(parsedData?.parsedSkills || [])];

    skills.splice(index, 1);

    updateParsedField("parsedSkills", skills);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Upload your resume
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          We'll extract information from your resume. Review and
          correct anything before continuing.
        </p>
      </div>

      {/* -----------------------------------------
          Upload
      ----------------------------------------- */}

      {!data.resume ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="
            mt-8 flex min-h-55 cursor-pointer flex-col
            items-center justify-center rounded-xl
            border border-dashed border-slate-300
            bg-slate-50/60 px-6 text-center
            transition hover:border-teal-500
            hover:bg-teal-50/30
          "
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Upload size={22} />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-800">
            Upload your resume
          </p>

          <p className="mt-1 text-xs text-slate-400">
            PDF or DOCX · Maximum 5 MB
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="
              mt-5 h-9 rounded-lg bg-teal-600
              px-5 text-xs font-medium text-white
              hover:bg-teal-700
            "
          >
            Choose file
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <>
          {/* -----------------------------------------
              Resume file
          ----------------------------------------- */}

          <div className="mt-8 flex items-center justify-between rounded-xl border border-slate-200 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <FileText size={19} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {data.resume.name}
                </p>

                <p className="text-xs text-slate-400">
                  {(data.resume.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeResume}
              className="
                rounded-lg p-2 text-slate-400
                hover:bg-slate-100 hover:text-red-500
              "
              aria-label="Remove resume"
            >
              <X size={17} />
            </button>
          </div>

          {/* -----------------------------------------
              Uploading / Parsing
          ----------------------------------------- */}

          {uploading && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-teal-100 bg-teal-50 px-4 py-4">
              <Loader2
                size={18}
                className="animate-spin text-teal-600"
              />

              <div>
                <p className="text-sm font-medium text-slate-800">
                  Processing your resume...
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Extracting your profile information.
                </p>
              </div>
            </div>
          )}

          {/* -----------------------------------------
              Parsed information
          ----------------------------------------- */}

          {!uploading && parsedData && (
            <div className="mt-8 space-y-6">
              {/* Personal Information */}
              <SectionCard title="Personal information">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Full name"
                    value={parsedData.fullname}
                    onChange={(value) =>
                      updateParsedField("fullname", value)
                    }
                  />

                  <FormField
                    label="Email"
                    value={parsedData.email}
                    onChange={(value) =>
                      updateParsedField("email", value)
                    }
                    type="email"
                  />

                  <FormField
                    label="Phone"
                    value={parsedData.phone}
                    onChange={(value) =>
                      updateParsedField("phone", value)
                    }
                  />
                </div>
              </SectionCard>

              {/* Education */}
              <SectionCard title="Education">
                {(parsedData.education || []).map(
                  (education, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg border border-slate-200 p-4"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          removeEducation(index)
                        }
                        className="
                          absolute right-3 top-3 rounded-md
                          p-1.5 text-slate-400
                          hover:bg-red-50 hover:text-red-500
                        "
                        aria-label="Remove education"
                      >
                        <Trash2 size={15} />
                      </button>

                      <div className="grid grid-cols-1 gap-4 pr-8 sm:grid-cols-3">
                        <FormField
                          label="Degree"
                          value={education.degree}
                          onChange={(value) =>
                            updateEducation(
                              index,
                              "degree",
                              value
                            )
                          }
                        />

                        <FormField
                          label="Year"
                          value={education.year}
                          onChange={(value) =>
                            updateEducation(
                              index,
                              "year",
                              value
                            )
                          }
                          type="number"
                        />

                        <FormField
                          label="CGPA / GPA"
                          value={education.cgpa}
                          onChange={(value) =>
                            updateEducation(
                              index,
                              "cgpa",
                              value
                            )
                          }
                          type="number"
                        />
                      </div>
                    </div>
                  )
                )}

                <AddButton
                  label="Add education"
                  onClick={addEducation}
                />
              </SectionCard>

              {/* Skills */}
              <SectionCard title="Skills">
                <div className="space-y-3">
                  {(parsedData.parsedSkills || []).map(
                    (skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={skill || ""}
                          onChange={(e) =>
                            updateSkill(
                              index,
                              e.target.value
                            )
                          }
                          placeholder="Enter skill"
                          className="
                            h-10 flex-1 rounded-lg
                            border border-slate-300
                            px-3 text-sm outline-none
                            focus:border-teal-600
                            focus:ring-2
                            focus:ring-teal-600/10
                          "
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeSkill(index)
                          }
                          className="
                            rounded-lg p-2
                            text-slate-400
                            hover:bg-red-50
                            hover:text-red-500
                          "
                          aria-label="Remove skill"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )
                  )}
                </div>

                <AddButton
                  label="Add skill"
                  onClick={addSkill}
                />
              </SectionCard>

              {/* Experience */}
              <SectionCard title="Experience">
                {(parsedData.experience || []).map(
                  (experience, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg border border-slate-200 p-4"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          removeExperience(index)
                        }
                        className="
                          absolute right-3 top-3 rounded-md
                          p-1.5 text-slate-400
                          hover:bg-red-50 hover:text-red-500
                        "
                        aria-label="Remove experience"
                      >
                        <Trash2 size={15} />
                      </button>

                      <div className="space-y-4 pr-8">
                        <FormField
                          label="Title / Role"
                          value={experience.title}
                          onChange={(value) =>
                            updateExperience(
                              index,
                              "title",
                              value
                            )
                          }
                        />

                        <FormField
                          label="Description"
                          value={experience.description}
                          onChange={(value) =>
                            updateExperience(
                              index,
                              "description",
                              value
                            )
                          }
                          textarea
                        />
                      </div>
                    </div>
                  )
                )}

                <AddButton
                  label="Add experience"
                  onClick={addExperience}
                />
              </SectionCard>

              {/* Links */}
              <SectionCard title="Links">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    label="LinkedIn"
                    value={parsedData.linkedin}
                    onChange={(value) =>
                      updateParsedField(
                        "linkedin",
                        value
                      )
                    }
                    type="url"
                  />

                  <FormField
                    label="GitHub"
                    value={parsedData.github}
                    onChange={(value) =>
                      updateParsedField(
                        "github",
                        value
                      )
                    }
                    type="url"
                  />

                  <FormField
                    label="Portfolio"
                    value={parsedData.portfolio}
                    onChange={(value) =>
                      updateParsedField(
                        "portfolio",
                        value
                      )
                    }
                    type="url"
                  />
                </div>
              </SectionCard>

              {/* Success */}
              <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <CheckCircle2
                  size={17}
                  className="shrink-0 text-emerald-600"
                />

                <p className="text-xs text-emerald-700">
                  Resume processed successfully. Review the
                  information above and correct anything that
                  was missed.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Error */}
      {error && (
        <p className="mt-3 text-xs text-red-500">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="
            h-10 rounded-lg bg-slate-100
            px-5 text-sm font-medium
            text-slate-700 hover:bg-slate-200
          "
        >
          Back
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={!parsedData || uploading}
          className="
            h-10 rounded-lg bg-teal-600
            px-6 text-sm font-medium text-white
            hover:bg-teal-700
            disabled:cursor-not-allowed
            disabled:bg-slate-200
            disabled:text-slate-400
          "
        >
          Continue
        </button>
      </div>
    </section>
  );
}

/* -----------------------------------------
   Reusable section
----------------------------------------- */

function SectionCard({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <h2 className="text-sm font-semibold text-slate-900">
        {title}
      </h2>

      <div className="mt-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

/* -----------------------------------------
   Reusable field
----------------------------------------- */

function FormField({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-700">
        {label}
      </label>

      {textarea ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="
            mt-2 w-full rounded-lg
            border border-slate-300
            px-3 py-2 text-sm
            outline-none transition
            focus:border-teal-600
            focus:ring-2
            focus:ring-teal-600/10
          "
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="
            mt-2 h-10 w-full rounded-lg
            border border-slate-300
            px-3 text-sm
            outline-none transition
            focus:border-teal-600
            focus:ring-2
            focus:ring-teal-600/10
          "
        />
      )}
    </div>
  );
}

/* -----------------------------------------
   Add button
----------------------------------------- */

function AddButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        mt-2 flex items-center gap-1.5
        text-xs font-medium text-teal-600
        hover:text-teal-700
      "
    >
      <Plus size={15} />
      {label}
    </button>
  );
}