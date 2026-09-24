export default function IntroStep1({
  data,
  updateProfile,
  onContinue,
}) {
  const handleContinue = () => {
    if (
      !data.branch ||
      !data.graduationYear ||
      !data.cgpa ||
      !data.currentYear
    ) {
      return;
    }

    onContinue();
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">
          A few more details
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          We already have your name and college from sign-up.
          Just fill in the rest — takes under a minute.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        {/* Branch */}
        <div>
          <label className="text-xs font-medium text-slate-700">
            Branch / Major
          </label>

          <input
            type="text"
            value={data.branch}
            onChange={(e) =>
              updateProfile({
                branch: e.target.value,
              })
            }
            placeholder="Computer Science & Engineering"
            className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
          />
        </div>

        {/* Graduation + CGPA */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-slate-700">
              Graduation year
            </label>

            <select
              value={data.graduationYear}
              onChange={(e) =>
                updateProfile({
                  graduationYear: e.target.value,
                })
              }
              className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600"
            >
              <option value="">Select year</option>
              {Array.from(
                { length: 10 },
                (_, index) => 2025 + index
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              CGPA / GPA
            </label>

            <input
              type="number"
              min="0"
              max="10"
              step="0.01"
              value={data.cgpa}
              onChange={(e) =>
                updateProfile({
                  cgpa: e.target.value,
                })
              }
              placeholder="8.4 / 10"
              className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
            />
          </div>
        </div>

        {/* Current year */}
        <div className="max-w-[50%]">
          <label className="text-xs font-medium text-slate-700">
            Current year of study
          </label>

          <select
            value={data.currentYear}
            onChange={(e) =>
              updateProfile({
                currentYear: e.target.value,
              })
            }
            className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600"
          >
            <option value="">Select</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          disabled={
            !data.branch ||
            !data.graduationYear ||
            !data.cgpa ||
            !data.currentYear
          }
          className="h-10 rounded-lg bg-teal-600 px-6 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          Continue
        </button>
      </div>
    </section>
  );
}