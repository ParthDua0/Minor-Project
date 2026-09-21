// src/components/layout/AppLayout.jsx

import { useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({
  children,
  user,
  readiness,
  pageTitle,
  pageLabel = "Student workspace",
  showSearch = false,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        readiness={readiness}
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
        <div className="min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}