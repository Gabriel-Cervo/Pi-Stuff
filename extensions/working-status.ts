/**
 * working-status
 *
 * Personalizes Pi's working indicators and footer:
 * - Working message: random whimsical verb phrases (whimsical.ts style)
 * - Working animation: Claude Code-style ping-pong spinner (based on
 *   pi-claude-shimmer), catppuccin latte sky
 * - Footer effort text (thinking level): colored like the text input border
 * - Footer context %: normal < 60%, warning 60-80%, error > 80%
 * - Footer stats separated by " • "
 */

import type { AssistantMessage } from "@earendil-works/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { readFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// Working message: whimsical phrases (from mitsuhiko/agent-stuff whimsical.ts)
// ---------------------------------------------------------------------------

const messages = [
	"Schlepping...",
	"Combobulating...",
	"Doing...",
	"Channelling...",
	"Vibing...",
	"Concocting...",
	"Spelunking...",
	"Transmuting...",
	"Imagining...",
	"Pontificating...",
	"Whirring...",
	"Cogitating...",
	"Honking...",
	"Flibbertigibbeting...",
	"Noodling...",
	"Percolating...",
	"Ruminating...",
	"Simmering...",
	"Marinating...",
	"Fermenting...",
	"Gestating...",
	"Hatching...",
	"Brewing...",
	"Steeping...",
	"Contemplating...",
	"Musing...",
	"Pondering...",
	"Mulling...",
	"Daydreaming...",
	"Woolgathering...",
	"Dithering...",
	"Faffing...",
	"Puttering...",
	"Tinkering...",
	"Fiddling...",
	"Noodging...",
	"Finagling...",
	"Wrangling...",
	"Jiggling...",
	"Wiggling...",
	"Shimmying...",
	"Galumphing...",
	"Perambulating...",
	"Meandering...",
	"Traipsing...",
	"Moseying...",
	"Sauntering...",
	"Ambling...",
	"Pottering...",
	"Bumbling...",
	"Futzing...",
	"Schmalzing...",
	"Kerfuffling...",
	"Bamboozling...",
	"Discombobulating...",
	"Recombobulating...",
	"Unbefuddling...",
	"Defenestrating...",
	"Confabulating...",
	"Persnicketing...",
	"Flummoxing...",
	"Befuddling...",
	"Snorkeling...",
	"Yodeling...",
	"Zigzagging...",
	"Ricocheting...",
	"Somersaulting...",
	"Pirouetting...",
	"Canoodling...",
	"Schmoozing...",
	"Kibbitzing...",
	"Skedaddling...",
	"Scampering...",
	"Skittering...",
	"Sashaying...",
	"Swashbuckling...",
	"Oscillating...",
	"Undulating...",
	"Pulsating...",
	"Effervescing...",
	"Fizzing...",
	"Bubbling...",
	"Perplexing...",
	"Mystifying...",
	"Enchanting...",
	"Bewitching...",
	"Beguiling...",
	"Mesmerizing...",
	"Bedazzling...",
	"Sparkling...",
	"Glittering...",
	"Scintillating...",
	"Coruscating...",
	"Phosphorescing...",
	"Luminescing...",
	"Sublimating...",
	"Synthesizing...",
	"Amalgamating...",
	"Procrastinating...",
	"Dillydallying...",
	"Lollygagging...",
	"Dawdling...",
	"Malingering...",
	"Skulking...",
	"Lurking...",
	"Sleuthing...",
	"Rummaging...",
	"Fossicking...",
	"Foraging...",
	"Scavenging...",
	"Absquatulating...",
	"Vamoosing...",
	"Absconding...",
	"Grooving...",
	"Jamming...",
	"Improvising...",
	"Extemporizing...",
	"Freestyling...",
	"Frolicking...",
	"Gamboling...",
	"Blorping...",
	"Flonking...",
	"Snurfling...",
	"Whomping...",
	"Zorping...",
	"Biffing...",
	"Splunging...",
	"Thwacking...",
	"Gonkulating...",
	"Splorfing...",
	"Wibbling...",
	"Wobbling...",
	"Squonking...",
	"Plonking...",
	"Bonking...",
	"Zonking...",
	"Flumping...",
	"Clomping...",
	"Squelching...",
	"Schlurping...",
	"Glurping...",
	"Burbling...",
	"Gurgling...",
	"Splooshing...",
	"Whooshing...",
	"Swooshing...",
	"Kerplunking...",
	"Thunking...",
	"Clunking...",
	"Clanking...",
	"Rattling...",
	"Jostling...",
	"Rustling...",
	"Bustling...",
	"Hustling...",
	"Miffing...",
	"Boffing...",
	"Snazzifying...",
	"Pizzazzing...",
	"Razzmatazzing...",
	"Bedoodling...",
	"Doodling...",
	"Scribbling...",
	"Squiggling...",
	"Wriggling...",
	"Niggling...",
	"Higgling...",
	"Piggling...",
	"Figgling...",
	"Gibbering...",
	"Jabbering...",
	"Blathering...",
	"Blithering...",
	"Withering...",
	"Slithering...",
	"Tethering...",
	"Feathering...",
	"Weathering...",
	"Leathering...",
	"Heathering...",
	"Smoldering...",
	"Moldering...",
	"Shouldering...",
	"Bouldering...",
	"Tottering...",
	"Teetering...",
	"Tittering...",
	"Flittering...",
	"Jittering...",
	"Frittering...",
	"Twittering...",
	"Nattering...",
	"Chattering...",
	"Clattering...",
	"Splattering...",
	"Battering...",
	"Scattering...",
	"Shattering...",
	"Flattering...",
	"Pattering...",
	"Tattering...",
	"Mattering...",
	"Yammering...",
	"Hammering...",
	"Stammering...",
	"Clamoring...",
	"Glamoring...",
	"Enamoring...",
	"Shimmering...",
	"Glimmering...",
	"Brimming...",
	"Skimming...",
	"Trimming...",
	"Primming...",
	"Whimming...",
	"Humming...",
	"Strumming...",
	"Thrumming...",
	"Drumming...",
	"Plumbing...",
	"Thumbing...",
	"Numbing...",
	"Fumbling...",
	"Grumbling...",
	"Mumbling...",
	"Rumbling...",
	"Stumbling...",
	"Tumbling...",
	"Crumbling...",
	"Jumbling...",
	"Humbling...",
	"Bungling...",
	"Jungling...",
	"Mangling...",
	"Wangling...",
	"Dangling...",
	"Tangling...",
	"Jangling...",
	"Angling...",
	"Struggling...",
	"Mingling...",
	"Tingling...",
	"Jingling...",
	"Singling...",
	"Ringling...",
	"Kingling...",
	"Consulting the void...",
	"Asking the electrons...",
	"Bribing the compiler...",
	"Negotiating with entropy...",
	"Whispering to the bits...",
	"Tickling the stack...",
	"Massaging the heap...",
	"Appeasing the garbage collector...",
	"Summoning semicolons...",
	"Herding pointers...",
	"Untangling spaghetti...",
	"Polishing the algorithms...",
	"Waxing philosophical...",
	"Consulting ancient scrolls...",
	"Reading tea leaves...",
	"Shaking the magic 8-ball...",
	"Sacrificing to the demo gods...",
	"Warming up the hamsters...",
	"Spinning up the squirrels...",
	"Caffeinating...",
	"Existentially questioning...",
	"Having a little think...",
	"Stroking chin thoughtfully...",
	"Squinting at the problem...",
	"Staring into the abyss...",
	"Abyss staring back...",
	"Achieving enlightenment...",
	"Transcending mere computation...",
	"Ascending to a higher plane...",
	"Communing with the machine spirit...",
	"Performing arcane rituals...",
	"Invoking elder functions...",
	"Consulting the oracle...",
	"Divining the answer...",
	"Scrying the codebase...",
	"Dowsing for bugs...",
	"Rearranging deck chairs...",
	"Shuffling bits around...",
	"Aligning the chakras...",
	"Reticulating splines...",
	"Reversing the polarity...",
	"Calibrating the flux capacitor...",
	"Charging the crystals...",
	"Tuning the vibrations...",
	"Adjusting the cosmic frequency...",
	"Waiting for a sign...",
	"Hoping for the best...",
	"Manifesting solutions...",
	"Willing it into existence...",
	"Believing really hard...",
	"Politely asking the CPU...",
	"Bribing the runtime...",
	"Flirting with the database...",
	"Sweet-talking the API...",
	"Negotiating with deadlines...",
	"Having words with the cache...",
	"Reasoning with the memory...",
	"Pleading with the logs...",
	"Bargaining with fate...",
	"Making offerings to the CI...",
	"Praying to the uptime gods...",
	"Consulting the rubber duck...",
	"Interrogating the stack trace...",
	"Cross-examining the debugger...",
	"Petitioning the kernel...",
	"Lobbying the scheduler...",
	"Schmoozing the network...",
	"Buttering up the firewall...",
	"Wining and dining the servers...",
	"Taking the bytes out for lunch...",
	"Giving the code a pep talk...",
	"Reading the room...",
	"Checking under the hood...",
	"Kicking the tires...",
	"Shaking loose the cobwebs...",
	"Dusting off the neurons...",
	"Greasing the gears...",
	"Oiling the cogs...",
	"Winding up the clockwork...",
	"Stoking the furnace...",
	"Feeding the machine...",
	"Watering the logic tree...",
	"Pruning the decision branches...",
	"Harvesting the outputs...",
	"Planting computational seeds...",
	"Nurturing the algorithm...",
	"Raising the exceptions...",
	"Taming wild pointers...",
	"Herding cats in memory...",
	"Teaching old code new tricks...",
	"Whispering sweet nothings to the compiler...",
	"Serenading the syntax...",
	"Dancing with dependencies...",
	"Waltzing through the codebase...",
	"Tangoing with type errors...",
	"Doing the deployment dance...",
	"Having a moment of clarity...",
	"Experiencing a flash of insight...",
	"Channeling the ancient developers...",
	"Receiving transmissions from the cloud...",
	"Asking the hamsters to run faster...",
	"Convincing the pixels to cooperate...",
	"Teaching electrons new tricks...",
	"Bribing the byte fairies...",
	"Whispering passwords to the void...",
	"Negotiating with cosmic rays...",
	"Flattering the floating points...",
	"Seducing the semicolons...",
	"Wooing the while loops...",
	"Charming the curly braces...",
	"Hypnotizing the hash tables...",
	"Mesmerizing the memory banks...",
	"Enchanting the error handlers...",
	"Bewitching the boolean logic...",
	"Spellbinding the stack frames...",
	"Hexing the hexadecimals...",
	"Jinxing the JSON parsers...",
	"Cursing the cache misses...",
	"Blessing the build process...",
	"Anointing the algorithms...",
	"Consecrating the callbacks...",
	"Sanctifying the source code...",
	"Exorcising the exceptions...",
	"Purifying the parameters...",
	"Cleansing the closures...",
	"Baptizing the binary...",
	"Absolving the abstractions...",
	"Redeeming the recursion...",
	"Forgiving the for loops...",
	"Pardoning the pointers...",
	"Liberating the lambdas...",
	"Emancipating the enums...",
	"Freeing the functions...",
	"Releasing the references...",
	"Unbinding the variables...",
	"Untying the type knots...",
	"Unraveling the regex...",
	"Decoding the mysteries...",
	"Cracking the conundrums...",
	"Solving the riddles of RAM...",
	"Unlocking the secrets of silicon...",
	"Discovering hidden semicolons...",
	"Unearthing buried bugs...",
	"Excavating ancient APIs...",
	"Archeologically analyzing the architecture...",
	"Fossil hunting in the functions...",
	"Spelunking through the stack...",
	"Scuba diving in the data...",
	"Snorkeling through the streams...",
	"Parasailing past the parameters...",
	"Hang gliding through the heap...",
	"Bungee jumping into the backend...",
	"Skydiving through the source...",
	"Surfing the syntax waves...",
	"Skateboarding down the stack trace...",
	"Snowboarding through the schemas...",
	"Mountain climbing the modules...",
	"Hiking through the headers...",
	"Trekking through the trees...",
	"Backpacking through the binaries...",
	"Camping in the codebase...",
	"Glamping in the globals...",
	"Picnicking with the processes...",
	"Barbecuing the bugs...",
	"Roasting the race conditions...",
	"Grilling the glitches...",
	"Sautéing the syntax errors...",
	"Flambéing the failures...",
	"Caramelizing the callbacks...",
	"Braising the breakpoints...",
	"Poaching the pointers...",
	"Blanching the branches...",
	"Searing the segments...",
	"Smoking the subroutines...",
	"Curing the code smells...",
	"Pickling the packages...",
	"Preserving the protocols...",
	"Canning the constants...",
	"Bottling the buffers...",
	"Jarring the JavaScript...",
	"Decanting the data structures...",
	"Aerating the arrays...",
	"Letting the logic breathe...",
	"Aging the algorithms gracefully...",
	"Maturing the methods...",
	"Ripening the results...",
	"Seasoning the solutions...",
	"Spicing up the specs...",
	"Garnishing the getters...",
	"Plating the output nicely...",
	"Presenting with pizzazz...",
	"Adding a dash of elegance...",
	"Sprinkling some magic dust...",
	"Drizzling debug sauce...",
	"Folding in the features...",
	"Whisking the widgets...",
	"Kneading the namespaces...",
	"Rolling out the runtime...",
	"Proofing the promises...",
	"Letting the dough rise...",
	"Baking at 350 kilobytes...",
	"Frosting the functions...",
	"Decorating the deployment...",
	"Icing the interfaces...",
	"Glazing the graphics...",
	"Topping with tests...",
	"Cherry-picking the commits...",
];

