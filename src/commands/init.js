const fs = require("fs");
exports.command = "init <name>";
exports.describe = "Scaffold a new test definition";
exports.builder = (y) =>
    y.positional("name", { type: "string", describe: "Test file name (no ext)" });

exports.handler = ({ name }) => {
    const path = `tests/${name}.json`;
    if (fs.existsSync(path)) {
        console.error("❌ Test already exists:", path);
        process.exit(1);
    }
    fs.writeFileSync(
        path,
        JSON.stringify(
            {
                url: "https://example.com",
                steps: [{ action: "click", selector: "#placeholder" }]
            },
            null,
            2
        )
    );
    console.log("✅ Created", path);
};
