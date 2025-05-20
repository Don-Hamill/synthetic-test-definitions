/**
 * stdx run <file>
 * Validate a test definition and execute it with Playwright (headless Chromium).
 */
const fs         = require("fs");
const path       = require("path");
const Ajv        = require("ajv");
const addFormats = require("ajv-formats");
const { chromium } = require("@playwright/test");

exports.command  = "run <file>";
exports.describe = "Validate and run a synthetic test in headless Chromium";

exports.builder = (y) =>
    y.positional("file", {
        type: "string",
        describe: "Path to JSON definition (e.g. tests/login.json)",
    });

exports.handler = async ({ file }) => {
    /* ── 1.  Load schema & data ─────────────────────────────── */
    const schema = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, "../../synthetic-test-schema.json"))
    );
    const data = JSON.parse(fs.readFileSync(file));

    /* ── 2.  Schema validation ──────────────────────────────── */
    const ajv = new Ajv({ strict: false });
    addFormats(ajv);
    const validate = ajv.compile(schema);

    if (!validate(data)) {
        console.error("❌ Schema errors:", validate.errors);
        process.exit(1);
    }
    console.log("✅ Schema valid. Launching headless browser…");

    /* ── 3.  Playwright execution ───────────────────────────── */
    const start = Date.now();
    let result  = "PASS";

    const browser = await chromium.launch();
    const page    = await browser.newPage();

    try {
        await page.goto(data.url);

        /* --- optional pre-inputs block --- */
        if (data.inputs) {
            for (const inp of data.inputs) {
                await page.fill(inp.selector, inp.value);
            }
        }

        /* --- main step loop --- */
        for (const step of data.steps) {
            if (step.action === "click") {
                await page.click(step.selector);
            } else if (step.action === "type") {
                await page.fill(step.selector, step.value ?? "");
            } else {
                throw new Error(`Unknown action "${step.action}"`);
            }
        }

        /* --- final assertions --- */
        if (data.expectedElements) {
            for (const exp of data.expectedElements) {
                const el = await page.waitForSelector(exp.selector, { timeout: 10000 });
                if (exp.text) {
                    const text = await el.textContent();
                    if (text?.trim() !== exp.text) {
                        result = "FAIL";
                        console.error(
                            `❌ Text mismatch on ${exp.selector} — expected "${exp.text}", saw "${text}"`
                        );
                    }
                }
            }
        }
    } catch (err) {
        result = "FAIL";
        console.error("❌ Test crashed:", err.message);
    } finally {
        await browser.close();
    }

    const durationMs = Date.now() - start;

    /* ── 4.  Persist & report ───────────────────────────────── */
    fs.writeFileSync(
        ".last-run.json",
        JSON.stringify({ file, result, durationMs }, null, 2)
    );

    console.log(
        result === "PASS"
            ? `🎉 Test finished: PASS (${durationMs} ms)`
            : `❌ Test finished: FAIL (${durationMs} ms)`
    );

    process.exit(result === "PASS" ? 0 : 1);
};