function pickRandom(): string {
	return messages[Math.floor(Math.random() * messages.length)];
}

// ---------------------------------------------------------------------------
// Working animation: Claude Code-style spinner (pi-claude-shimmer).
// Fixed color: catppuccin latte sapphire.
// ---------------------------------------------------------------------------

const WORKING_COLOR_HEX = "#209fb5"; // catppuccin latte sapphire

function hexToRgb(hex: string): string {
	return `\x1b[38;2;${parseInt(hex.slice(1, 3), 16)};${parseInt(hex.slice(3, 5), 16)};${parseInt(hex.slice(5, 7), 16)}m`;
}

function colorize(text: string, hex: string): string {
	return `${hexToRgb(hex)}${text}\x1b[0m`;
}

/** Claude Code-style ping-pong spinner glyphs (forward, then reverse). */
const GLYPHS = ["·", "✢", "✳", "✶", "✻", "✽"];
const SPINNER_INTERVAL_MS = 120;

function buildSpinnerFrames(hex: string): string[] {
	return [...GLYPHS, ...[...GLYPHS].reverse()].map((g) => colorize(g, hex));
}

const SPINNER_FRAMES = buildSpinnerFrames(WORKING_COLOR_HEX);

// ---------------------------------------------------------------------------
// Footer helpers (mirrors the built-in footer implementation)
// ---------------------------------------------------------------------------

