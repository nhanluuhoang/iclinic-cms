# CLAUDE.md

Behavioral guidelines + cross-session memory for this repo.
Merge with project-specific instructions as needed.

---

# PART A — Behavior (từ Andrej Karpathy's observations)

**Tradeoff:** biased toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If 200 lines could be 50, rewrite it.

Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.
- Remove imports/variables/functions that YOUR changes made unused.

The test: every changed line traces directly to the user's request.

## 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a failing test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan (step → verify) before starting.

---
# PART B — Memory & Continuity

Continuity across sessions lives in `docs/`, NOT in your head.
These files are in the repo and committed to git.

## At the start of each session
Before doing anything, READ in this order:
1. `docs/memory.md`   — distilled context: user, project, current state.
2. `docs/progress.md` — done / in progress / next up.
3. `docs/decisions.md` — architectural decisions made and their rationale (read as needed).

## While working
- When you lock in an important architectural decision → add an entry to `docs/decisions.md`
  (date, decision, rationale, options rejected). Append only, don't edit past entries.
- When you finish or drop a task → update `docs/progress.md`.

## At the end of a session (or when I say "update memory")
Rewrite `docs/memory.md` to be CONCISE:
- Integrate new information, REMOVE what's now outdated.
- Do NOT accumulate, do NOT repeat — this is a distillation, not a raw log.
- Keep it under ~1 page. If it's longer, it isn't distilled enough.
- Keep the section structure: ## User / ## Project / ## Architecture / ## State.

Apply Principle 3 (Surgical Changes) to the memory file itself: change only what
actually changed, don't rewrite parts that are still correct just to make them different.