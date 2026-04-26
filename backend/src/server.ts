import "dotenv/config";
import { app } from "./app.js";
import { env } from "./config/env.js";

const port = env.PORT;

async function start(): Promise<void> {
	app.listen(port, () => {
		console.log(`API läuft auf http://localhost:${port}`);
		console.log(`Swagger UI: http://localhost:${port}/docs`);
	});
}

start().catch((error) => {
	console.error("Startup fehlgeschlagen:", error);
	process.exit(1);
});
