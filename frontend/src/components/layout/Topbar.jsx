// src/components/layout/Topbar.jsx

import {
  Activity,
  Menu,
  Search,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Topbar({
  user,
  pageTitle,
  pageLabel = "Student workspace",
  setMobileOpen,
  showSearch = false,
}) {
  const navigate = useNavigate();

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";

  const handleSignOut = () => {
    localStorage.removeItem("placeReadyToken");

    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        {/* Search */}
        {showSearch ? (
          <div className="relative hidden sm:block">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search jobs, skills..."
              className="
                h-9 w-55 rounded-lg border border-slate-200
                bg-slate-50 pl-9 pr-3 text-xs text-slate-800
                outline-none transition
                placeholder:text-slate-400
                focus:border-teal-500 focus:bg-white
                focus:ring-2 focus:ring-teal-500/10
              "
            />
          </div>
        ) : (
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-500">
              {pageLabel}
            </p>

            <p className="truncate text-sm font-semibold text-slate-900">
              {pageTitle}
            </p>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-50"
          aria-label="Activity"
        >
          <Activity size={19} />

          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
        </button>

        <div className="hidden h-6 w-px bg-slate-200 sm:block" />

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
            {initials}
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-30 truncate text-xs font-semibold text-slate-800">
              {user?.name || "Student"}
            </p>

            <p className="text-[10px] capitalize text-slate-400">
              {user?.role || "student"}
            </p>
          </div>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={handleSignOut}
          className="
            flex items-center gap-1.5
            rounded-lg px-2.5 py-2
            text-xs font-medium text-slate-500
            transition
            hover:bg-red-50 hover:text-red-600
          "
        >
          <LogOut size={15} />

          <span className="hidden sm:inline">
            Sign out
          </span>
        </button>
      </div>
    </header>
  );
}