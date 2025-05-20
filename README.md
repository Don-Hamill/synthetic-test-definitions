# synthetic-test-definitions
# 🧪 Synthetic-Test-Definitions

Declarative JSON test files **+** a simple CLI that validates and then executes them in a headless browser (Playwright Chromium).  
Perfect for quick end-to-end “smoke” flows—no runner code changes required.

---

## ✨ Quick Demo

```bash
# 1 · clone & install
git clone <your-repo>
cd synthetic-test-definitions
npm install       # downloads Playwright browsers the first time

# 2 · create a test skeleton
npx stdx init my-login

# 3 · edit tests/my-login.json  (fill url, steps, etc.)

# 4 · run it
npx stdx run tests/my-login.json   # → PASS / FAIL

# 5 · validate entire suite
npm run validate

🏃‍♂️ CLI Commands (stdx)
Command	Purpose
stdx init <name>	Creates tests/<name>.json scaffold.
stdx run <file>	1) Validates JSON
2) Opens headless Chromium
3) Executes actions (click, type, …)
4) Checks expectedElements and prints PASS/FAIL.
stdx report	Shows last run’s file, result, and duration (reads .last-run.json).

(You can also run npm run cli -- <args> if you prefer that alias.)

📐 Schema Cheat-Sheet (Draft-07)
Field	Required	Description
url	✅	Start URL (http:// or https://).
inputs[]	—	Legacy quick-fill block: array of {selector, value}.
steps[]	✅	Ordered user actions:
• {action:"click", selector}
• {action:"type", selector, value}
expectedElements[]	—	Post-run checks: {selector} or {selector, text}
No extra keys	—	additionalProperties:false rejects typos.

📝 Authoring Tips
Selectors – Use stable CSS selectors; confirm in DevTools.

Typing – Use a "type" step or an entry in inputs.

Waits – Playwright auto-waits for clickable/fillable elements; add intermediate steps if you need explicit waits.

Extending actions – Want hover, pressKey, etc.? Add to both schema and run.js.

🔒 CI Guardrail
.github/workflows/validate-definitions.yml runs npm ci && npm run validate on every PR.

Merge blocked if any test violates the schema.

🛠️ Troubleshooting
Issue	Fix
Browsers didn’t download	npx playwright install
Selector changed	Update JSON, rerun CLI
Schema error output	Points to the exact bad field; fix & re-validate

📜 License