/**
 * keep-awake
 *
 * Keeps the Mac awake while the agent is working by running `caffeinate -d`
 * (prevents display sleep) for the duration of each agent run:
 * - `agent_start`: spawn `caffeinate -d -w <pi-pid>` if not already running
 * - `agent_settled`: stop caffeinate (fires only when pi is fully done —
 *   no auto-retry, auto-compaction retry, or queued follow-up left)
 * - `session_shutdown`: stop caffeinate as a final safety net
 *
 * The `-w` flag ties caffeinate to pi's pid, so even if pi dies without
 * cleanup, caffeinate exits instead of leaking.
 *
 * Modes (managed with `/awake`):
 * - auto (default): caffeinate runs only while the agent is working
 * - on: caffeinate runs continuously until turned off
 * - off: never spawn caffeinate
 *
 * Usage:
 *   /awake          toggle between auto and off
 *   /awake on       force awake (stays on across runs)
 *   /awake off      disable (stops any running caffeinate)
 *   /awake auto     back to automatic behavior
 *   /awake status   show current mode and process state
 *
 * Non-macOS platforms are a no-op.
 */

import { spawn, type ChildProcess } from "node:child_process";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

type Mode = "auto" | "on" | "off";

export default function (pi: ExtensionAPI) {
	if (process.platform !== "darwin") return;

	let mode: Mode = "auto";
	let caffeinate: ChildProcess | null = null;

	function start(ctx: ExtensionContext) {
		if (caffeinate || mode === "off") return;
		try {
			// `-d` keeps the display awake; `-w` exits caffeinate when pi's pid dies.
			caffeinate = spawn("caffeinate", ["-d", "-w", String(process.pid)], {
				stdio: "ignore",
			});
			caffeinate.on("error", (error) => {
				caffeinate = null;
				if (ctx.hasUI) {
					ctx.ui.notify(`keep-awake: failed to start caffeinate: ${error.message}`, "error");
				}
			});
			caffeinate.on("exit", () => {
				caffeinate = null;
			});
			// Don't hold pi's event loop open on shutdown.
			caffeinate.unref();
		} catch (error) {
			caffeinate = null;
			if (ctx.hasUI) {
				ctx.ui.notify(`keep-awake: failed to start caffeinate: ${(error as Error).message}`, "error");
			}
			return;
		}
	}

	function stop(ctx: ExtensionContext) {
		if (!caffeinate) return;
		caffeinate.kill();
		caffeinate = null;
	}

	function sync(ctx: ExtensionContext) {
		if (mode === "off") {
			stop(ctx);
		} else if (mode === "on") {
			start(ctx);
		}
		// In "auto" mode, start/stop is driven by agent lifecycle events.
	}

	pi.on("agent_start", async (_event, ctx) => {
		if (mode !== "off") start(ctx);
	});

	pi.on("agent_settled", async (_event, ctx) => {
		if (mode === "auto") stop(ctx);
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		stop(ctx);
	});

	pi.registerCommand("awake", {
		description: "Keep the Mac awake (caffeinate) — toggle/force/status",
		handler: async (args, ctx) => {
			const arg = (args ?? "").trim().toLowerCase();

			switch (arg) {
				case "":
					mode = mode === "off" ? "auto" : "off";
					break;
				case "on":
				case "auto":
				case "off":
					mode = arg;
					break;
				case "status": {
					const proc = caffeinate ? "running" : "stopped";
					ctx.ui.notify(`keep-awake: mode=${mode}, caffeinate=${proc}`, "info");
					return;
				}
				default:
					ctx.ui.notify(`keep-awake: unknown argument "${arg}" (use on, off, auto, or status)`, "warning");
					return;
			}

			sync(ctx);
			ctx.ui.notify(`keep-awake: mode=${mode}`, "info");
		},
	});
}
