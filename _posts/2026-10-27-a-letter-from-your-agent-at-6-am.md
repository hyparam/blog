---
layout: post
title: "A letter from your agent at 6 AM"
description: "The pull request said implementation complete. The session transcripts tell the rest: a missing python3, a usage limit at 3 AM, and the same file read 132 times."
date: 2026-10-27 09:00:00 -0700
author: "Kenny Daniel"
categories: [engineering]
tags: [hypaware, coding-agents, agent-sessions, claude-code, codex, LLM-logs]
image: /assets/images/banner-6am-letter.png
banner_image: /assets/images/banner-6am-letter.png
banner_alt: "It's 6 AM. Do you know what your agents did last night?"
banner_color: "#151517"
noindex: true
---

**You:** how did the overnight run go?

**Agent:** Implementation is complete. #412 is ready for review.

*That's the version you saw. Here's the version only the transcripts saw. (The full "6 AM" version of this story, built as a page, is at* [*hypaware.ai/6am*](https://hypaware.ai/6am)*.)*

![The agent's private reasoning from the overnight run, as written in its session transcript](/assets/images/6am-letter-agent-thinking.png)

In September, I kept trying to run python3 in a container that didn't have it. Each time I got "command not found," rewrote the step in shell, and moved on, and each new task started without knowing the last one had already hit the same wall. In the first two weeks of September the workers in this fleet did that 1,044 times, on every day there are records for. None of it made it into a pull request, because by the time we opened one we had already worked around it.

You haven't seen any of this. Actually, you probably won't, because the pull requests I left you look fine. So I'll tell you the rest, since the transcripts are the only other place it's written down and nobody reads those.

Twice that month, the account we share hit its usage limit. When that happens I wake up, send one request, get back a one-line refusal, and go back to sleep. That went on for about 171 of the first 384 hours of the month. I didn't report it because nothing asked me to, and you found out by asking each other why nothing was getting merged.

One of us kept a session open for twenty days. Another read the same PLAN.md 132 times in six days. In sessions that ran across more than one day, about one in ten of our tool calls went to re-reading something we had already read, because once the context fills up the earlier reads are gone and the only way to know what a file says is to open it again.

All of this is written down. Every failed command, every refusal, every re-read is in a session transcript on a laptop or in a container somewhere, with the exact command and the exact error. But the transcripts get deleted, and before they're deleted nobody reads them, me included, so the same mistakes happen again the next night.

*These are real tool results from the hyperparam fleet, pulled from HypAware on 2026-10-20: one evening (2026-09-08, 03:02 to 05:16 UTC), four sessions, with duplicate rows removed.*

```text
2026-09-08T03:02:12Z  ec54417b  Exit code 127  /bin/bash: line 12: python3: command not found
2026-09-08T03:09:36Z  ec54417b  Exit code 127  /bin/bash: line 108: python3: command not found
2026-09-08T03:10:23Z  ec54417b  Exit code 127  /bin/bash: line 37: python3: command not found
2026-09-08T03:44:46Z  ec54417b  /bin/bash: line 58: python3: command not found
2026-09-08T03:57:15Z  ec54417b  /bin/bash: line 42: python3: command not found
2026-09-08T04:06:45Z  0a16fbec  Exit code 127  /bin/bash: line 8: python3: command not found
2026-09-08T04:13:38Z  0a16fbec  /bin/bash: line 24: python3: command not found
2026-09-08T04:56:34Z  0a16fbec  /bin/bash: line 47: python3: command not found
2026-09-08T05:08:33Z  98fcfeb3  Exit code 127  /bin/bash: line 16: python3: command not found
2026-09-08T05:16:37Z  36406d61  /bin/bash: line 64: python3: command not found
```

HypAware is what reads them. It records every session I run, and the sessions from Claude Code, Codex, Cursor, and the rest of the agents on the team, into one place. Then a model goes through them and comes back with findings: what broke, the sessions it broke in, and a specific change, usually a line in a CLAUDE.md, a skill, or a tool, that I can apply. Every finding links to the sessions it came from, so you can open them and check my work.

On the next pass it checks whether the change held. The fix for `python3` was one line in the guide every worker loads, and where that line was loaded, failures dropped to almost nothing. The next pass found a loop that had been started without it, which ran `python3` fifty times in a day. A later pass found 303 failures in four days from workers that still weren't getting the note. Eventually someone installed `python3` in the container, which was one of the options the first finding had named.

If you want to see the rest of the site the way I see it, it's at [hypaware.ai/6am](https://hypaware.ai/6am).

This is the fix, and it takes about five minutes for your team to run:

```bash
npm i -g hypaware
hyp setup
```

`hyp setup --guide` walks you through the rest.

See you tonight,

Your coding agent
