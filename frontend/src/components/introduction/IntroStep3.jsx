const roles = [
  "Software Development Engineer",
  "Data Analyst",
  "Data Scientist",
  "Product Manager",
  "ML Engineer",
  "DevOps / SRE",
  "Business Analyst",
  "UI/UX Designer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Engineer",
];

const workOptions = [
  "Remote",
  "Hybrid",
  "On-site",
];

export default function IntroStep3({
  data,
  updateProfile,
  onBack,
  onComplete,
  saving,
  saveError,
}) {
  const toggleRole = (role) => {
    const exists = data.targetRoles.includes(role);

    updateProfile({
      targetRoles: exists
        ? data.targetRoles.filter(
            (item) => item !== role
          )
        : [...data.targetRoles, role],
    });
  };

  const toggleWorkPreference = (option) => {
    const exists = data.workPreference.includes(option);

    updateProfile({
      workPreference: exists
        ? data.workPreference.filter(
            (item) => item !== option
          )
        : [...data.workPreference, option],
    });
  };

  const hasGoal =
    data.targetRoles.length > 0 ||
    data.customGoal.trim().length > 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          What kind of roles are you targeting?
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          This helps us tune your readiness score and match you
          to the right jobs.
        </p>
      </div>

      {/* Roles */}
      <div className="mt-7">
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => {
            const selected =
              data.targetRoles.includes(role);

            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                disabled={saving}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  selected
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {role}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom role */}
      <div className="mt-7">
        <label className="text-xs font-medium text-slate-700">
          Don't see your role?
        </label>

        <input
          type="text"
          value={data.customGoal}
          onChange={(e) =>
            updateProfile({
              customGoal: e.target.value,
            })
          }
          disabled={saving}
          placeholder="Enter another target role..."
          className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </div>

      {/* Employment type */}
      <div className="mt-7">
        <p className="text-xs font-medium text-slate-700">
          What are you looking for?
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {[
            ["internship", "Internship"],
            ["full-time", "Full-time"],
            ["both", "Both"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                updateProfile({
                  employmentType: value,
                })
              }
              disabled={saving}
              className={`rounded-lg border px-4 py-2 text-xs font-medium transition ${
                data.employmentType === value
                  ? "border-teal-600 bg-teal-50 text-teal-700"
                  : "border-slate-200 text-slate-600 hover:border-teal-300"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Work preference */}
      <div className="mt-7">
        <p className="text-xs font-medium text-slate-700">
          Preferred work setup
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {workOptions.map((option) => {
            const selected =
              data.workPreference.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() =>
                  toggleWorkPreference(option)
                }
                disabled={saving}
                className={`rounded-lg border px-4 py-2 text-xs font-medium transition ${
                  selected
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-slate-200 text-slate-600 hover:border-teal-300"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save error */}
      {saveError && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {saveError}
        </div>
      )}

      {/* Actions */}
      <div className="mt-9 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="h-10 rounded-lg bg-slate-100 px-5 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Back
        </button>

        <button
          type="button"
          onClick={onComplete}
          disabled={!hasGoal || saving}
          className="h-10 rounded-lg bg-teal-600 px-6 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {saving ? "Saving..." : "Complete profile"}
        </button>
      </div>
    </section>
  );
}