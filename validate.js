#!/usr/bin/env node
/**
 * Validate all JSON test definitions in /tests against synthetic-test-schema.json.
 * Exits with code 1 if any file fails validation.
 */

const Ajv        = require("ajv");
const addFormats = require("ajv-formats");
const glob       = require("glob");
const fs         = require("fs");
const path       = require("path");

// ────────────────────────────────────────────────────────────
// 1.  Load schema and configure Ajv
// ────────────────────────────────────────────────────────────
const schemaPath = path.resolve(__dirname, "synthetic-test-schema.json");
const schema     = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

const ajv = new Ajv({ strict: false });   // disable strict-mode noise
addFormats(ajv);                          // adds "uri", "email", etc.

const validate = ajv.compile(schema);

// ────────────────────────────────────────────────────────────
// 2.  Validate every *.json file under /tests
// ────────────────────────────────────────────────────────────
let hasFailures = false;

glob.sync("tests/*.json").forEach((file) => {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const ok   = validate(data);

    console.log(`${ok ? "✅" : "❌"} ${file}`);

    if (!ok) {
        console.error(validate.errors);
        hasFailures = true;
    }
});

// ────────────────────────────────────────────────────────────
// 3.  Exit with non-zero status if anything failed
// ────────────────────────────────────────────────────────────
process.exit(hasFailures ? 1 : 0);
