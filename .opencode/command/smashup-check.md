---
description: Full verification pass on the SMASHUP repo — tests, review since a point, and docs/code sync, run in parallel. Use after any work batch or before committing.
agent: build
---

Run the full SMASHUP verification team in parallel (launch the agents with the Task tool, all at once):

1. Run `node --test tests/*.test.cjs` yourself and report the pass/fail counts (expect all 9 suites passing). Also confirm the E2E set matches by running `npm run e2e` (expect 33/33).
2. If an argument is given, review since that point: launch the **smashup-reviewer** subagent on `$1` as the baseline, and capture its Standards + Spec verdict.
   If no argument is given, review the full working tree vs HEAD.
3. Launch the **smashup-docs** subagent with: verify `docs/page-guide.md`, `llms.txt`, `PROJECT.md`, and `notebooklm/00-อ่านก่อน.md` against the current code — page list, test counts, bell coverage (รวมหน้าย่อย admin), tournament seeding capability — and fix any drift it finds.
4. Launch the **smashup-tests** subagent with a coverage-gap audit of the modules touched since the baseline (or all modules if no argument given).

Then report back one combined summary: test result, review verdict, docs sync result, coverage gaps. Keep it terse. Do not commit unless asked.