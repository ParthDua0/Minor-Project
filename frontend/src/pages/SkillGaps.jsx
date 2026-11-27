import { useEffect, useState } from 'react';
import { Clock3, Code2, Plus, Play, Trophy } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { getProfileData } from '../api/apiProfile';
import { getAssessments, getQuestions, submitAssessment } from '../api/apiCareer';

const coding = new Set(['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'sql', 'react', 'node.js']);
const fmt = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const tone = (level) => level === 'Job ready' ? 'bg-emerald-100 text-emerald-800' : level === 'Proficient' ? 'bg-blue-100 text-blue-800' : level === 'Developing' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700';

export default function SkillGaps() {
  const [skills, setSkills] = useState([]), [assessments, setAssessments] = useState([]), [custom, setCustom] = useState(''), [selected, setSelected] = useState(''), [questions, setQuestions] = useState([]), [answers, setAnswers] = useState({}), [time, setTime] = useState(0), [result, setResult] = useState(null), [error, setError] = useState(''), [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [profile, data] = await Promise.all([getProfileData(), getAssessments()]);
      setSkills([...new Set([...(profile.parsedSkills || []), ...(data.assessments || []).map((a) => a.skill)])]);
      setAssessments(data.assessments || []);
    } catch {
      setError('Could not load your skills.');
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!questions.length || time <= 0) return;
    const id = setInterval(() => setTime((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [questions.length, time]);
  useEffect(() => { if (questions.length && time === 0 && !submitting) finish(); }, [time]);

  const prior = (skill) => assessments.find((a) => a.skill === skill.toLowerCase());

  const start = async (skill) => {
    try {
      setError('');
      setResult(null);
      setSelected(skill);
      setAnswers({});
      const data = await getQuestions(skill);
      setQuestions(data.questions);
      setTime(data.durationSeconds);
    } catch {
      setError('Could not start the assessment.');
    }
  };

  const addSkill = (e) => {
    e.preventDefault();
    const skill = custom.trim().toLowerCase();
    if (!skill) return;
    setSkills((all) => [...new Set([...all, skill])]);
    setCustom('');
    start(skill);
  };

  const finish = async () => {
    if (!questions.length || submitting) return;
    if (time > 0 && questions.some((q) => !(answers[q.id] || '').trim())) {
      return setError('Answer all 15 questions, or wait until time expires to submit what you completed.');
    }
    try {
      setSubmitting(true);
      const data = await submitAssessment({
        skill: selected,
        answers: questions.map((q) => ({ questionId: q.id, answer: answers[q.id] || '' })),
      });
      setResult(data);
      setAssessments((all) => [...all.filter((a) => a.skill !== data.assessment.skill), data.assessment]);
      setQuestions([]);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not score test.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout pageTitle="Skill assessments">
      <main className="mx-auto max-w-6xl p-5 sm:p-8">
        {/* REPLACED HERO SECTION START */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Career readiness lab</p>
          <h1 className="mt-1.5 text-2xl font-semibold text-slate-900 sm:text-3xl">Prove every skill you claim.</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Click a resume skill to begin its timed 15-question assessment. Add any skill you want to test too. Programming skills include a coding challenge.
          </p>
          <form onSubmit={addSkill} className="mt-5 flex max-w-lg gap-2">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white placeholder:text-slate-400"
              placeholder="Add a skill, e.g. SQL or Figma"
            />
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700">
              <Plus size={16} /> Add & test
            </button>
          </form>
        </div>
        {/* REPLACED HERO SECTION END */}

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {!questions.length ? (
          <>
            <div className="mt-8 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your skill map</h2>
              <span className="text-sm text-slate-500">{skills.length} skills</span>
            </div>
            <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => {
                const item = prior(skill), isCode = coding.has(skill.toLowerCase());
                return (
                  <button
                    onClick={() => start(skill)}
                    key={skill}
                    className="group rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                        {isCode ? <Code2 size={19} /> : <Trophy size={19} />}
                      </div>
                      {item && <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone(item.level)}`}>{item.score}%</span>}
                    </div>
                    <h3 className="mt-5 capitalize font-semibold text-slate-900">{skill}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {item ? `${item.level} · click to retake` : isCode ? '15 questions + coding challenge' : '15-question skill assessment'}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                      Start assessment <Play size={13} />
                    </span>
                  </button>
                );
              })}
            </section>
            {!skills.length && (
              <p className="mt-6 rounded-xl border border-dashed p-5 text-slate-600">
                Add a skill above, or upload a resume to populate this automatically.
              </p>
            )}
            {result && (
              <section className="mt-7 rounded-2xl border border-teal-200 bg-teal-50 p-5">
                <h2 className="text-lg font-semibold">{result.assessment.score}% — {result.assessment.level}</h2>
                <p className="mt-1 text-sm">{result.feedback}</p>
                <p className="mt-2 text-sm font-medium">
                  {result.assessment.level === 'Job ready'
                    ? 'You are fit to present this skill for relevant jobs.'
                    : 'Keep practising this skill before depending on it in job applications.'}
                </p>
              </section>
            )}
          </>
        ) : (
          <section className="mt-7 rounded-2xl border bg-white p-5 sm:p-7">
            <div className="sticky top-3 z-10 flex items-center justify-between rounded-xl bg-slate-950 p-4 text-white">
              <div>
                <p className="text-xs text-teal-300">Timed assessment</p>
                <h2 className="capitalize font-semibold">{selected} · 15 questions</h2>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 font-mono text-lg">
                <Clock3 size={18} />{fmt(time)}
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Your assessment submits automatically at 00:00. Use clear explanations; the final question may be coding.
            </p>
            {questions.map((q, i) => (
              <label className="mt-6 block" key={q.id}>
                <span className="font-medium text-slate-800">{i + 1}. {q.text}</span>
                <textarea
                  rows={q.type === 'code' ? 10 : 4}
                  className={`mt-2 w-full rounded-xl border p-3 font-${q.type === 'code' ? 'mono' : 'sans'} text-sm`}
                  placeholder={q.type === 'code' ? 'Write your code here…' : 'Write your answer…'}
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                />
              </label>
            ))}
            <button
              disabled={submitting}
              onClick={finish}
              className="mt-6 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? 'Scoring…' : 'Submit and score assessment'}
            </button>
          </section>
        )}
      </main>
    </AppLayout>
  );
}