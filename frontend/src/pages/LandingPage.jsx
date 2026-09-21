import { useState } from "react";
import {
  Check,
  X,
  Eye,
  EyeOff,
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

function LandingPage() {
  const [drawer, setDrawer] = useState(null);
  const [role, setRole] = useState("student");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const closeDrawer = () => {
    setDrawer(null);

    setShowPassword(false);
    setShowConfirmPassword(false);

    setOtpSent(false);
    setOtpVerified(false);
  };

  const openDrawer = (type) => {
    setDrawer(type);

    setShowPassword(false);
    setShowConfirmPassword(false);

    setOtpSent(false);
    setOtpVerified(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-950 overflow-hidden">
      {/* =====================================================
          MAIN LANDING PAGE
      ====================================================== */}

      <main className="min-h-screen flex flex-col lg:flex-row">
        {/* ===================================================
            LEFT / HERO SECTION
        ==================================================== */}

        <section className="flex-1 flex items-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-2xl mx-auto lg:mx-0">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-16 sm:mb-20">
              <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
                <TrendingUp
                  size={20}
                  strokeWidth={2.5}
                  className="text-white"
                />
              </div>

              <span className="text-xl font-semibold tracking-tight">
                PlaceReady
              </span>
            </div>

            {/* Small heading */}
            <p className="text-teal-600 font-medium text-sm sm:text-base mb-5">
              For college students navigating placements
            </p>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] xl:text-[56px] leading-[1.08] font-semibold tracking-tight max-w-xl">
              Know exactly where you stand before placement season.
            </h1>

            {/* Description */}
            <p className="mt-7 text-base sm:text-lg leading-7 text-slate-500 max-w-xl">
              Upload your resume, see your skill gaps, and get matched to
              internships and jobs that fit where you are right now — not where
              you want to be.
            </p>

            {/* Feature list */}
            <div className="mt-12 space-y-7">
              <Feature
                title="Skill gap analysis"
                description="See exactly what each role needs versus what you have today"
              />

              <Feature
                title="Readiness score"
                description="A single number that moves as you add skills and experience"
              />

              <Feature
                title="Job matching"
                description="A match % for every internship and placement — no more guessing"
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            RIGHT SECTION
        ==================================================== */}

        <section className="lg:w-[38%] xl:w-[36%] bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex items-center">
          <div className="w-full max-w-md mx-auto px-6 py-14 sm:px-10 lg:px-12">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-12">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                <TrendingUp
                  size={17}
                  strokeWidth={2.5}
                  className="text-white"
                />
              </div>

              <span className="text-lg font-semibold tracking-tight">
                PlaceReady
              </span>
            </div>

            <p className="text-sm text-slate-500 mb-2">
              Your placement journey starts here.
            </p>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Ready to get started?
            </h2>

            <p className="mt-3 text-slate-500 leading-6">
              Log in to continue or create an account to start assessing your
              placement readiness.
            </p>

            {/* Buttons */}
            <div className="mt-10 space-y-3">
              <button
                type="button"
                onClick={() => openDrawer("login")}
                className="w-full h-12 rounded-lg bg-teal-600 text-white font-medium
                           hover:bg-teal-700 active:scale-[0.99]
                           transition-all duration-200
                           flex items-center justify-center gap-2"
              >
                Log in
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                onClick={() => openDrawer("signup")}
                className="w-full h-12 rounded-lg border border-slate-300 bg-white
                           text-slate-900 font-medium
                           hover:bg-slate-100 active:scale-[0.99]
                           transition-all duration-200"
              >
                Sign up
              </button>
            </div>

            {/* Recruiter access */}
            <div className="mt-10 pt-7 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-500">
                Are you a recruiter?
              </p>

              <button
                type="button"
                onClick={() => {
                  setRole("recruiter");
                  openDrawer("login");
                }}
                className="mt-1 text-sm text-teal-600 font-medium
                           hover:text-teal-700 transition-colors"
              >
                Access recruiter portal
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          BACKDROP
      ====================================================== */}

      {drawer && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px]"
          onClick={closeDrawer}
        />
      )}

      {/* =====================================================
          LOGIN DRAWER
      ====================================================== */}

      <aside
        className={`fixed z-50 top-0 right-0 h-full w-full sm:w-110 lg:w-120
                    bg-white shadow-2xl
                    transform transition-transform duration-300 ease-out
                    ${
                      drawer === "login"
                        ? "translate-x-0"
                        : "translate-x-full"
                    }
                    ${
                      drawer !== "login"
                        ? "pointer-events-none"
                        : ""
                    }`}
      >
        <div className="h-full overflow-y-auto">
          <div className="min-h-full px-6 py-8 sm:px-10">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                  <TrendingUp
                    size={17}
                    strokeWidth={2.5}
                    className="text-white"
                  />
                </div>

                <span className="text-lg font-semibold">
                  PlaceReady
                </span>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="w-9 h-9 rounded-lg flex items-center justify-center
                           text-slate-500 hover:text-slate-900
                           hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Login heading */}
            <div className="mt-16">
              <h2 className="text-3xl font-semibold tracking-tight">
                Welcome back
              </h2>

              <p className="mt-2 text-slate-500">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setRole("student");
                    openDrawer("signup");
                  }}
                  className="text-teal-600 font-medium hover:text-teal-700"
                >
                  Sign up
                </button>
              </p>
            </div>

            {/* Role switch */}
            <RoleSwitch
              role={role}
              setRole={setRole}
            />

            {/* Login form */}
            <form
              className="mt-8 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();

                console.log("Login submitted", {
                  role,
                });
              }}
            >
              <InputField
                label="Email address"
                type="email"
                placeholder={
                  role === "student"
                    ? "name@university.edu"
                    : "name@company.com"
                }
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-900">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full h-12 rounded-lg border border-slate-300
                               px-4 pr-12 text-sm outline-none
                               focus:border-teal-600 focus:ring-2
                               focus:ring-teal-600/10 transition"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-3 top-1/2
                               -translate-y-1/2
                               text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-lg bg-teal-600 text-white
                           font-medium hover:bg-teal-700
                           active:scale-[0.99] transition-all"
              >
                Sign in
              </button>
            </form>

            <p className="mt-7 text-xs leading-5 text-slate-400">
              By continuing, you agree to PlaceReady's Terms of Service and
              Privacy Policy.
            </p>
          </div>
        </div>
      </aside>

      {/* =====================================================
          SIGNUP DRAWER
      ====================================================== */}

      <aside
        className={`fixed z-50 top-0 left-0 w-full
                    bg-white shadow-2xl
                    transform transition-transform duration-300 ease-out
                    ${
                      drawer === "signup"
                        ? "translate-y-0"
                        : "-translate-y-full"
                    }
                    ${
                      drawer !== "signup"
                        ? "pointer-events-none"
                        : ""
                    }`}
      >
        <div className="h-screen overflow-y-auto">
          <div className="min-h-full flex flex-col">

            {/* =================================================
                HEADER
            ================================================== */}

            <div className="shrink-0 px-6 py-6 sm:px-10 lg:px-12 border-b border-slate-100">
              <div className="flex items-center justify-between max-w-6xl mx-auto">

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                    <TrendingUp
                      size={17}
                      strokeWidth={2.5}
                      className="text-white"
                    />
                  </div>

                  <span className="text-lg font-semibold">
                    PlaceReady
                  </span>
                </div>

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="w-9 h-9 rounded-lg flex items-center justify-center
                             text-slate-500 hover:text-slate-900
                             hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>

              </div>
            </div>

            {/* =================================================
                MAIN CONTENT
            ================================================== */}

            <div className="flex-1 flex items-center px-6 py-8 sm:px-10 lg:px-12">

              <div className="w-full max-w-6xl mx-auto">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                  {/* =================================================
                      LEFT COLUMN
                  ================================================== */}

                  <div className="lg:pr-8">

                    <p className="text-sm font-medium text-teal-600 mb-3">
                      Get started with PlaceReady
                    </p>

                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                      Create your account
                    </h2>

                    <p className="mt-3 text-slate-500 leading-6 max-w-md">
                      Build your profile, understand your placement
                      readiness, and discover opportunities that match your
                      current skills.
                    </p>

                    {/* Role selection */}
                    <div className="mt-8">

                      <p className="text-sm font-medium text-slate-900 mb-3">
                        What are you?
                      </p>

                      <div className="space-y-3">

                        <RoleCard
                          active={role === "student"}
                          icon={<GraduationCap size={22} />}
                          title="Student"
                          description="Assess your readiness and find relevant opportunities."
                          onClick={() => setRole("student")}
                        />

                        <RoleCard
                          active={role === "recruiter"}
                          icon={<BriefcaseBusiness size={22} />}
                          title="Recruiter"
                          description="Post roles and discover candidates that match."
                          onClick={() => setRole("recruiter")}
                        />

                      </div>
                    </div>

                  </div>

                  {/* =================================================
                      RIGHT COLUMN / SIGNUP FORM
                  ================================================== */}

                  <div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();

                        if (!otpVerified) {
                          return;
                        }

                        console.log("Signup submitted", {
                          role,
                          otpVerified,
                        });
                      }}
                    >

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                        {/* =========================
                            FULL NAME
                        ========================== */}

                        <InputField
                          label="Full name"
                          placeholder="Your Name"
                        />

                        {/* =========================
                            EMAIL
                        ========================== */}

                        <InputField
                          label={
                            role === "student"
                              ? "University email"
                              : "Work email"
                          }
                          type="email"
                          placeholder={
                            role === "student"
                              ? "name@university.edu"
                              : "name@company.com"
                          }
                        />

                        {/* =========================
                            ROLE-SPECIFIC FIELDS
                        ========================== */}

                        {role === "student" ? (
                          <>
                            <InputField
                              label="University"
                              placeholder="University name"
                            />

                            <InputField
                              label="Graduation year"
                              type="number"
                              placeholder="2027"
                            />
                          </>
                        ) : (
                          <>
                            <InputField
                              label="Company"
                              placeholder="Company name"
                            />

                            <InputField
                              label="Designation"
                              placeholder="Recruiter"
                            />
                          </>
                        )}

                        {/* =========================
                            PHONE NUMBER
                        ========================== */}

                        <div className="sm:col-span-2">

                          <label className="text-sm font-medium text-slate-900">
                            Phone number
                          </label>

                          <div className="mt-2 flex gap-3">

                            {/* Country code */}
                            <div
                              className="w-19 h-12 rounded-lg
                                         border border-slate-300
                                         bg-slate-50
                                         flex items-center justify-center
                                         text-sm text-slate-600
                                         shrink-0"
                            >
                              +91
                            </div>

                            {/* Phone input */}
                            <input
                              type="tel"
                              inputMode="numeric"
                              maxLength={10}
                              placeholder="0000000000"
                              disabled={otpVerified}
                              className="flex-1 min-w-0 h-12
                                         rounded-lg border border-slate-300
                                         px-4 text-sm outline-none
                                         placeholder:text-slate-400
                                         disabled:bg-slate-100
                                         disabled:text-slate-500
                                         focus:border-teal-600
                                         focus:ring-2
                                         focus:ring-teal-600/10
                                         transition"
                            />

                            {/* Send OTP */}
                            <button
                              type="button"
                              onClick={() => setOtpSent(true)}
                              disabled={otpVerified}
                              className="h-12 px-5 rounded-lg
                                         border border-teal-600
                                         text-teal-600 font-medium
                                         hover:bg-teal-50
                                         disabled:border-slate-300
                                         disabled:text-slate-400
                                         disabled:bg-slate-50
                                         transition-colors
                                         whitespace-nowrap"
                            >
                              {otpVerified
                                ? "Verified"
                                : otpSent
                                ? "Resend OTP"
                                : "Send OTP"}
                            </button>

                          </div>
                        </div>

                        {/* =========================
                            OTP VERIFICATION
                        ========================== */}

                        {otpSent && !otpVerified && (
                          <div className="sm:col-span-2">

                            <div
                              className="rounded-lg
                                         border border-teal-100
                                         bg-teal-50/50 p-4"
                            >

                              <div className="flex items-start justify-between gap-4">

                                <div>
                                  <p className="text-sm font-medium text-slate-900">
                                    Verify your phone number
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    Enter the 6-digit OTP sent to your phone.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOtpSent(false);
                                    setOtpVerified(false);
                                  }}
                                  className="text-xs text-slate-500
                                             hover:text-slate-900
                                             whitespace-nowrap"
                                >
                                  Change number
                                </button>

                              </div>

                              <div className="mt-4 flex gap-3">

                                <input
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={6}
                                  placeholder="000000"
                                  className="flex-1 min-w-0 h-12
                                             rounded-lg
                                             border border-slate-300
                                             bg-white px-4
                                             text-sm tracking-[0.3em]
                                             outline-none
                                             focus:border-teal-600
                                             focus:ring-2
                                             focus:ring-teal-600/10
                                             transition"
                                />

                                <button
                                  type="button"
                                  onClick={() => setOtpVerified(true)}
                                  className="h-12 px-6 rounded-lg
                                             bg-teal-600 text-white
                                             font-medium
                                             hover:bg-teal-700
                                             transition-colors"
                                >
                                  Verify
                                </button>

                              </div>

                              <div className="mt-3 flex items-center justify-between">

                                <p className="text-xs text-slate-400">
                                  Didn't receive the code?
                                </p>

                                <button
                                  type="button"
                                  onClick={() => setOtpSent(true)}
                                  className="text-xs text-teal-600
                                             font-medium
                                             hover:text-teal-700"
                                >
                                  Resend OTP
                                </button>

                              </div>

                            </div>

                          </div>
                        )}

                        {/* =========================
                            VERIFIED MESSAGE
                        ========================== */}

                        {otpVerified && (
                          <div className="sm:col-span-2">

                            <div
                              className="flex items-center gap-2
                                         rounded-lg
                                         border border-emerald-200
                                         bg-emerald-50
                                         px-4 py-3"
                            >

                              <div
                                className="w-5 h-5 rounded-full
                                           bg-emerald-500
                                           flex items-center justify-center"
                              >
                                <Check
                                  size={13}
                                  className="text-white"
                                  strokeWidth={3}
                                />
                              </div>

                              <p className="text-sm font-medium text-emerald-700">
                                Phone number verified successfully
                              </p>

                            </div>

                          </div>
                        )}

                        {/* =========================
                            PASSWORD
                        ========================== */}

                        <div>

                          <label className="text-sm font-medium text-slate-900">
                            Password
                          </label>

                          <div className="relative mt-2">

                            <input
                              type={
                                showPassword
                                  ? "text"
                                  : "password"
                              }
                              placeholder="Create a password"
                              className="w-full h-12
                                         rounded-lg
                                         border border-slate-300
                                         px-4 pr-12
                                         text-sm outline-none
                                         placeholder:text-slate-400
                                         focus:border-teal-600
                                         focus:ring-2
                                         focus:ring-teal-600/10
                                         transition"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowPassword(
                                  (prev) => !prev
                                )
                              }
                              className="absolute right-3
                                         top-1/2
                                         -translate-y-1/2
                                         text-slate-400
                                         hover:text-slate-700"
                            >
                              {showPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>

                          </div>

                        </div>

                        {/* =========================
                            CONFIRM PASSWORD
                        ========================== */}

                        <div>

                          <label className="text-sm font-medium text-slate-900">
                            Confirm password
                          </label>

                          <div className="relative mt-2">

                            <input
                              type={
                                showConfirmPassword
                                  ? "text"
                                  : "password"
                              }
                              placeholder="Confirm your password"
                              className="w-full h-12
                                         rounded-lg
                                         border border-slate-300
                                         px-4 pr-12
                                         text-sm outline-none
                                         placeholder:text-slate-400
                                         focus:border-teal-600
                                         focus:ring-2
                                         focus:ring-teal-600/10
                                         transition"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(
                                  (prev) => !prev
                                )
                              }
                              className="absolute right-3
                                         top-1/2
                                         -translate-y-1/2
                                         text-slate-400
                                         hover:text-slate-700"
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>

                          </div>

                        </div>

                      </div>

                      {/* =========================
                          CREATE ACCOUNT
                      ========================== */}

                      <button
                        type="submit"
                        disabled={!otpVerified}
                        className="mt-6 w-full h-12 rounded-lg
                                   bg-teal-600 text-white font-medium
                                   hover:bg-teal-700
                                   active:scale-[0.99]
                                   transition-all
                                   disabled:bg-slate-200
                                   disabled:text-slate-400
                                   disabled:cursor-not-allowed"
                      >
                        {otpVerified
                          ? "Create account"
                          : "Verify phone to continue"}
                      </button>

                      {/* Terms */}
                      <p
                        className="mt-4 text-center text-xs
                                   leading-5 text-slate-400"
                      >
                        By creating an account, you agree to PlaceReady's
                        Terms of Service and Privacy Policy.
                      </p>

                      {/* Login link */}
                      <p className="mt-5 text-center text-sm text-slate-500">
                        Already have an account?{" "}

                        <button
                          type="button"
                          onClick={() => openDrawer("login")}
                          className="text-teal-600 font-medium
                                     hover:text-teal-700"
                        >
                          Log in
                        </button>
                      </p>

                    </form>

                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* =========================================================
   FEATURE COMPONENT