function formatTokens(count: number): string {
	if (count < 1000) return count.toString();
	if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
	if (count < 1000000) return `${Math.round(count / 1000)}k`;
	if (count < 10000000) return `${(count / 1000000).toFixed(1)}M`;
	return `${Math.round(count / 1000000)}M`;
}

function formatCwdForFooter(cwd: string, home: string | undefined): string {
	if (!home) return cwd;
	const resolvedCwd = resolve(cwd);
	const resolvedHome = resolve(home);
	const relativeToHome = relative(resolvedHome, resolvedCwd);
	const isInsideHome =
		relativeToHome === "" ||
		(relativeToHome !== ".." &&
			!relativeToHome.startsWith(`..${sep}`) &&
			!isAbsolute(relativeToHome));
	if (!isInsideHome) return cwd;
	return relativeToHome === "" ? "~" : `~${sep}${relativeToHome}`;
}

function sanitizeStatusText(text: string): string {
	return text.replace(/[\r\n\t]/g, " ").replace(/ +/g, " ").trim();
}

interface UsageTotals {
	input: number;
	output: number;
	cacheRead: number;
	cacheWrite: number;
	cost: number;
}

function addUsage(totals: UsageTotals, usage: any): void {
	totals.input += usage?.input ?? 0;
	totals.output += usage?.output ?? 0;
	totals.cacheRead += usage?.cacheRead ?? 0;
	totals.cacheWrite += usage?.cacheWrite ?? 0;
	const cost = usage?.cost;
	totals.cost += typeof cost === "number" ? cost : (cost?.total ?? 0);
}

