---
layout: post
title: "What wasted tool calls revealed about my LLM's behavior"
description: "Wasted tool calls usually look harmless because the LLM self-corrects and finds a new path. However, they still add cost, latency and noise to the trace."
date: 2026-03-25 12:00:00 -0800
author: "Brendan McMullen"
categories: [engineering, llm]
tags: [wasted-tool-calls, failed-tool-calls, agent-traces, LLM-logs, prompt-debugging, AI-agent-debugging]
image: /assets/images/banner-wasted-tool-calls.jpg
banner_image: /assets/images/banner-wasted-tool-calls.jpg
banner_alt: "Wasted tool calls"
banner_color: "#000000"
keywords: [wasted tool calls, failed tool calls, agent traces, LLM logs, prompt debugging, tool call failures, AI agent debugging, trace noise]
canonical_url: https://hyperparam.app/blog/wasted-tool-calls-in-llm-logs-are-worth-debugging
---

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://hyperparam.app/blog/wasted-tool-calls-in-llm-logs-are-worth-debugging#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a wasted tool call?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A wasted tool call is a tool call that sends the model down an unhelpful path. The model may still recover, but the failed or unnecessary call adds cost, latency or noise to the trace."
      }
    },
    {
      "@type": "Question",
      "name": "Why are wasted tool calls worth debugging?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A wasted tool call can look harmless if the model self-corrects and the run succeeds on a later attempt. It still adds cost, latency and noise to the trace, and it can expose a prompt issue or failure pattern that keeps repeating across the dataset."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between required and avoidable failed tool calls?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Some failed tool calls are required because the agent has to make the call to retrieve information it does not have. A file lookup may fail because the file does not exist, or a path check may fail because the path is wrong. Other failed tool calls are avoidable because the prompt is inaccurate or not specific enough, which leads the model down an unhelpful path."
      }
    },
    {
      "@type": "Question",
      "name": "Why can a successful run still contain wasted tool calls?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Because the model can self-correct after a failed or unhelpful tool call and still reach a usable result. The run may succeed, but the trace still includes the extra failure, extra calls and extra work that made the path slower, noisier and more expensive."
      }
    },
    {
      "@type": "Question",
      "name": "What do wasted tool calls usually indicate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "They usually indicate that the prompt or call specification needs work. The model may recover, but the wasted call still weakens the signal on whether the prompt is well specified and whether the system is behaving efficiently."
      }
    }
  ]
}
</script>

We've all seen it happen: the LLM starts going down the wrong path and makes dozens of failed or wasted tool calls that don't actually get it closer to its goal.

Even though models can self-correct and find a new path on a subsequent retry, self-correction can hide repeated failures that make the agent slower, more expensive and more difficult to evaluate across the dataset. In this post, I look at what wasted tool calls do to the trace, when retries are required and when they're avoidable, and the cost of avoidable failures in practice.

Need the workflow? See my step-by-step guide for [debugging wasted tool calls in LLM logs](https://hyperparam.app/docs/debugging/how-debug-wasted-tool-calls).

## Key takeaways

* Failed tool calls add cost, latency, noise and weaker prompt signal.
* A wasted tool call makes the trace noisier even when the next run succeeds.
* Required retried tool calls help the agent retrieve information it didn't have.
* Avoidable retries usually stem from prompts that are inaccurate or not specific enough.
* If the model keeps self-correcting and eventually finds a new path, the trace can look healthier than the prompt really is.

## A wasted tool call produces a noisy trace

Even when the tool call eventually finds a new path, it doesn't erase the earlier failure(s). The trace still shows the failed calls and the subsequent successful one. This makes it harder to review the run and determine whether the agent reached the result efficiently. In a production dataset, that pattern can repeat across many traces, even when the final outputs look fine.

## Required retries vs. avoidable retries

Some tool-call failures calls are required because the agent has to make the call to retrieve information it doesn't have. If a file lookup fails because the file doesn't exist, that failure may still be useful because it tells the agent something it needed to know. A path check can work the same way. Other calls are genuine failures because the agent queried the wrong file, took a dead-end path or went down a rabbit hole. The line between these cases can be fuzzy.

Other failed tool calls are avoidable. These occur when the prompt is inaccurate or not specific enough. Think of incorrect parameters, wrong attribute names on objects and shell syntax issues such as unescaped pipe characters.

## The hidden cost of failed tool calls in agent traces

Wasted tool calls that are avoidable hide costs that are easy to miss if you only look at whether the run succeeded:

* **More cost:** more calls mean more tokens, more compute and more spend
* **More latency:** retries slow the agent down even when the run succeeds
* **More trace noise:** the extra failure and retry make the trace harder to review
* **More unhelpful work:** the model may recover on a subsequent attempt, but it still spends extra calls on a path that was never going to help
* **Weaker prompt signal:** recovery masks prompt defects, so a successful run is a weaker indicator of whether the prompt is doing what you think it is

For my step-by-step workflow, see [how to debug wasted tool calls in LLM logs](https://hyperparam.app/docs/debugging/how-debug-wasted-tool-calls).

## FAQ

**Why are failed tool calls in LLM logs worth debugging?**

Failed tool calls in LLM logs are worth debugging because although the model may correct itself and find a new path on a subsequent attempt, the retry still adds cost, latency and noise to the trace. The failure can also point to a prompt issue that keeps repeating across the dataset.

**Why does a retried tool call produce a noisy trace?**

A retried tool call produces a noisy trace because the successful call doesn't erase the failed one that came before it even though the run eventually succeeds. This makes reviewing the trace and diagnosing issues more difficult.

**What's the difference between wasted tool calls that are required and ones that are avoidable?**

Some failed tool calls are required because the failure provides the model with new information, for example, that a file doesn't exist or a path is wrong. Avoidable retries happen when the prompt is inaccurate or not specific enough, which leads to underspecified tool calls.

**When a wasted tool call is avoidable, what does that usually indicate?**

When a failed tool call is avoidable, the prompt usually needs to be updated. The unnecessary noise in the trace weakens the signal on whether the prompt is well specified.
