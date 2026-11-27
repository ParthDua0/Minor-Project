import { useEffect, useState } from "react";
import { getDashboardData } from "../../api/apiDashboard";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const READINESS_CACHE_KEY = "placeready_readiness";

export default function AppLayout({
  children,
  user,
  readiness,
  pageTitle,
  pageLabel = "Student workspace",
  showSearch = false,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [cachedReadiness, setCachedReadiness] = useState(() => {
    try {
      const saved = sessionStorage.getItem(READINESS_CACHE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (readiness) {
      setCachedReadiness(readiness);
      try {
        sessionStorage.setItem(READINESS_CACHE_KEY, JSON.stringify(readiness));
      } catch {
        // ignore storage errors
      }
      return;
    }

    // If the user opened a non-dashboard page directly before visiting /dashboard
    if (!cachedReadiness) {
      let active = true;
      getDashboardData()
        .then((data) => {
          if (active && data?.readiness) {
            setCachedReadiness(data.readiness);
            try {
              sessionStorage.setItem(
                READINESS_CACHE_KEY,
                JSON.stringify(data.readiness)
              );
            } catch {
              // ignore storage errors
            }
          }
        })
        .catch(() => {
          // ignore if unavailable
        });

      return () => {
        active = false;
      };
    }
  }, [readiness, cachedReadiness]);

  const effectiveReadiness = readiness ?? cachedReadiness;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        readiness={effectiveReadiness}
      />

      {/* Main area */}
      <div className="min-h-screen w-full min-w-0 lg:pl-62.5">
        {/* Topbar */}
        <Topbar
          user={user}
          pageTitle={pageTitle}
          pageLabel={pageLabel}
          setMobileOpen={setMobileOpen}
          showSearch={showSearch}
        />

        {/* Page */}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}