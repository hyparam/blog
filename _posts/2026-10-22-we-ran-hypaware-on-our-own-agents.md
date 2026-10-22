---
layout: post
title: "We ran HypAware on our own agents. Here's what it found, and what we fixed."
description: "Our own software factory is HypAware's first user. It still found a fleet that had quietly stopped, a skill that broke behind a green test suite, and a missing binary agents worked around for weeks."
date: 2026-10-22 09:00:00 -0700
author: "Hernan Alvarez"
categories: [engineering]
tags: [hypaware, coding-agents, agent-sessions, claude-code, codex, LLM-logs]
image: /assets/images/banner-hypaware-own-agents.jpg
banner_image: /assets/images/banner-hypaware-own-agents.jpg
banner_alt: "Rows of agent sessions flowing left to right, with stalled, looping, and failing steps highlighted in red and fixed paths ending in green checks"
banner_color: "#262836"
keywords: [HypAware, coding agents, agent sessions, Claude Code, Codex, agent observability, LLM logs, software factory]
---

Our agents do most of their work overnight, and nobody reads those sessions. Hyperparam runs a software factory: Claude Code and Codex agents working through issues and PRs around the clock. We build [HypAware](https://hypaware.ai), and our own factory is its first user, so it records every one of those sessions. Even in our own factory, where the people who built the tool are the ones watching, the PRs kept landing, the tests kept passing, and nothing threw an error. HypAware still found a fleet that had quietly stopped working, a skill that broke behind a green test suite, and a missing binary that agents had been working around for weeks. Each finding came with evidence and a fix, and the next pass checked whether the fix held. Here's what it found, and what we did about each.

## 1. The fleet stopped for 171 hours, and nothing said so

**What it found:** In the first half of September, our unattended fleet hit its account's usage limits twice. Each time, every wake-up got the same one-line refusal and no work got done, for about 171 of 384 hours. Nothing watching the fleet noticed. The watchdog was an agent on the same account, so it got the same refusal. A monitor that checked whether the processes were alive reported "all five loops running" while no work happened. People only found out by asking.

**What it recommended:** A check that lives outside the account: a small script beside the fleet's existing outage sentinel that recognizes the limit message, posts once to Slack with the reset time, and holds relaunches until then. It named the alternative, switching automatically to a second account, and argued for the alert first: switching moves spend without changing the rate that hit the limit, and knowing within the hour would have saved most of the 171 hours.

**What happened:** HypAware raised it three times, in passes published Sep 18, Sep 22 and Oct 5. We finally got around to addressing it on Oct 12 when we did a refactor of our software factory. Our replacement fleet was built with the alert outside the account: a Slack notifier that doesn't use Claude or its credentials. It warns at 95% and 100% of the weekly and five-hour limits, so it alerts even if the models go down. We built the alternative too: on a confirmed limit rejection, requests switch to the second account and retry before any response streams. The recordings show both firing for real. A 95% warning posted on Oct 12, the day it went live. On Oct 16 the fleet switched accounts on its own and said so in Slack. Since we applied the HypAware-suggested change, the recordings show no stretch of downtime.

## 2. A green test suite that missed a regression

**What it found:** On Oct 13 an agent tidied up the description of HypAware's own query skill, replacing 15 example trigger phrases with a shorter summary. The static test kept passing: "11 checks passed." But a fresh agent asked a history question and failed to load the HypAware skill. The phrases it removed were the ones that make an agent reach for HypAware in the first place.

**What it recommended:** Commit the live routing check as a repo script with an eight-prompt table, require it for any skill description change, and add a static assertion that the 15 cues stay.

**What happened:** We filed an issue on GitHub and kicked off an agent to look at fixing it. The agent found that the runner, with its full build history, was sitting in HypAware the whole time. So the scope of the fix shrank. Instead of a new repo script, a seven-line rule went into AGENTS.md: when you edit a skill description, preserve its discovery triggers and bring fresh-session evidence that routing still works, or say plainly that it's unverified. Merged Oct 16 at 04:35 UTC.

The evidence corrected the finding. That's what the recordings are for.

## 3. The same small problem, found six times

**What it found:** In the first twelve days of August, 132 commands failed in the unattended fleet's container with `python3: command not found`, across 42 sessions. The impact was time lost of about 28 minutes, in addition to token burn, and possibly affecting response quality.

**What it recommended:** Six lines in the container's CLAUDE.md: python3 isn't installed, read the file and use the Edit tool, use `node -e` or `sed` for throwaway processing. It named installing python3 as the alternative and argued against it: with python3 available, quick regex rewrites of source files from the shell would stay the normal way agents change code.

**What happened:** At first, nobody did anything, and the fleet grew. So did the failures: 293 in August, 2,423 in September, 263 in the first five days of October. HypAware reported the same finding five more times, each with a sharper number. One of those passes found the best evidence for the fix: where a loop's briefs did state the python3 fact, failures dropped to 0 or 1 per 5,000 commands.

On Oct 6 the failures stopped. We took the alternative the recommendation had argued against and gave the container python3 after checking our sandboxing configuration. The recordings show the switch: 570 python3 calls on Oct 6 and 394 on Oct 7, with zero failures.

We didn't do what the recommendation said, and that's fine: its job was to make the problem impossible to keep ignoring, and the recordings are what confirmed the fix held.

## What this looks like from the outside

A fleet sat idle for days while its monitor reported every loop running. A skill lost its triggers behind a passing test suite. A container was missing a binary for two months while the agents improvised around it. From the outside, all three looked like a normal week.

It's 6 AM. Do you know what your agents did last night?

[HypAware](https://hypaware.ai) is the improvement loop for all your agents. It collects every session from Claude Code, Codex, Cursor, OpenCode, OpenClaw, Hermes, Pi, and more, stores them as open table files on your machine, and hands back what's broken, the evidence, the fix, and whether it stayed fixed.

```
npm i -g hypaware
hyp setup
```

Or hand it to your agent:

```
Install HypAware using npm i -g hypaware, then run hyp setup --guide and follow its instructions.
```

It reads the sessions already on your machine.