========================================================= */

function Feature({ title, description }) {
  return (
    <div className="flex gap-4">

      <div
        className="mt-0.5 w-6 h-6 shrink-0 rounded-full
                   border border-teal-200 bg-teal-50
                   flex items-center justify-center"
      >
        <Check
          size={14}
          className="text-teal-600"
          strokeWidth={2.5}
        />
      </div>

      <div>
        <h3 className="font-medium text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-sm sm:text-base
                      text-slate-500 leading-6">
          {description}
        </p>
      </div>

    </div>
  );
}

/* =========================================================
   ROLE SWITCH
========================================================= */

function RoleSwitch({ role, setRole }) {
  return (
    <div className="mt-8 grid grid-cols-2 h-11 p-1 rounded-lg bg-slate-100">

      <button
        type="button"
        onClick={() => setRole("student")}
        className={`rounded-md text-sm font-medium transition-all ${
          role === "student"
            ? "bg-white text-slate-950 shadow-sm"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        Student
      </button>

      <button
        type="button"
        onClick={() => setRole("recruiter")}
        className={`rounded-md text-sm font-medium transition-all ${
          role === "recruiter"
            ? "bg-white text-slate-950 shadow-sm"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        Recruiter
      </button>

    </div>
  );
}

/* =========================================================
   INPUT COMPONENT
========================================================= */

function InputField({
  label,
  type = "text",
  placeholder,
}) {
  return (
    <div>

      <label className="text-sm font-medium text-slate-900">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full h-12
                   rounded-lg border border-slate-300
                   px-4 text-sm outline-none
                   placeholder:text-slate-400
                   focus:border-teal-600
                   focus:ring-2
                   focus:ring-teal-600/10
                   transition"
      />

    </div>
  );
}

/* =========================================================
   ROLE CARD
========================================================= */

function RoleCard({
  active,
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border
                  transition-all ${
                    active
                      ? "border-teal-600 bg-teal-50/60 ring-1 ring-teal-600"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
    >

      <div
        className={`w-10 h-10 rounded-lg
                    flex items-center justify-center ${
                      active
                        ? "bg-teal-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
      >
        {icon}
      </div>

      <h3 className="mt-4 font-medium text-slate-950">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-5 text-slate-500">
        {description}
      </p>

    </button>
  );
}

export default LandingPage;