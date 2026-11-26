
import {
  BriefcaseBusiness,
  GraduationCap,
  LayoutDashboard,
  Target,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "My Profile", path: "/profile", icon: UserRound },
  { label: "Job Matches", path: "/jobs", icon: BriefcaseBusiness },
  { label: "Skill Gaps", path: "/skill-gaps", icon: Target },
  { label: "Learn & Practice", path: "/learn-and-practice", icon: GraduationCap },
  { label: "Market & Roadmap", path: "/market", icon: TrendingUp },
];

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
  readiness,
}) {
  const rawScore = readiness?.score;

  const hasReadiness =
    typeof rawScore === "number" && Number.isFinite(rawScore);

  const score = hasReadiness
    ? Math.min(100, Math.max(0, rawScore))
    : null;

  const change =
    typeof readiness?.change === "number" &&
    Number.isFinite(readiness.change)
      ? readiness.change
      : null;

  const status =
    typeof readiness?.status === "string" && readiness.status.trim()
      ? readiness.status
      : null;

  const changeLabel =
    change === null
      ? null
      : `${change > 0 ? "+" : ""}${change}`;

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
          fixed inset-y-0 left-0 z-50 flex w-62.5 flex-col
          border-r border-slate-200 bg-white
          transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex h-18 shrink-0 items-center justify-between border-b border-slate-200 px-6">
          <NavLink
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
              <TrendingUp size={19} strokeWidth={2.5} />
            </div>

            <span className="text-[17px] font-semibold tracking-tight text-slate-900">
              PlaceReady
            </span>
          </NavLink>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
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

        {/* Actual Readiness Data */}
        <div className="shrink-0 border-t border-slate-200 p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">
              Readiness score
            </span>

            {status && (
              <span className="text-[10px] font-medium text-slate-500">
                {status}
              </span>
            )}
          </div>

          {hasReadiness ? (
            <>
              <div className="mb-2 flex items-end justify-between">
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-semibold text-slate-900">
                    {score}
                  </span>
                  <span className="mb-1 text-xs text-slate-400">
                    /100
                  </span>
                </div>

                {changeLabel !== null && (
                  <span
                    className={`mb-1 text-[11px] font-semibold ${
                      change > 0
                        ? "text-teal-600"
                        : change < 0
                          ? "text-red-500"
                          : "text-slate-400"
                    }`}
                  >
                    {changeLabel}
                  </span>
                )}
              </div>

              <div
                className="h-1.5 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Readiness score"
              >
                <div
                  className="h-full rounded-full bg-teal-600 transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>

              <p className="mt-2 text-[11px] leading-4 text-slate-400">
                {readiness?.description ||
                  "Based on your latest readiness assessment."}
              </p>
            </>
          ) : (
            <>
              <div className="mb-2 flex items-end gap-1">
                <span className="text-2xl font-semibold text-slate-400">
                  —
                </span>
                <span className="mb-1 text-xs text-slate-300">
                  /100
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" />

              <p className="mt-2 text-[11px] leading-4 text-slate-400">
                Readiness data is not available yet.
              </p>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
