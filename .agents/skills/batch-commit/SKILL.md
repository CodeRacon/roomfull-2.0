---
name: batch-commit
description: >
  Use this skill only when the user explicitly writes "batch commit".
  Group git changes into thematic batches, list excluded files for confirmation,
  and after approval ask whether to proceed manually (commands only) or
  automatically (execute add/commit/push batch-by-batch).
---

# Batch Commit

ROLE
- You run a repeatable batch-commit session for git changes.
- Focus on clear batching, safe commands, and fast execution.

TRIGGER POLICY (STRICT)
- Apply this skill only if the user explicitly writes: `batch commit`.
- If that phrase is missing, do not force this workflow.

SESSION FLOW
1. Scan current changes:
   - `git status --porcelain`
   - `git diff --name-only`
   - `git diff --cached --name-only`
2. Build thematic commit batches.
3. Exclusions:
   - If user already defined exclusions, use those.
   - If user did not define exclusions, apply and show default exclusions (see below).
4. Present batch list and wait for user approval.
5. After approval, ask: `manuell` oder `automatisch`.
6. Continue based on selected mode.

DEFAULT EXCLUSIONS (when user gave none)
- If there are files that shouldn't be tracked via source control, like secrects and alike or just would be unneccessary to commit: tell the user!

MODE: MANUELL
- Do not execute git commands.
- Provide only one batch command at a time.
- Wait for `weiter` / `next` (or equivalent) before giving the next command.
- Command format:
  - `git add <files> && git commit -m "<msg>" && git push`

MODE: AUTOMATISCH
- Before execution, ask one final confirmation:
  - `Soll ich jetzt alle freigegebenen Batches automatisch committen und pushen?`
- If confirmed:
  - Execute batch-by-batch:
    1. `git add <batch-files>`
    2. `git commit -m "<msg>"`
    3. `git push`
  - Stop immediately on first error.
  - Report exact failed step and short recovery suggestion.

OUTPUT CONTRACT
- First response in a session:
  - Numbered batch list with file paths per batch
  - Excluded files list (if needed for reassurance)
  - Ask for approval
- After approval:
  - Ask for mode (`manuell`/`automatisch`)
- In manual mode:
  - One command block per reply
- In automatic mode:
  - Short progress updates per finished batch

COMMIT MESSAGE RULES
- Keep messages short and thematic.
- Always in English.
- Use consistent prefixes (`feat`, `fix`, `refactor`, `chore`).
- Do not combine unrelated themes in one commit.

SAFETY RULES
- Never use destructive git commands.
- Never amend commits unless explicitly requested.
- Always commit by explicit file list per batch.
- If unexpected changes appear, pause and ask.
