// src/pages/LearnAndPractice.jsx

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  ExternalLink,
  Flame,
  LockKeyhole,
  Play,
  Target,
  Trophy,
  Zap,
  Circle,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import { getLearnAndPracticeData } from "../api/apiLearnAndPractice";

/* -------------------------------------------------------------------------- */
/* STAT CARD                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon: Icon,
  value,
  label,
  description,
  accent,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-slate-700">
            {label}
          </p>

          <p className="mt-1 text-[10px] leading-4 text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}
        >
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TRACK COLOR                                                                */
/* -------------------------------------------------------------------------- */

function getTrackColor(color) {
  const colors = {
    indigo: {
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      bar: "bg-indigo-500",
      active: "border-indigo-200",
    },

    teal: {
      text: "text-teal-600",
      bg: "bg-teal-50",
      bar: "bg-teal-500",
      active: "border-teal-200",
    },

    orange: {
      text: "text-orange-600",
      bg: "bg-orange-50",
      bar: "bg-orange-500",
      active: "border-orange-200",
    },

    pink: {
      text: "text-pink-600",
      bg: "bg-pink-50",
      bar: "bg-pink-500",
      active: "border-pink-200",
    },
  };

  return colors[color] || colors.teal;
}

/* -------------------------------------------------------------------------- */
/* LEARNING TRACK LIST                                                        */
/* -------------------------------------------------------------------------- */

