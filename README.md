# Pi Stuff

Gabriel's personal [Pi Coding Agent](https://buildwithpi.ai/) package: reusable skills, extensions, prompt commands, and themes that I use across projects.

The Pi package manifest in [`package.json`](package.json) exports:

- [`extensions`](extensions) as Pi extensions
- [`skills`](skills) as agent skills
- [`themes`](themes) as Pi themes
- [`commands`](commands) as prompt commands

## Installation

Install this package into Pi:

```bash
pi install git:github.com/Gabriel-Cervo/Pi-Stuff
```

Additional packages used alongside it (installed separately, see sections below):

```bash
pi install npm:pi-web-access
pi install npm:@juicesharp/rpiv-ask-user-question
pi install npm:@ff-labs/pi-fff
pi install git:github.com/mattpocock/skills
```

## Prompt Commands

Prompt commands live in [`commands`](commands). Nothing here yet.

## Skills

Skills live in [`skills`](skills). Each skill is a directory with a `SKILL.md` plus any helper scripts it needs.

- [`herdr`](skills/herdr/SKILL.md) - Control Herdr, a terminal multiplexer for coding agents. Vendored from [herdrdev/herdr](https://github.com/herdrdev/herdr) v0.8.0.

The [Matt Pocock skills](https://github.com/mattpocock/skills) (engineering, productivity, misc) are installed directly from their repo so they stay in sync:

```bash
pi install git:github.com/mattpocock/skills
```

The package is configured in `~/.pi/agent/settings.json` to exclude the `in-progress` and `deprecated` skills:

```json
{
  "source": "git:github.com/mattpocock/skills",
  "skills": ["!skills/in-progress/**", "!skills/deprecated/**"]
}
```

## Extensions

Pi extensions live in [`extensions`](extensions):

- [`working-status.ts`](extensions/working-status.ts) - Claude Code-style ping-pong working spinner and whimsical working messages in Catppuccin sapphire, plus a custom footer: effort text (thinking level) colored like the input border, context % thresholds (normal < 60%, warning 60-80%, error > 80%), ` • ` separators, and editor padding.

Third-party extensions installed separately from npm:

- [`pi-web-access`](https://pi.dev/packages/pi-web-access) - Web search, URL fetching, video understanding.
- [`@juicesharp/rpiv-ask-user-question`](https://pi.dev/packages/@juicesharp/rpiv-ask-user-question) - `ask_user_question` structured questionnaire tool.
- [`@ff-labs/pi-fff`](https://pi.dev/packages/@ff-labs/pi-fff) - FFF-powered fuzzy file and content search, replacing `find`/`grep`.

```bash
pi install npm:pi-web-access
pi install npm:@juicesharp/rpiv-ask-user-question
pi install npm:@ff-labs/pi-fff
```

## Themes

Custom themes live in [`themes`](themes):

- [`catppuccin-latte`](themes/catppuccin-latte.json) - Catppuccin Latte (light), from Ghostty

## License

MIT
