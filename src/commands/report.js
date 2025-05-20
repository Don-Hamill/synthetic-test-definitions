const fs = require("fs");
exports.command = "report";
exports.describe = "Show last stub-run result";
exports.handler = () => {
    if (!fs.existsSync(".last-run.json")) {
        console.log("No runs yet.");
        return;
    }
    const r = JSON.parse(fs.readFileSync(".last-run.json"));
    console.table([r]);
};
