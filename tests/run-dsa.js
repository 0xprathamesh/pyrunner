#!/usr/bin/env node
const cases = require('./dsa-cases');

const API_URL = (process.env.API_URL || 'http://localhost:3000').replace(/\/$/, '');
const args = process.argv.slice(2);

function getFlag(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
}

const filterTopic = getFlag('--topic');
const filterId = getFlag('--id');
const concurrency = Number(getFlag('--concurrency') || process.env.CONCURRENCY || 2);

function normalize(s) {
  return String(s ?? '')
    .replace(/\r\n/g, '\n')
    .trim();
}

async function executeCase(testCase) {
  const started = Date.now();
  let httpMs = 0;
  let body;
  let error = null;

  try {
    const t0 = Date.now();
    const res = await fetch(`${API_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_code: testCase.source_code,
        stdin: testCase.stdin ?? '',
        wait: true,
      }),
    });
    httpMs = Date.now() - t0;
    body = await res.json();
    if (!res.ok) {
      error = body.error || `HTTP ${res.status}`;
    }
  } catch (err) {
    httpMs = Date.now() - started;
    error = err.message;
    body = null;
  }

  const actual = normalize(body?.stdout);
  const expected = normalize(testCase.expected_stdout);
  const status = body?.status;
  const passed =
    !error &&
    status === 'accepted' &&
    actual === expected;

  return {
    id: testCase.id,
    title: testCase.title,
    topic: testCase.topic,
    difficulty: testCase.difficulty,
    passed,
    status: status || 'request_error',
    expected,
    actual,
    stderr: normalize(body?.stderr),
    error_message: error || body?.error_message || null,
    exit_code: body?.exit_code ?? null,
    exec_time_ms: body?.time_ms ?? null,
    http_ms: httpMs,
    total_ms: Date.now() - started,
  };
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[idx];
}

function printTable(results) {
  const cols = [
    ['ID', (r) => r.id],
    ['TOPIC', (r) => r.topic],
    ['DIFF', (r) => r.difficulty],
    ['PASS', (r) => (r.passed ? 'PASS' : 'FAIL')],
    ['EXEC_MS', (r) => (r.exec_time_ms == null ? '-' : String(r.exec_time_ms))],
    ['HTTP_MS', (r) => String(r.http_ms)],
    ['STATUS', (r) => r.status],
  ];

  const rows = results.map((r) => cols.map(([, fn]) => fn(r)));
  const widths = cols.map(([h], i) =>
    Math.max(h.length, ...rows.map((row) => row[i].length))
  );

  const line = (cells) =>
    cells.map((c, i) => c.padEnd(widths[i])).join('  ');

  console.log(line(cols.map(([h]) => h)));
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of rows) {
    console.log(line(row));
  }
}

function printFailures(results) {
  const fails = results.filter((r) => !r.passed);
  if (!fails.length) return;

  console.log('\n── Failures ──────────────────────────────────────');
  for (const f of fails) {
    console.log(`\n[${f.id}] ${f.title}`);
    console.log(`  status:   ${f.status}`);
    if (f.error_message) console.log(`  error:    ${f.error_message}`);
    console.log(`  expected: ${JSON.stringify(f.expected)}`);
    console.log(`  actual:   ${JSON.stringify(f.actual)}`);
    if (f.stderr) console.log(`  stderr:   ${f.stderr.slice(0, 300)}`);
  }
}

function printMetrics(results, wallMs) {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const execTimes = results
    .map((r) => r.exec_time_ms)
    .filter((x) => typeof x === 'number')
    .sort((a, b) => a - b);
  const httpTimes = results.map((r) => r.http_ms).sort((a, b) => a - b);

  const byTopic = {};
  const byDiff = {};
  for (const r of results) {
    byTopic[r.topic] ??= { total: 0, passed: 0, exec: [] };
    byTopic[r.topic].total += 1;
    if (r.passed) byTopic[r.topic].passed += 1;
    if (r.exec_time_ms != null) byTopic[r.topic].exec.push(r.exec_time_ms);

    byDiff[r.difficulty] ??= { total: 0, passed: 0 };
    byDiff[r.difficulty].total += 1;
    if (r.passed) byDiff[r.difficulty].passed += 1;
  }

  const avg = (arr) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

  console.log('\n══ Metrics ═══════════════════════════════════════');
  console.log(`Cases:            ${results.length}`);
  console.log(`Passed:           ${passed}`);
  console.log(`Failed:           ${failed}`);
  console.log(
    `Pass rate:        ${((passed / results.length) * 100).toFixed(1)}%`
  );
  console.log(`Wall clock:       ${wallMs} ms`);
  console.log(`Concurrency:      ${concurrency}`);
  console.log(`Avg exec time:    ${avg(execTimes) ?? '-'} ms`);
  console.log(`P50 exec time:    ${percentile(execTimes, 50) ?? '-'} ms`);
  console.log(`P95 exec time:    ${percentile(execTimes, 95) ?? '-'} ms`);
  console.log(`Max exec time:    ${execTimes.length ? execTimes[execTimes.length - 1] : '-'} ms`);
  console.log(`Avg HTTP (wait):  ${avg(httpTimes) ?? '-'} ms`);
  console.log(`P95 HTTP (wait):  ${percentile(httpTimes, 95) ?? '-'} ms`);
  console.log(
    `Throughput:       ${(results.length / (wallMs / 1000)).toFixed(2)} cases/s`
  );

  console.log('\n── By topic ──────────────────────────────────────');
  for (const [topic, s] of Object.entries(byTopic).sort()) {
    const a = avg(s.exec);
    console.log(
      `  ${topic.padEnd(18)} ${String(s.passed).padStart(2)}/${s.total}  avg_exec=${a ?? '-'}ms`
    );
  }

  console.log('\n── By difficulty ─────────────────────────────────');
  for (const [diff, s] of Object.entries(byDiff).sort()) {
    console.log(`  ${diff.padEnd(10)} ${s.passed}/${s.total}`);
  }
}

async function main() {
  let selected = cases;
  if (filterId) {
    selected = cases.filter((c) => c.id === filterId);
  } else if (filterTopic) {
    selected = cases.filter((c) => c.topic === filterTopic);
  }

  if (!selected.length) {
    console.error('No cases matched filters.');
    process.exit(1);
  }

  // health check
  try {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error(`health HTTP ${res.status}`);
    const health = await res.json();
    console.log(`API OK @ ${API_URL}  python=${health.pythonImage}`);
  } catch (err) {
    console.error(`Cannot reach API at ${API_URL}: ${err.message}`);
    console.error('Start the stack: docker compose up -d --build');
    process.exit(1);
  }

  console.log(`Running ${selected.length} DSA cases (concurrency=${concurrency})...\n`);

  const wallStart = Date.now();
  const results = await mapPool(selected, concurrency, executeCase);
  const wallMs = Date.now() - wallStart;

  printTable(results);
  printFailures(results);
  printMetrics(results, wallMs);

  const failed = results.filter((r) => !r.passed).length;
  process.exit(failed ? 1 : 0);
}

main();
