import { useEffect, useState } from "react";
import {Activity, ArrowRight, BriefcaseBusiness, CheckCircle2, ChevronRight, CircleUserRound, FileText, GraduationCap, LayoutDashboard, MapPin, Menu, Search, Settings, Sparkles, Target, TrendingUp, UserRound, X, Zap } from "lucide-react";
import { NavLink } from "react-router-dom";
import { getDashboardData } from "../api/apiDashboard";

/* NAVIGATION */

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Profile",
    path: "/profile",
    icon: UserRound,
  },
  {
    label: "Job Matches",
    path: "/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Skill Gaps",
    path: "/skill-gaps",
    icon: Target,
  },
  {
    label: "Learn & Practice",
    path: "/learn",
    icon: GraduationCap,
  },
  {
    label: "Market & Roadmap",
    path: "/market",
    icon: TrendingUp,
  },
];

/* SIDEBAR */

function Sidebar({ dashboard, mobileOpen, setMobileOpen }) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-62.5 flex-col
          border-r border-slate-200 bg-white
          transition-transform duration-300
          lg:static lg:z-auto lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-18 items-center justify-between border-b border-slate-200 px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
              <TrendingUp size={19} strokeWidth={2.5} />
            </div>

            <span className="text-[17px] font-semibold tracking-tight text-slate-900">
              PlaceReady
            </span>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3 rounded-lg px-3 py-2.5
                    text-[13px] font-medium transition
                    ${
                      isActive
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                    `
                  }
                >
                  <Icon size={17} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Readiness */}
        <div className="border-t border-slate-200 p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">
              Readiness score
            </span>

            <span className="text-[11px] font-semibold text-teal-600">
              +{dashboard.readiness.change}
            </span>
          </div>

          <div className="mb-2 flex items-end gap-1">
            <span className="text-2xl font-semibold text-slate-900">
              {dashboard.readiness.score}
            </span>

            <span className="mb-1 text-xs text-slate-400">/100</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-teal-600"
              style={{
                width: `${dashboard.readiness.score}%`,
              }}
            />
          </div>

          <p className="mt-2 text-[11px] leading-4 text-slate-400">
            Keep improving your skill gaps.
          </p>
        </div>
      </aside>
    </>
  );
}

/* TOPBAR */

function Topbar({ dashboard, setMobileOpen }) {
  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={21} />
        </button>

        <div className="relative hidden sm:block">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search jobs, skills..."
            className="h-9 w-55 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-teal-500 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50">
          <Activity size={19} />

          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
        </button>

        <div className="hidden h-6 w-px bg-slate-200 sm:block" />

        <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
            PD
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold text-slate-800">
              {dashboard.user.name}
            </p>

            <p className="text-[10px] text-slate-400">
              {dashboard.user.role}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}

/* READINESS CARD */

function ReadinessCard({ readiness }) {
  const circumference = 301.6;

  const progressOffset =
    circumference - (readiness.score / 100) * circumference;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Your readiness score
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            Based on your current profile
          </p>
        </div>

        <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
          <Settings size={16} />
        </button>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg
            viewBox="0 0 120 120"
            className="h-full w-full -rotate-90"
          >
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="10"
            />

            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="#0d9488"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-slate-900">
              {readiness.score}
            </span>

            <span className="text-[9px] text-slate-400">
              out of 100
            </span>
          </div>
        </div>

        <div>
          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-600">
            {readiness.status}
          </span>

          <div className="mt-3 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-teal-600" />

            <span className="text-xs font-semibold text-teal-600">
              +{readiness.change} points
            </span>
          </div>

          <p className="mt-1 text-[11px] leading-4 text-slate-400">
            compared with last month
          </p>
        </div>
      </div>

      <button className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2.5 text-xs font-medium text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700">
        Improve readiness
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

/* STAT CARD */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  accent,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}
        >
          <Icon size={17} />
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-4 text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* SKILL GAP CARD */

function SkillGapCard({ skillGaps }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Your biggest skill gaps
          </h2>

          <p className="mt-1 text-[11px] text-slate-400">
            Skills companies are asking for that you haven't fully built yet.
          </p>
        </div>

        <NavLink
          to="/skill-gaps"
          className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700"
        >
          See all
          <ArrowRight size={13} />
        </NavLink>
      </div>

      <div className="mt-6 space-y-5">
        {skillGaps.map((skill) => {
          const gap = skill.required - skill.current;

          return (
            <div key={skill.name}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-slate-700">
                  {skill.name}
                </span>

                <span className="text-[10px] text-slate-400">
                  You:{" "}
                  <span className="font-semibold text-slate-600">
                    {skill.current}%
                  </span>
                  {" · "}
                  Needed:{" "}
                  <span className="font-semibold text-slate-600">
                    {skill.required}%
                  </span>
                </span>
              </div>

              <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-teal-500"
                  style={{ width: `${skill.current}%` }}
                />

                <div
                  className="absolute top-0 h-full w-px bg-slate-500"
                  style={{ left: `${skill.required}%` }}
                />
              </div>

              <div className="mt-1.5 flex justify-between">
                <span className="text-[9px] text-slate-400">
                  {gap}% gap remaining
                </span>

                {gap >= 40 && (
                  <span className="text-[9px] font-medium text-orange-500">
                    High priority
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* JOB MATCHES */

function JobMatchesCard({ matchedJobs }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Best job matches
          </h2>

          <p className="mt-1 text-[11px] text-slate-400">
            Based on the skills you've listed so far.
          </p>
        </div>

        <NavLink
          to="/jobs"
          className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700"
        >
          View all
          <ArrowRight size={13} />
        </NavLink>
      </div>

      <div className="mt-5 divide-y divide-slate-100">
        {matchedJobs.map((job) => (
          <div
            key={`${job.companyName}-${job.role}`}
            className="group flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
              {job.company}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">
                {job.role}
              </p>

              <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                <span>{job.companyName}</span>
                <span>·</span>
                <MapPin size={10} />
                <span>{job.location}</span>
              </div>
            </div>

            <div className="text-right">
              <p
                className={`text-sm font-semibold ${
                  job.match >= 80
                    ? "text-teal-600"
                    : job.match >= 75
                    ? "text-amber-500"
                    : "text-orange-500"
                }`}
              >
                {job.match}%
              </p>

              <p className="text-[9px] text-slate-400">
                match
              </p>
            </div>

            <ChevronRight
              size={15}
              className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* NEXT STEP */

function NextStepCard({ nextStep }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-slate-900 p-5 text-white sm:p-6">
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles size={15} className="text-teal-400" />

            <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-400">
              Recommended next step
            </span>
          </div>

          <h2 className="text-sm font-semibold">
            {nextStep.title}
          </h2>

          <p className="mt-1 max-w-xl text-[11px] leading-5 text-slate-400">
            {nextStep.description}
          </p>
        </div>

        <button className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-100">
          {nextStep.action}
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

/* LOADING STATE */

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-64 rounded-lg bg-slate-200" />

      <div className="h-4 w-96 max-w-full rounded bg-slate-200" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(270px,0.8fr)_minmax(0,2fr)]">
        <div className="h-70 rounded-2xl bg-slate-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-33 rounded-2xl bg-slate-200" />
          <div className="h-33 rounded-2xl bg-slate-200" />
          <div className="h-33 rounded-2xl bg-slate-200" />
          <div className="h-33 rounded-2xl bg-slate-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="h-87.5 rounded-2xl bg-slate-200" />
        <div className="h-87.5 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

/* ERROR STATE */

function DashboardError({ onRetry }) {
  return (
    <div className="flex min-h-125 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <Activity size={20} />
        </div>

        <h2 className="mt-4 text-sm font-semibold text-slate-900">
          Couldn't load your dashboard
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Something went wrong while fetching your dashboard data.
        </p>

        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

/* DASHBOARD */

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getDashboardData();

      setDashboard(data);
    } catch (err) {
      console.error("Dashboard loading failed:", err);
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* INITIAL LOADING                                                          */
  /* ------------------------------------------------------------------------ */

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen">
          <div className="hidden w-62.5 border-r border-slate-200 bg-white lg:block" />

          <div className="min-w-0 flex-1">
            <header className="h-18 border-b border-slate-200 bg-white" />

            <main className="mx-auto w-full max-w-375 px-4 py-8 sm:px-6 lg:px-8">
              <DashboardSkeleton />
            </main>
          </div>
        </div>
      </div>
    );
  }

  /* ERROR */

  if (error && !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <DashboardError onRetry={loadDashboard} />
      </div>
    );
  }

  /* DASHBOARD */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar
          dashboard={dashboard}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div className="min-w-0 flex-1">
          <Topbar
            dashboard={dashboard}
            setMobileOpen={setMobileOpen}
          />

          <main className="mx-auto w-full max-w-375 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

            {/* Page heading */}
            <div className="mb-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-500" />

                    <span className="text-[11px] font-medium text-slate-400">
                      Student dashboard
                    </span>
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                    Good morning, {dashboard.user.name}
                  </h1>

                  <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                    Placement season opens in about 8 weeks. Here's where
                    things stand.
                  </p>
                </div>

                <button className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                  <FileText size={15} />
                  View my profile
                </button>
              </div>
            </div>

            {/* Readiness + Stats */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(270px,0.8fr)_minmax(0,2fr)]">
              <ReadinessCard
                readiness={dashboard.readiness}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                  icon={CircleUserRound}
                  label="Profile completed"
                  value={`${dashboard.stats.profileCompletion}%`}
                  description="Add work experience to push past 80%"
                  accent="bg-blue-50 text-blue-600"
                />

                <StatCard
                  icon={BriefcaseBusiness}
                  label="Jobs that match you"
                  value={dashboard.stats.matchedJobs}
                  description="Updated 2 hours ago"
                  accent="bg-teal-50 text-teal-600"
                />

                <StatCard
                  icon={CheckCircle2}
                  label="Skills verified"
                  value={`${dashboard.stats.verifiedSkills} / ${dashboard.stats.totalSkills}`}
                  description={`${dashboard.stats.totalSkills - dashboard.stats.verifiedSkills} in-demand skills still missing`}
                  accent="bg-violet-50 text-violet-600"
                />

                <StatCard
                  icon={Zap}
                  label="Active applications"
                  value={dashboard.stats.activeApplications}
                  description="Your current active applications"
                  accent="bg-amber-50 text-amber-600"
                />
              </div>
            </div>

            {/* Skill Gaps + Jobs */}
            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <SkillGapCard
                skillGaps={dashboard.skillGaps}
              />

              <JobMatchesCard
                matchedJobs={dashboard.matchedJobs}
              />
            </div>

            {/* Recommended next step */}
            <div className="mt-4">
              <NextStepCard
                nextStep={dashboard.nextStep}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}