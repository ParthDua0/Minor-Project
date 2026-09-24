import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

import {
  loginUser,
  registerUser,
  sendOtp,
  verifyOtp,
} from "../api/apiAuth";

function LandingPage() {
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(null);
  const [role, setRole] = useState("student");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* =========================================================
     LOGIN STATE
  ========================================================= */

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [loginErrors, setLoginErrors] = useState({});
  const [loginApiError, setLoginApiError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  /* =========================================================
     SIGNUP STATE
  ========================================================= */

  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    otp: "",
    university: "",
    graduationYear: "",
    company: "",
    designation: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [signupErrors, setSignupErrors] = useState({});
  const [signupApiError, setSignupApiError] = useState("");

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);

  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  /* =========================================================
     DRAWER
  ========================================================= */

  const resetLogin = () => {
    setLoginForm({
      email: "",
      password: "",
    });

    setLoginErrors({});
    setLoginApiError("");
    setLoginLoading(false);
  };

  const resetSignup = () => {
    setSignupForm({
      fullName: "",
      email: "",
      otp: "",
      university: "",
      graduationYear: "",
      company: "",
      designation: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });

    setSignupErrors({});
    setSignupApiError("");

    setEmailOtpSent(false);
    setEmailOtpVerified(false);

    setOtpLoading(false);
    setOtpVerifyLoading(false);
    setSignupLoading(false);

    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const closeDrawer = () => {
    setDrawer(null);
    resetLogin();
    resetSignup();
  };

  const openDrawer = (type) => {
    setDrawer(type);

    if (type === "login") {
      resetLogin();
    }

    if (type === "signup") {
      resetSignup();
    }
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const updateLoginField = (field, value) => {
    setLoginForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setLoginErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setLoginApiError("");
  };

  const updateSignupField = (field, value) => {
    setSignupForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSignupErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setSignupApiError("");

    if (field === "email") {
      setEmailOtpSent(false);
      setEmailOtpVerified(false);
      setSignupForm((prev) => ({
        ...prev,
        email: value,
        otp: "",
      }));
    }
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateLogin = () => {
    const errors = {};

    if (!loginForm.email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(loginForm.email)) {
      errors.email = "Enter a valid email address.";
    }

    if (!loginForm.password) {
      errors.password = "Password is required.";
    }

    setLoginErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const validateSignup = () => {
    const errors = {};

    if (!signupForm.fullName.trim()) {
      errors.fullName = "Full name is required.";
    } else if (signupForm.fullName.trim().length < 2) {
      errors.fullName = "Enter your full name.";
    }

    if (!signupForm.email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(signupForm.email)) {
      errors.email = "Enter a valid email address.";
    }

    if (!emailOtpVerified) {
      errors.email = "Verify your email before creating an account.";
    }

    if (role === "student") {
      if (!signupForm.university.trim()) {
        errors.university = "University is required.";
      }

      if (!signupForm.graduationYear) {
        errors.graduationYear = "Graduation year is required.";
      } else {
        const year = Number(signupForm.graduationYear);

        if (year < 2020 || year > 2035) {
          errors.graduationYear = "Enter a valid graduation year.";
        }
      }
    }

    if (role === "recruiter") {
      if (!signupForm.company.trim()) {
        errors.company = "Company is required.";
      }

      if (!signupForm.designation.trim()) {
        errors.designation = "Designation is required.";
      }
    }

    if (signupForm.phone) {
      if (!/^[6-9]\d{9}$/.test(signupForm.phone)) {
        errors.phone = "Enter a valid 10-digit Indian mobile number.";
      }
    }

    if (!signupForm.password) {
      errors.password = "Password is required.";
    } else if (signupForm.password.length < 8) {
      errors.password = "Password must contain at least 8 characters.";
    } else if (!/[A-Z]/.test(signupForm.password)) {
      errors.password = "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(signupForm.password)) {
      errors.password = "Password must contain at least one lowercase letter.";
    } else if (!/\d/.test(signupForm.password)) {
      errors.password = "Password must contain at least one number.";
    }

    if (!signupForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (
      signupForm.password !== signupForm.confirmPassword
    ) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setSignupErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginApiError("");

    if (!validateLogin()) {
      return;
    }

    try {
      setLoginLoading(true);

      const data = await loginUser({
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password,
      });

      console.log("Login successful:", data);

      // Store JWT
      localStorage.setItem("placeReadyToken", data.token);

      closeDrawer();

      // Go to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);

      setLoginApiError(
        error?.response?.data?.message ||
          "Unable to log in. Please check your credentials.",
      );
    } finally {
      setLoginLoading(false);
    }
  };

  /* =========================================================
     SEND EMAIL OTP
  ========================================================= */

  const handleSendEmailOtp = async () => {
    setSignupApiError("");

    const errors = {};

    if (!signupForm.email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(signupForm.email)) {
      errors.email = "Enter a valid email address.";
    }

    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors);
      return;
    }

    try {
      setOtpLoading(true);

      await sendOtp(signupForm.email.trim().toLowerCase());

      setEmailOtpSent(true);
      setEmailOtpVerified(false);

      setSignupForm((prev) => ({
        ...prev,
        otp: "",
      }));
    } catch (error) {
      setSignupApiError(
        error?.response?.data?.message ||
          "Unable to send OTP. Please try again.",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  /* =========================================================
     VERIFY EMAIL OTP
  ========================================================= */

  const handleVerifyEmailOtp = async () => {
  setSignupApiError("");

  if (!/^\d{6}$/.test(signupForm.otp)) {
    setSignupErrors((prev) => ({
      ...prev,
      otp: "Enter the 6-digit OTP.",
    }));

    return;
  }

  try {
    setOtpVerifyLoading(true);

    await verifyOtp(
      signupForm.email.trim().toLowerCase(),
      signupForm.otp
    );

    setEmailOtpVerified(true);

    setSignupErrors((prev) => ({
      ...prev,
      otp: "",
      email: "",
    }));
  } catch (error) {
    setEmailOtpVerified(false);

    setSignupErrors((prev) => ({
      ...prev,
      otp:
        error?.response?.data?.message ||
        "Invalid or expired OTP.",
    }));
  } finally {
    setOtpVerifyLoading(false);
  }
};

  /* =========================================================
     SIGNUP
  ========================================================= */

  const handleSignup = async (e) => {
    e.preventDefault();

    setSignupApiError("");

    if (!validateSignup()) {
      return;
    }

    try {
      setSignupLoading(true);

      const payload = {
        fullname: signupForm.fullName.trim(),
        email: signupForm.email.trim().toLowerCase(),
        password: signupForm.password,
        confirm_password: signupForm.confirmPassword,
        phone: signupForm.phone ? `+91${signupForm.phone}` : "",
        role,
        graduationYear:
          role === "student" ? Number(signupForm.graduationYear) : undefined,
      };

      const data = await registerUser(payload);

      /*
        Backend should return something like:

        {
          success: true,
          message: "Account created successfully",
          token: "...",
          user: {...}
        }
      */

      console.log("Signup successful:", data);

      // Example:
      // navigate("/dashboard");

      closeDrawer();
    } catch (error) {
      setSignupApiError(
        error?.response?.data?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-950 overflow-hidden">
      {/* =====================================================
          LANDING PAGE
      ====================================================== */}

      <main className="min-h-screen flex flex-col lg:flex-row">
        {/* LEFT */}
        <section className="flex-1 flex items-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-2xl mx-auto lg:mx-0">
            <div className="flex items-center gap-2.5 mb-16 sm:mb-20">
              <Logo />

              <span className="text-xl font-semibold tracking-tight">
                PlaceReady
              </span>
            </div>

            <p className="text-teal-600 font-medium text-sm sm:text-base mb-5">
              For college students navigating placements
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] xl:text-[56px] leading-[1.08] font-semibold tracking-tight max-w-xl">
              Know exactly where you stand before placement season.
            </h1>

            <p className="mt-7 text-base sm:text-lg leading-7 text-slate-500 max-w-xl">
              Upload your resume, see your skill gaps, and get matched
              to internships and jobs that fit where you are right now
              — not where you want to be.
            </p>

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

        {/* RIGHT */}
        <section className="lg:w-[38%] xl:w-[36%] bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex items-center">
          <div className="w-full max-w-md mx-auto px-6 py-14 sm:px-10 lg:px-12">
            <div className="flex items-center gap-2.5 mb-12">
              <Logo small />

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
              Log in to continue or create an account to start
              assessing your placement readiness.
            </p>

            <div className="mt-10 space-y-3">
              <button
                type="button"
                onClick={() => openDrawer("login")}
                className="w-full h-12 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
              >
                Log in
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                onClick={() => openDrawer("signup")}
                className="w-full h-12 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium hover:bg-slate-100 transition-all"
              >
                Sign up
              </button>
            </div>

            <div className="mt-10 pt-7 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-500">
                Are you ready?
              </p>

              <button
                type="button"
                onClick={() => {
                  setRole("recruiter");
                  openDrawer("login");
                }}
                className="mt-1 text-sm text-teal-600 font-medium hover:text-teal-700"
              >
                Get Started
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* BACKDROP */}

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
        className={`fixed z-50 top-0 right-0 h-full w-full sm:w-110 lg:w-120 bg-white shadow-2xl transform transition-transform duration-300 ${
          drawer === "login"
            ? "translate-x-0"
            : "translate-x-full pointer-events-none"
        }`}
      >
        <div className="h-full overflow-y-auto">
          <div className="min-h-full px-6 py-8 sm:px-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Logo small />

                <span className="text-lg font-semibold">
                  PlaceReady
                </span>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

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
                  className="text-teal-600 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>

            <RoleSwitch
              role={role}
              setRole={setRole}
            />

            <form
              className="mt-8 space-y-6"
              onSubmit={handleLogin}
            >
              <InputField
                label="Email address"
                type="email"
                value={loginForm.email}
                onChange={(e) =>
                  updateLoginField("email", e.target.value)
                }
                placeholder={
                  role === "student"
                    ? "name@university.edu"
                    : "name@company.com"
                }
                error={loginErrors.email}
              />

              <PasswordField
                label="Password"
                value={loginForm.password}
                onChange={(e) =>
                  updateLoginField(
                    "password",
                    e.target.value
                  )
                }
                show={showPassword}
                setShow={setShowPassword}
                error={loginErrors.password}
                placeholder="Enter your password"
              />

              {loginApiError && (
                <ErrorMessage message={loginApiError} />
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full h-12 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
              >
                {loginLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-7 text-xs leading-5 text-slate-400">
              By continuing, you agree to PlaceReady's Terms of
              Service and Privacy Policy.
            </p>
          </div>
        </div>
      </aside>

      {/* =====================================================
          SIGNUP DRAWER
      ====================================================== */}

      <aside
        className={`fixed z-50 top-0 left-0 w-full bg-white shadow-2xl transform transition-transform duration-300 ${
          drawer === "signup"
            ? "translate-y-0"
            : "-translate-y-full pointer-events-none"
        }`}
      >
        <div className="h-screen overflow-y-auto">
          <div className="min-h-full flex flex-col">
            <div className="shrink-0 px-6 py-6 sm:px-10 lg:px-12 border-b border-slate-100">
              <div className="flex items-center justify-between max-w-6xl mx-auto">
                <div className="flex items-center gap-2.5">
                  <Logo small />

                  <span className="text-lg font-semibold">
                    PlaceReady
                  </span>
                </div>

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center px-6 py-8 sm:px-10 lg:px-12">
              <div className="w-full max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                  {/* LEFT */}

                  <div className="lg:pr-8">
                    <p className="text-sm font-medium text-teal-600 mb-3">
                      Get started with PlaceReady
                    </p>

                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                      Create your account
                    </h2>

                    <p className="mt-3 text-slate-500 leading-6 max-w-md">
                      Build your profile, understand your placement
                      readiness, and discover opportunities that match
                      your current skills.
                    </p>

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
                          onClick={() => {
                            setRole("student");
                            setSignupErrors({});
                          }}
                        />

                        <RoleCard
                          active={role === "recruiter"}
                          icon={<BriefcaseBusiness size={22} />}
                          title="Recruiter"
                          description="Post roles and discover candidates that match."
                          onClick={() => {
                            setRole("recruiter");
                            setSignupErrors({});
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}

                  <div>
                    <form onSubmit={handleSignup}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputField
                          label="Full name"
                          value={signupForm.fullName}
                          onChange={(e) =>
                            updateSignupField(
                              "fullName",
                              e.target.value
                            )
                          }
                          placeholder="Your Name"
                          error={signupErrors.fullName}
                        />

                        {/* EMAIL */}

                        <div className="sm:col-span-2">
                          <label className="text-sm font-medium text-slate-900">
                            {role === "student"
                              ? "University email"
                              : "Work email"}
                          </label>

                          <div className="mt-2 flex gap-3">
                            <input
                              type="email"
                              value={signupForm.email}
                              onChange={(e) =>
                                updateSignupField(
                                  "email",
                                  e.target.value
                                )
                              }
                              disabled={emailOtpVerified}
                              placeholder={
                                role === "student"
                                  ? "name@university.edu"
                                  : "name@company.com"
                              }
                              className="flex-1 min-w-0 h-12 rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 disabled:bg-slate-100"
                            />

                            <button
                              type="button"
                              onClick={handleSendEmailOtp}
                              disabled={
                                otpLoading ||
                                emailOtpVerified
                              }
                              className="h-12 px-5 rounded-lg border border-teal-600 text-teal-600 font-medium hover:bg-teal-50 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-50 whitespace-nowrap"
                            >
                              {otpLoading
                                ? "Sending..."
                                : emailOtpVerified
                                ? "Verified"
                                : emailOtpSent
                                ? "Resend OTP"
                                : "Send OTP"}
                            </button>
                          </div>

                          {signupErrors.email && (
                            <FieldError
                              message={signupErrors.email}
                            />
                          )}
                        </div>

                        {/* OTP */}

                        {emailOtpSent &&
                          !emailOtpVerified && (
                            <div className="sm:col-span-2">
                              <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">
                                      Verify your email
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                      Enter the 6-digit OTP sent
                                      to{" "}
                                      <span className="font-medium text-slate-700">
                                        {signupForm.email}
                                      </span>
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEmailOtpSent(false);
                                      setEmailOtpVerified(false);
                                      updateSignupField(
                                        "otp",
                                        ""
                                      );
                                    }}
                                    className="text-xs text-slate-500"
                                  >
                                    Change email
                                  </button>
                                </div>

                                <div className="mt-4 flex gap-3">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={signupForm.otp}
                                    onChange={(e) => {
                                      const value =
                                        e.target.value.replace(
                                          /\D/g,
                                          ""
                                        );

                                      updateSignupField(
                                        "otp",
                                        value
                                      );
                                    }}
                                    placeholder="000000"
                                    className="flex-1 min-w-0 h-12 rounded-lg border border-slate-300 bg-white px-4 text-sm tracking-[0.3em] outline-none focus:border-teal-600"
                                  />

                                  <button
                                    type="button"
                                    onClick={
                                      handleVerifyEmailOtp
                                    }
                                    disabled={
                                      otpVerifyLoading
                                    }
                                    className="h-12 px-6 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:bg-slate-300"
                                  >
                                    {otpVerifyLoading
                                      ? "Checking..."
                                      : "Verify"}
                                  </button>
                                </div>

                                {signupErrors.otp && (
                                  <FieldError
                                    message={
                                      signupErrors.otp
                                    }
                                  />
                                )}

                                <div className="mt-3 flex items-center justify-between">
                                  <p className="text-xs text-slate-400">
                                    Didn't receive the code?
                                  </p>

                                  <button
                                    type="button"
                                    onClick={
                                      handleSendEmailOtp
                                    }
                                    disabled={otpLoading}
                                    className="text-xs text-teal-600 font-medium"
                                  >
                                    Resend OTP
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* VERIFIED */}

                        {emailOtpVerified && (
                          <div className="sm:col-span-2">
                            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <Check
                                  size={13}
                                  className="text-white"
                                  strokeWidth={3}
                                />
                              </div>

                              <p className="text-sm font-medium text-emerald-700">
                                Email verified successfully
                              </p>
                            </div>
                          </div>
                        )}

                        {/* ROLE FIELDS */}

                        {role === "student" ? (
                          <>
                            <InputField
                              label="University"
                              value={signupForm.university}
                              onChange={(e) =>
                                updateSignupField(
                                  "university",
                                  e.target.value
                                )
                              }
                              placeholder="University name"
                              error={
                                signupErrors.university
                              }
                            />

                            <InputField
                              label="Graduation year"
                              type="number"
                              value={
                                signupForm.graduationYear
                              }
                              onChange={(e) =>
                                updateSignupField(
                                  "graduationYear",
                                  e.target.value
                                )
                              }
                              placeholder="2027"
                              error={
                                signupErrors.graduationYear
                              }
                            />
                          </>
                        ) : (
                          <>
                            <InputField
                              label="Company"
                              value={signupForm.company}
                              onChange={(e) =>
                                updateSignupField(
                                  "company",
                                  e.target.value
                                )
                              }
                              placeholder="Company name"
                              error={signupErrors.company}
                            />

                            <InputField
                              label="Designation"
                              value={signupForm.designation}
                              onChange={(e) =>
                                updateSignupField(
                                  "designation",
                                  e.target.value
                                )
                              }
                              placeholder="Recruiter"
                              error={
                                signupErrors.designation
                              }
                            />
                          </>
                        )}

                        {/* PHONE */}

                        <div className="sm:col-span-2">
                          <label className="text-sm font-medium text-slate-900">
                            Phone number
                          </label>

                          <div className="mt-2 flex gap-3">
                            <div className="w-19 h-12 rounded-lg border border-slate-300 bg-slate-50 flex items-center justify-center text-sm text-slate-600 shrink-0">
                              +91
                            </div>

                            <input
                              type="tel"
                              inputMode="numeric"
                              maxLength={10}
                              value={signupForm.phone}
                              onChange={(e) =>
                                updateSignupField(
                                  "phone",
                                  e.target.value.replace(
                                    /\D/g,
                                    ""
                                  )
                                )
                              }
                              placeholder="0000000000"
                              className="flex-1 min-w-0 h-12 rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-teal-600"
                            />
                          </div>

                          {signupErrors.phone ? (
                            <FieldError
                              message={signupErrors.phone}
                            />
                          ) : (
                            <p className="mt-1.5 text-[11px] text-slate-400">
                              Optional — used for important
                              account and placement updates.
                            </p>
                          )}
                        </div>

                        {/* PASSWORD */}

                        <PasswordField
                          label="Password"
                          value={signupForm.password}
                          onChange={(e) =>
                            updateSignupField(
                              "password",
                              e.target.value
                            )
                          }
                          show={showPassword}
                          setShow={setShowPassword}
                          error={signupErrors.password}
                          placeholder="Create a password"
                        />

                        {/* CONFIRM */}

                        <PasswordField
                          label="Confirm password"
                          value={
                            signupForm.confirmPassword
                          }
                          onChange={(e) =>
                            updateSignupField(
                              "confirmPassword",
                              e.target.value
                            )
                          }
                          show={showConfirmPassword}
                          setShow={setShowConfirmPassword}
                          error={
                            signupErrors.confirmPassword
                          }
                          placeholder="Confirm your password"
                        />
                      </div>

                      {signupApiError && (
                        <div className="mt-5">
                          <ErrorMessage
                            message={signupApiError}
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={
                          signupLoading ||
                          !emailOtpVerified
                        }
                        className="mt-6 w-full h-12 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        {signupLoading
                          ? "Creating account..."
                          : emailOtpVerified
                          ? "Create account"
                          : "Verify email to continue"}
                      </button>

                      <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                        By creating an account, you agree to
                        PlaceReady's Terms of Service and Privacy
                        Policy.
                      </p>

                      <p className="mt-5 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => openDrawer("login")}
                          className="text-teal-600 font-medium"
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
   SMALL COMPONENTS
========================================================= */

function Logo({ small = false }) {
  return (
    <div
      className={`${
        small ? "w-8 h-8" : "w-9 h-9"
      } rounded-lg bg-teal-600 flex items-center justify-center`}
    >
      <TrendingUp
        size={small ? 17 : 20}
        strokeWidth={2.5}
        className="text-white"
      />
    </div>
  );
}

function Feature({ title, description }) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 w-6 h-6 shrink-0 rounded-full border border-teal-200 bg-teal-50 flex items-center justify-center">
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

        <p className="mt-1 text-sm sm:text-base text-slate-500 leading-6">
          {description}
        </p>
      </div>
    </div>
  );
}

function RoleSwitch({ role, setRole }) {
  return (
    <div className="mt-8 grid grid-cols-2 h-11 p-1 rounded-lg bg-slate-100">
      {["student", "recruiter"].map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setRole(item)}
          className={`rounded-md text-sm font-medium transition-all ${
            role === item
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {item === "student" ? "Student" : "Recruiter"}
        </button>
      ))}
    </div>
  );
}

function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-900">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`mt-2 w-full h-12 rounded-lg border px-4 text-sm outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition ${
          error
            ? "border-red-400"
            : "border-slate-300"
        }`}
      />

      {error && <FieldError message={error} />}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  setShow,
  error,
  placeholder,
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-900">
        {label}
      </label>

      <div className="relative mt-2">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-12 rounded-lg border px-4 pr-12 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 ${
            error
              ? "border-red-400"
              : "border-slate-300"
          }`}
        />

        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
        >
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>

      {error && <FieldError message={error} />}
    </div>
  );
}

function FieldError({ message }) {
  return (
    <p className="mt-1.5 text-xs text-red-500">
      {message}
    </p>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      {message}
    </div>
  );
}

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
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        active
          ? "border-teal-600 bg-teal-50/60 ring-1 ring-teal-600"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
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