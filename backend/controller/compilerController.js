const supported = {
  javascript: 63, python: 71, java: 62, cpp: 54, c: 50, csharp: 51, php: 68, sql: 82
};
const complexity = (code) => {
  const loops = (code.match(/\b(for|while)\b/g) || []).length;
  const recursive = /\b([A-Za-z_$][\w$]*)\s*\([^)]*\)[^{]*\{[\s\S]*?\b\1\s*\(/.test(code);
  if (recursive) return 'Likely recursive — review base case and recurrence';
  if (loops >= 2) return 'Estimated O(n²) or higher (nested/independent loops detected)';
  if (loops === 1) return 'Estimated O(n) (one loop detected)';
  return 'Estimated O(1) (no loop detected)';
};
const runCode = async (req, res) => {
  const { language, source, stdin = '' } = req.body || {};
  if (!supported[language]) return res.status(400).json({ message: 'Unsupported language' });
  if (typeof source !== 'string' || !source.trim() || source.length > 50000) return res.status(400).json({ message: 'Source code is required and must be below 50 KB' });
  const endpoint = process.env.JUDGE0_URL;
  if (!endpoint) return res.status(503).json({ message: 'Compiler is not configured. Set JUDGE0_URL to an isolated Judge0-compatible executor.', complexity: complexity(source) });
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (process.env.JUDGE0_API_KEY) headers['X-Auth-Token'] = process.env.JUDGE0_API_KEY;
    const created = await fetch(`${endpoint.replace(/\/$/, '')}/submissions?base64_encoded=false&wait=true`, { method: 'POST', headers, body: JSON.stringify({ source_code: source, language_id: supported[language], stdin }) });
    if (!created.ok) throw new Error(`Executor returned ${created.status}`);
    const data = await created.json();
    res.json({ stdout: data.stdout || '', stderr: data.stderr || data.compile_output || '', status: data.status?.description || 'Completed', time: data.time ? `${data.time}s` : '—', memory: data.memory ? `${data.memory} KB` : '—', complexity: complexity(source) });
  } catch (error) { res.status(502).json({ message: 'The isolated compiler could not run this submission.', complexity: complexity(source) }); }
};
module.exports = { runCode };
