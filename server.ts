import index from "./index.html";

Bun.serve({
	development: { console: true, hmr: true },
	port: 3000,
	routes: {
		"/": index,
	},
});

console.log("http://localhost:3000");
