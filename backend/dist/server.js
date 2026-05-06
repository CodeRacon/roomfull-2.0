"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_js_1 = require("./app.js");
const env_js_1 = require("./config/env.js");
const port = env_js_1.env.PORT;
async function start() {
    app_js_1.app.listen(port, () => {
        console.log(`API läuft auf http://localhost:${port}`);
        console.log(`Swagger UI: http://localhost:${port}/docs`);
    });
}
start().catch((error) => {
    console.error("Startup fehlgeschlagen:", error);
    process.exit(1);
});