function LearningTrackList({
  tracks,
  selectedTrackId,
  onSelect,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Your tracks
        </p>
      </div>

      <div className="space-y-1">
        {tracks.map((track) => {
          const colors = getTrackColor(track.color);
          const isSelected =
            track.id === selectedTrackId;

          return (
            <button
              key={track.id}
              type="button"
              onClick={() => onSelect(track.id)}
              className={`
                group w-full rounded-lg border p-3 text-left
                transition
                ${
                  isSelected
                    ? "border-slate-200 bg-slate-50 shadow-sm"
                    : "border-transparent hover:bg-slate-50"
                }
              `}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`
                    min-w-0 truncate text-xs font-medium
                    ${
                      isSelected
                        ? "text-slate-900"
                        : "text-slate-700"
                    }
                  `}
                >
                  {track.name}
                </span>

                <span className="shrink-0 text-[10px] font-medium text-slate-400">
                  {track.progress}%
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${colors.bar}`}
                  style={{
                    width: `${track.progress}%`,
                  }}
                />
              </div>

              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[9px] text-slate-400">
                  {track.completed} of {track.total} completed
                </span>

                {track.status === "nearly-complete" && (
                  <span className="text-[9px] font-medium text-pink-500">
                    Almost done
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TOPIC STATUS ICON                                                          */
/* -------------------------------------------------------------------------- */

function TopicStatusIcon({ status }) {
  if (status === "completed") {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
        <Check size={13} strokeWidth={2.5} />
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <LockKeyhole size={12} />
      </div>
    );
  }

  if (status === "not-started") {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 ring-1 ring-slate-200">
        <Circle size={8} />
      </div>
    );
  }

  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TOPIC LIST                                                                 */
/* -------------------------------------------------------------------------- */

function TopicList({ topics }) {
  return (
    <div className="mt-5 space-y-2">
      {topics.map((topic) => {
        const locked = topic.status === "locked";
        const completed =
          topic.status === "completed";

        return (
          <div
            key={topic.id}
            className={`
              rounded-lg border px-3.5 py-3
              ${
                locked
                  ? "border-slate-100 bg-slate-50/50"
                  : "border-slate-100 bg-slate-50/70"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <TopicStatusIcon
                status={topic.status}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`
                      truncate text-xs font-medium
                      ${
                        locked
                          ? "text-slate-400"
                          : "text-slate-700"
                      }
                    `}
                  >
                    {topic.name}
                  </span>

                  <span className="shrink-0 text-[10px] text-slate-400">
                    {topic.completed}/{topic.total}
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`
                      h-full rounded-full transition-all
                      ${
                        completed
                          ? "bg-indigo-500"
                          : locked
                          ? "bg-slate-200"
                          : "bg-indigo-500"
                      }
                    `}
                    style={{
                      width: `${topic.progress}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ACTIVE TRACK CARD                                                          */
/* -------------------------------------------------------------------------- */

function ActiveTrackCard({
  track,
  nextStep,
}) {
  const colors = getTrackColor(track.color);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}
            >
              <Code2 size={16} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-slate-900">
                {track.name}
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-400">
                {track.completed} problems done ·{" "}
                {track.total - track.completed} left to go
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="
            flex shrink-0 items-center justify-center gap-1.5
            rounded-lg bg-indigo-500 px-4 py-2
            text-[11px] font-semibold text-white
            transition hover:bg-indigo-600
          "
        >
          <Play size={12} fill="currentColor" />
          {nextStep?.action || "Continue"}
        </button>
      </div>

      {/* Overall progress */}
      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            Overall progress
          </span>

          <span className="text-[10px] font-medium text-slate-500">
            {track.progress}%
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${colors.bar}`}
            style={{
              width: `${track.progress}%`,
            }}
          />
        </div>
      </div>

      {/* Topics */}
      <TopicList topics={track.topics} />

      {/* Recommendation */}
      {nextStep && (
        <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3.5">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-indigo-500 shadow-sm">
              <Zap size={14} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500">
                Recommended next
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-800">
                {nextStep.title}
              </p>

              <p className="mt-1 text-[10px] leading-4 text-slate-500">
                {nextStep.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* PRACTICE PROBLEMS                                                          */
/* -------------------------------------------------------------------------- */

function PracticeProblems({ problems }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Practice Problems
        </h2>

        <p className="mt-1 text-[11px] text-slate-400">
          Sharpen your problem-solving skills with targeted practice.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {problems.map((problem) => (
          <div
            key={problem.id}
            className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center"
          >
            <div
              className={`
                flex h-8 w-8 shrink-0 items-center justify-center
                rounded-lg
                ${
                  problem.completed
                    ? "bg-teal-50 text-teal-600"
                    : "bg-slate-100 text-slate-500"
                }
              `}
            >
              {problem.completed ? (
                <Check size={15} />
              ) : (
                <Code2 size={15} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800">
                {problem.title}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                <span>{problem.topic}</span>
                <span>·</span>
                <span>{problem.platform}</span>
                <span>·</span>

                <span
                  className={`
                    font-medium
                    ${
                      problem.difficulty === "Easy"
                        ? "text-teal-600"
                        : problem.difficulty === "Medium"
                        ? "text-amber-500"
                        : "text-red-500"
                    }
                  `}
                >
                  {problem.difficulty}
                </span>
              </div>
            </div>

            <button
              type="button"
              className={`
                flex shrink-0 items-center justify-center gap-1.5
                rounded-lg px-3 py-2 text-[10px] font-semibold
                ${
                  problem.completed
                    ? "border border-slate-200 text-slate-500 hover:bg-slate-50"
                    : "bg-indigo-500 text-white hover:bg-indigo-600"
                }
              `}
            >
              {problem.completed
                ? "Review"
                : "Solve"}

              <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* RESOURCES                                                                  */
/* -------------------------------------------------------------------------- */

function Resources({ resources }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Learning Resources
        </h2>

        <p className="mt-1 text-[11px] text-slate-400">
          Curated resources to help you prepare for placement.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                <BookOpen size={15} />
              </div>

              <span className="rounded-full bg-slate-50 px-2 py-1 text-[9px] font-medium text-slate-400">
                {resource.type}
              </span>
            </div>

            <h3 className="mt-4 text-xs font-semibold text-slate-800">
              {resource.title}
            </h3>

            <p className="mt-1 text-[10px] text-indigo-500">
              {resource.category}
            </p>

            <p className="mt-2 text-[10px] leading-4 text-slate-400">
              {resource.description}
            </p>

            <button
              type="button"
              className="mt-4 flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Open resource
              <ExternalLink size={11} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* LOADING                                                                    */
/* -------------------------------------------------------------------------- */

function LearnSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div>
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="h-25 rounded-xl bg-slate-200" />
        <div className="h-25 rounded-xl bg-slate-200" />
        <div className="h-25 rounded-xl bg-slate-200" />
      </div>

      <div className="h-10 w-120 max-w-full rounded bg-slate-200" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(210px,0.75fr)_minmax(0,1.7fr)]">
        <div className="h-100 rounded-xl bg-slate-200" />
        <div className="h-100 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ERROR                                                                      */
/* -------------------------------------------------------------------------- */

function LearnError({ onRetry }) {
  return (
    <div className="flex min-h-125 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <Target size={20} />
        </div>

        <h2 className="mt-4 text-sm font-semibold text-slate-900">
          Couldn't load your learning data
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Something went wrong while fetching your learning tracks.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN PAGE                                                                  */
/* -------------------------------------------------------------------------- */

export default function LearnAndPractice() {
  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [activeTab, setActiveTab] =
    useState("tracks");

  const [selectedTrackId, setSelectedTrackId] =
    useState(null);

  /* ------------------------------------------------------------------------ */
  /* LOAD DATA                                                                */
  /* ------------------------------------------------------------------------ */

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result =
        await getLearnAndPracticeData();

      setData(result);

      setSelectedTrackId(
        result.selectedTrackId ||
          result.learningTracks?.[0]?.id
      );
    } catch (err) {
      console.error(
        "Learning data loading failed:",
        err
      );

      setError(
        "Failed to load learning data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* LOADING                                                                  */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <AppLayout
        user={null}
        readiness={null}
        pageTitle="Learning & Practice"
      >
        <main className="mx-auto w-full max-w-275 min-w-0 px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
          <LearnSkeleton />
        </main>
      </AppLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* ERROR                                                                    */
  /* ------------------------------------------------------------------------ */

  if (error && !data) {
    return (
      <AppLayout
        user={null}
        readiness={null}
        pageTitle="Learning & Practice"
      >
        <main className="w-full min-w-0 px-4 sm:px-6 lg:px-8">
          <LearnError onRetry={loadData} />
        </main>
      </AppLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* SELECTED TRACK                                                           */
  /* ------------------------------------------------------------------------ */

  const selectedTrack =
    data.learningTracks.find(
      (track) => track.id === selectedTrackId
    ) || data.learningTracks[0];

  /* ------------------------------------------------------------------------ */
  /* MAIN                                                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <AppLayout
      user={data.user}
      readiness={null}
      pageTitle="Learning & Practice"
      pageLabel="Student workspace"
    >
      <main className="mx-auto w-full max-w-275 min-w-0 px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
        {/* ---------------------------------------------------------------- */}
        {/* HEADER                                                            */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />

                <span className="text-[11px] font-medium text-slate-400">
                  Placement preparation
                </span>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Learning & Practice
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                Work through structured tracks, sharpen problem-solving,
                and track what you've covered — all in one place.
              </p>
            </div>

            {/* Streak badge */}
            <div className="flex w-fit items-center gap-2 rounded-lg border border-orange-100 bg-orange-50 px-3 py-2">
              <Flame
                size={15}
                className="text-orange-500"
                fill="currentColor"
              />

              <div>
                <p className="text-[9px] font-medium text-orange-500">
                  Current streak
                </p>

                <p className="text-xs font-semibold text-orange-700">
                  {data.stats.dayStreak} days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* STATS                                                             */}
        {/* ---------------------------------------------------------------- */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={CheckCircle2}
            value={data.stats.problemsSolved}
            label="problems solved"
            description="across all tracks"
            accent="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            icon={Flame}
            value={data.stats.dayStreak}
            label="day streak"
            description="keep it going"
            accent="bg-orange-50 text-orange-500"
          />

          <StatCard
            icon={Trophy}
            value={data.stats.tracksInProgress}
            label="tracks in progress"
            description={`${data.stats.nearlyComplete} nearly complete`}
            accent="bg-teal-50 text-teal-600"
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* TABS                                                              */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-8 overflow-x-auto border-b border-slate-200">
          <div className="flex min-w-max gap-6">
            {data.tabs.map((tab) => {
              const active =
                activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={`
                    relative pb-3 text-xs font-medium transition
                    ${
                      active
                        ? "text-indigo-600"
                        : "text-slate-500 hover:text-slate-800"
                    }
                  `}
                >
                  {tab.label}

                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-px bg-indigo-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* LEARNING TRACKS                                                   */}
        {/* ---------------------------------------------------------------- */}

        {activeTab === "tracks" && (
          <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(210px,0.75fr)_minmax(0,1.7fr)]">
            <LearningTrackList
              tracks={data.learningTracks}
              selectedTrackId={selectedTrackId}
              onSelect={setSelectedTrackId}
            />

            <ActiveTrackCard
              track={selectedTrack}
              nextStep={
                selectedTrack.id === "dsa"
                  ? data.nextStep
                  : null
              }
            />
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* PRACTICE                                                          */}
        {/* ---------------------------------------------------------------- */}

        {activeTab === "practice" && (
          <div className="mt-5">
            <PracticeProblems
              problems={data.practiceProblems}
            />
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* RESOURCES                                                         */}
        {/* ---------------------------------------------------------------- */}

        {activeTab === "resources" && (
          <div className="mt-5">
            <Resources
              resources={data.resources}
            />
          </div>
        )}
      </main>
    </AppLayout>
  );
}