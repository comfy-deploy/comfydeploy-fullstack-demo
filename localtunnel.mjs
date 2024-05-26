import localtunnel from "localtunnel";
import tcpPortUsed from "tcp-port-used";

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

await tcpPortUsed.waitUntilUsed(port, 500, 30000);

const tunnel = await localtunnel({ port: port, local_https: false });
console.log(tunnel.url);

import fs from "node:fs";
import path from "node:path";

const filePath = path.join(__dirname, "tunnel_url.txt");
fs.writeFileSync(filePath, tunnel.url, "utf8");

process.on("exit", () => {
	tunnel.close();
	// console.log("Tunnel closed due to process exit.");
});

process.on("SIGINT", () => {
	tunnel.close();
	// console.log("Tunnel closed due to SIGINT.");
	process.exit();
});

process.on("SIGTERM", () => {
	tunnel.close();
	// console.log("Tunnel closed due to SIGTERM.");
	process.exit();
});