/** Read the effective auto-compact setting from pi settings files. */
function readAutoCompactEnabled(): boolean {
	try {
		const globalPath = joinHome(".pi", "agent", "settings.json");
		const global = JSON.parse(readFileSync(globalPath, "utf8")) as {
			compaction?: { enabled?: boolean };
		};
		let enabled = global.compaction?.enabled === true;
		try {
			const projectPath = joinHome(".pi", "settings.json");
			const project = JSON.parse(readFileSync(projectPath, "utf8")) as {
				compaction?: { enabled?: boolean };
			};
			if (project.compaction?.enabled !== undefined) {
				enabled = project.compaction.enabled;
			}
		} catch {
			// No project settings - global applies
		}
		return enabled;
	} catch {
		return false;
	}
}

function joinHome(...parts: string[]): string {
	const home = process.env.HOME || process.env.USERPROFILE || "";
	return [home, ...parts].join("/");
}

/**
 * Read the effective editorPaddingX setting (project overrides global,
 * clamped 0-3 like pi's own setEditorPaddingX). Throttled to 1s so
 * mid-session /settings changes are picked up without per-frame I/O.
 */
let lastPaddingRead = 0;
let cachedPadding = 0;

function readEditorPaddingX(now: number): number {
	if (now - lastPaddingRead < 1000) return cachedPadding;
	lastPaddingRead = now;
	let value: number | undefined;
	try {
		const global = JSON.parse(readFileSync(joinHome(".pi", "agent", "settings.json"), "utf8")) as {
			editorPaddingX?: number;
		};
		value = global.editorPaddingX;
	} catch {
		// ignore
	}
	try {
		const project = JSON.parse(readFileSync(joinHome(".pi", "settings.json"), "utf8")) as {
			editorPaddingX?: number;
		};
		if (project.editorPaddingX !== undefined) value = project.editorPaddingX;
	} catch {
		// No project settings - global applies
	}
	cachedPadding = Math.max(0, Math.min(3, Math.floor(value ?? 0)));
	return cachedPadding;
}

