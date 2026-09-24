import { useState } from "react";
import { TrendingUp } from "lucide-react";
import IntroStep1 from "../components/introduction/IntroStep1";
import IntroStep2 from "../components/introduction/IntroStep2";
import IntroStep3 from "../components/introduction/IntroStep3";

const steps = [
  "About you",
  "Resume",
  "Goals",
];

export default function Introduction() {
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

  const updateProfile = (updates) => {
    setProfileData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleComplete = () => {
    console.log("Introduction completed:", profileData);

    // Backend integration will go here later.
    // Example:
    // await completeProfile(profileData);

    // Later:
    // navigate("/dashboard");
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
                <TrendingUp size={17} strokeWidth={2.2} className="text-white" >
                </TrendingUp>
              </div>

              <span className="text-sm font-semibold text-slate-950">
                PlaceReady
              </span>
            </div>

            {/* Step labels */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
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