import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import IntroStep1 from "../components/introduction/IntroStep1";
import IntroStep2 from "../components/introduction/IntroStep2";
import IntroStep3 from "../components/introduction/IntroStep3";
import { saveIntroduction } from "../api/apiIntroduction";

const steps = [
  "About you",
  "Resume",
  "Goals",
];

export default function Introduction() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [profileData, setProfileData] = useState({
    branch: "",
    graduationYear: "",
    cgpa: "",
    currentYear: "",

    resume: null,
    extractedData: null,

    targetRoles: [],
    customGoal: "",

    employmentType: "both",
    workPreference: [],
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const updateProfile = (updates) => {
    setProfileData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleComplete = async () => {
    try {
      setSaving(true);
      setSaveError("");

      const extracted = profileData.extractedData || {};

      const payload = {
        fullname: extracted.fullname || "",
        email: extracted.email || "",
        phone: extracted.phone || "",

        role: "student",

        graduationYear: profileData.graduationYear
          ? Number(profileData.graduationYear)
          : undefined,

        profile: {
          branch: profileData.branch || "",

          cgpa: profileData.cgpa
            ? Number(profileData.cgpa)
            : undefined,

          currentYear: profileData.currentYear
            ? Number(profileData.currentYear)
            : undefined,

          targetRoles: profileData.targetRoles || [],
        },

        employmentType: profileData.employmentType || "both",

        workPreference: profileData.workPreference || [],

        customGoal: profileData.customGoal?.trim() || "",
      };

      console.log("Saving onboarding data:", payload);

      const response = await saveIntroduction(payload);

      console.log("Profile saved successfully:", response);

      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save profile:", error);

      setSaveError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 lg:py-12">
        {/* HEADER */}
        <header className="mb-10">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
                <TrendingUp
                  size={17}
                  strokeWidth={2.2}
                  className="text-white"
                />
              </div>

              <span className="text-sm font-semibold text-slate-950">
                PlaceReady
              </span>
            </div>

            {/* Step labels */}
            <div className="hidden items-center gap-2 text-xs sm:flex">
              {steps.map((label, index) => {
                const stepNumber = index + 1;
                const active = stepNumber === step;
                const completed = stepNumber < step;

                return (
                  <div
                    key={label}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={
                        active || completed
                          ? "font-medium text-teal-600"
                          : "text-slate-300"
                      }
                    >
                      {label}
                    </span>

                    {stepNumber !== steps.length && (
                      <span className="text-slate-300">
                        —
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-8 flex gap-1.5">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-0.5 flex-1 rounded-full transition-colors ${
                  index + 1 <= step
                    ? "bg-teal-600"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </header>

        {/* STEP CONTENT */}
        {step === 1 && (
          <IntroStep1
            data={profileData}
            updateProfile={updateProfile}
            onContinue={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <IntroStep2
            data={profileData}
            updateProfile={updateProfile}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <IntroStep3
            data={profileData}
            updateProfile={updateProfile}
            onBack={() => setStep(2)}
            onComplete={handleComplete}
            saving={saving}
            saveError={saveError}
          />
        )}

        {/* FOOTER */}
        <p className="mt-6 text-center text-[11px] text-slate-400">
          Step {step} of 3 · You can edit all of this from your
          profile later
        </p>
      </div>
    </div>
  );
}