---
layout: post
title: "Launching HypAware"
description: "HypAware records the sessions from your team's coding agents, reads them, tells you what to change so the agents work better, and checks later that the change is still working."
date: 2026-10-01 09:00:00 -0700
author: "Kenny Daniel"
categories: [announcements]
tags: [hypaware, coding-agents, agent-sessions, claude-code, codex, LLM-logs]
image: /assets/images/banner-hypaware-launch.jpg
banner_image: /assets/images/banner-hypaware-launch.jpg
banner_alt: "A row of coding agent sessions streaming data up into HypAware Cloud"
banner_color: "#101012"
keywords: [HypAware, coding agents, agent sessions, Claude Code, Codex, Cursor, agent observability, LLM logs]
---

Today we're launching [HypAware](https://hypaware.ai), a new product from Hyperparam. The problem with agents is that the more autonomous they become, the less we know what they're doing. HypAware records the sessions from Claude Code, Codex, Cursor, OpenCode, Pi, and the other agents your team runs, reads them, and tells you what to change so the agents work better. Then it checks later that the change is still working.

We built it because of what we kept finding in our own logs. We run a small software factory at Hyperparam: a fleet of coding agents, some working alongside us during the day and some running unattended in containers overnight, picking up tasks and opening pull requests. In the first half of September, those overnight workers tried to run `python3` on a container that doesn't have `python3`. That failed 1,044 times, on every day we have records for, and none of us noticed. The agents found other ways to get the work done, and the pull requests looked fine in the morning.

The same two weeks, the fleet hit our account's usage limit twice. Nothing in the fleet reported it. For about 171 of the 336 hours, every worker that woke up got a one-line refusal and went back to sleep. We found out by asking each other why nothing was getting merged.

I've looked at more LLM logs than any human should, and I see this at every team. Each agent session is a full record of what the AI was asked, what it tried, which tools failed, and what it produced. Almost nobody keeps these records. They sit on laptops and in CI containers until they're deleted. So nobody can say which prompts and tools work, where agents quietly fail, or whether the rest of the team is hitting a problem one person has already fixed.

HypAware does four things:

- **Collect.** A small daemon hooks into each agent and records every session. There's nothing else to instrument.
- **Store.** Sessions are kept in a managed workspace for your team, in an open format, and linked by the files, tools, and skills they touched.
- **Analyze.** SQL and grep narrow millions of sessions down to the ones that matter, and a model reads those and writes up findings. Each finding links to the sessions it came from, so you can check the evidence yourself.
- **Act.** Each finding comes with a specific change, usually a line in a CLAUDE.md, a skill, or a tool, that your agent can apply.

Every pass also re-checks earlier findings, and that has turned out to matter a lot. For our `python3` problem, the fix was one line in the guide every worker loads. Where that line was loaded, failures dropped to zero or one per five thousand commands. The next pass found a loop that had been started without it and ran `python3` fifty times in a day. A later one found 303 failures in four days from workers that still weren't getting the note. The fix was correct, and it still didn't stick, because agents, models, and skills keep changing underneath you.

We've been building HypAware with a few design partners. The main thing they taught us is that collecting a team's sessions is a trust question. Developers can mark sessions or directories as ignored, and those never leave the machine. A privacy review scans what was captured for secrets before anything syncs. Each person also gets their own report, so the first person to see how they work is them.

It's free and takes about five minutes to set up on one machine:

```bash
npm i -g hypaware
hyp setup
```

For a team, get started at [hypaware.ai](https://hypaware.ai). If you run a team on Claude Code or Codex, I'd like to hear what it finds.