// ---------------------------------------------------------------------------
// Extension
// ---------------------------------------------------------------------------

export default function (pi: ExtensionAPI) {
	let ctx: ExtensionContext | null = null;

	pi.on("session_start", async (_event, c) => {
		ctx = c;
		c.ui.setWorkingIndicator({
			frames: SPINNER_FRAMES,
			intervalMs: SPINNER_INTERVAL_MS,
		});

		const autoCompactEnabled = readAutoCompactEnabled();

		c.ui.setFooter((tui, theme, footerData) => {
			const unsubscribe = footerData.onBranchChange(() => tui.requestRender());

			return {
				dispose: unsubscribe,
				invalidate() {},
				render(width: number): string[] {
					if (!ctx) return ["", ""];

					// Follow the editor's horizontal padding: indent footer lines by
					// editorPaddingX and lay out content within the same inner width.
					const editorPadding = readEditorPaddingX(Date.now());
					const inner = Math.max(1, width - editorPadding * 2);

					// Usage totals from all session entries (mirrors built-in footer)
					const totals: UsageTotals = {
						input: 0,
						output: 0,
						cacheRead: 0,
						cacheWrite: 0,
						cost: 0,
					};
					let latestCacheHitRate: number | undefined;
					for (const entry of ctx.sessionManager.getEntries()) {
						if (entry.type === "message" && entry.message.role === "assistant") {
							const m = entry.message as AssistantMessage;
							addUsage(totals, m.usage);
							const latestPromptTokens =
								m.usage.input + m.usage.cacheRead + m.usage.cacheWrite;
							latestCacheHitRate =
								latestPromptTokens > 0
									? (m.usage.cacheRead / latestPromptTokens) * 100
									: undefined;
						} else if (
							entry.type === "message" &&
							entry.message.role === "toolResult" &&
							entry.message.usage
						) {
							addUsage(totals, entry.message.usage);
						} else if (
							(entry.type === "branch_summary" || entry.type === "compaction") &&
							entry.usage
						) {
							addUsage(totals, entry.usage);
						}
					}

					// Context usage
					const contextUsage = ctx.getContextUsage();
					const contextWindow =
						contextUsage?.contextWindow ?? ctx.model?.contextWindow ?? 0;
					const contextPercentValue = contextUsage?.percent ?? 0;
					const contextPercent =
						contextUsage?.percent !== null ? contextPercentValue.toFixed(1) : "?";

					// pwd line: cwd + git branch + session name
					let pwd = formatCwdForFooter(
						ctx.sessionManager.getCwd(),
						process.env.HOME || process.env.USERPROFILE,
					);
					const branch = footerData.getGitBranch();
					if (branch) pwd = `${pwd} (${branch})`;
					const sessionName = pi.getSessionName();
					if (sessionName) pwd = `${pwd} • ${sessionName}`;

					// Stats parts joined with " • "
					const statsParts: string[] = [];
					if (totals.input) statsParts.push(`↑${formatTokens(totals.input)}`);
					if (totals.output) statsParts.push(`↓${formatTokens(totals.output)}`);
					if (totals.cacheRead) statsParts.push(`R${formatTokens(totals.cacheRead)}`);
					if (totals.cacheWrite) statsParts.push(`W${formatTokens(totals.cacheWrite)}`);
					if (
						(totals.cacheRead > 0 || totals.cacheWrite > 0) &&
						latestCacheHitRate !== undefined
					) {
						statsParts.push(`CH${latestCacheHitRate.toFixed(1)}%`);
					}
					const usingSubscription = ctx.model?.provider === "kimi-coding";
					if (totals.cost || usingSubscription) {
						const costStr = `$${totals.cost.toFixed(3)}${usingSubscription ? " (sub)" : ""}`;
						statsParts.push(costStr);
					}

					// Context percentage with custom thresholds:
					//   < 60% normal, 60-80% warning, > 80% error
					const autoIndicator = autoCompactEnabled ? " (auto)" : "";
					const contextPercentDisplay =
						contextPercent === "?"
							? `?/${formatTokens(contextWindow)}${autoIndicator}`
							: `${contextPercent}%/${formatTokens(contextWindow)}${autoIndicator}`;
					let contextPercentStr: string;
					if (contextPercentValue > 80) {
						contextPercentStr = theme.fg("error", contextPercentDisplay);
					} else if (contextPercentValue > 60) {
						contextPercentStr = theme.fg("warning", contextPercentDisplay);
					} else {
						contextPercentStr = contextPercentDisplay;
					}
					statsParts.push(contextPercentStr);

					let statsLeft = statsParts.join(" • ");
					let statsLeftWidth = visibleWidth(statsLeft);

					// Right side: model name + effort (thinking level)
					const modelName = ctx.model?.id || "no-model";
					let rightSideWithoutProvider = modelName;
					if (ctx.model?.reasoning) {
						const thinkingLevel = ctx.thinkingLevel || "off";
						// Effort text colored like the text input border:
						// borders are per-thinking-level, fall back to "border" when off
						const color =
							thinkingLevel === "off"
								? (s: string) => theme.fg("border", s)
								: theme.getThinkingBorderColor(thinkingLevel);
						rightSideWithoutProvider =
							thinkingLevel === "off"
								? `${modelName} • ${color("thinking off")}`
								: `${modelName} • ${color(thinkingLevel)}`;
					}
					let rightSide = rightSideWithoutProvider;
					if (footerData.getAvailableProviderCount() > 1 && ctx.model) {
						rightSide = `(${ctx.model.provider}) ${rightSideWithoutProvider}`;
						if (statsLeftWidth + 2 + visibleWidth(rightSide) > inner) {
							rightSide = rightSideWithoutProvider;
						}
					}

					// Truncate stats if needed
					if (statsLeftWidth > inner) {
						statsLeft = truncateToWidth(statsLeft, inner, "...");
						statsLeftWidth = visibleWidth(statsLeft);
					}

					const rightSideWidth = visibleWidth(rightSide);
					const totalNeeded = statsLeftWidth + 2 + rightSideWidth;
					let statsLine: string;
					if (totalNeeded <= inner) {
						const padding = " ".repeat(inner - statsLeftWidth - rightSideWidth);
						statsLine = statsLeft + padding + rightSide;
					} else {
						const availableForRight = inner - statsLeftWidth - 2;
						if (availableForRight > 0) {
							const truncatedRight = truncateToWidth(rightSide, availableForRight, "");
							const truncatedRightWidth = visibleWidth(truncatedRight);
							const padding = " ".repeat(
								Math.max(0, inner - statsLeftWidth - truncatedRightWidth),
							);
							statsLine = statsLeft + padding + truncatedRight;
						} else {
							statsLine = statsLeft;
						}
					}

					// Dim parts independently (colored sections end with reset codes)
					const dimStatsLeft = theme.fg("dim", statsLeft);
					const remainder = statsLine.slice(statsLeft.length);
					const dimRemainder = theme.fg("dim", remainder);
					const pwdLine = truncateToWidth(
						theme.fg("dim", pwd),
						inner,
						theme.fg("dim", "..."),
					);
					const lines = [pwdLine, dimStatsLeft + dimRemainder];

					// Extension statuses line
					const extensionStatuses = footerData.getExtensionStatuses();
					if (extensionStatuses.size > 0) {
						const sortedStatuses = Array.from(extensionStatuses.entries())
							.sort(([a], [b]) => a.localeCompare(b))
							.map(([, text]) => sanitizeStatusText(text));
						const statusLine = sortedStatuses.join(" ");
						lines.push(truncateToWidth(statusLine, inner, theme.fg("dim", "...")));
					}

					// Apply the editor padding on both sides
					const leftPad = " ".repeat(editorPadding);
					const rightPad = " ".repeat(Math.max(0, width - editorPadding - inner));
					return lines.map((line) => `${leftPad}${line}${rightPad}`);
				},
			};
		});
	});

	pi.on("turn_start", async (_event, c) => {
		ctx = c;
		// Working text in the spinner color
		c.ui.setWorkingMessage(colorize(pickRandom(), WORKING_COLOR_HEX));
	});

	pi.on("turn_end", async (_event, c) => {
		c.ui.setWorkingMessage(); // Reset for next time
	});
}
