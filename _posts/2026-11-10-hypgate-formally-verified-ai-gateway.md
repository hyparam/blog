---
layout: post
title: "HypGate: building the first formally verified AI gateway"
description: "HypGate is an open-source AI gateway written in Rust whose core is proved correct with Verus. What we proved, how models wrote the proofs, and the bugs the proofs still missed."
date: 2026-11-10 09:00:00 -0800
author: "Kenny Daniel"
categories: [engineering]
tags: [hypgate, formal-verification, verus, rust, ai-gateway, coding-agents]
image: /assets/images/banner-hypgate.jpg
banner_image: /assets/images/banner-hypgate.jpg
banner_alt: "A stone portal on a mountaintop opening onto an endless field of tokens"
banner_color: "#7a8fa9"
keywords: [HypGate, AI gateway, LLM gateway, formal verification, Verus, Rust, LiteLLM, audit log, HypAware]
---

More and more companies route all of their AI traffic through a gateway, so they can manage keys, track spend, and keep a record of what their agents did. That makes the gateway one of the most critical pieces of AI infrastructure a company runs. It holds every provider API key, and it sees every prompt and every response, which means source code, customer data, and whatever else people paste into a model. That's exactly what makes it a target, and LiteLLM, one of the most widely used open-source gateways, was compromised twice this year.

On October 27 we released HypGate, the first formally verified AI gateway. It sits between your agents and the model provider, passes requests and responses through byte for byte, and writes every exchange to an audit log on disk, in S3, or in HypAware. It's written in Rust, the core is proved correct with Verus, and it's [MIT licensed on GitHub](https://github.com/hyparam/HypGate)

We wanted a gateway we could recommend to HypAware users for recording agent traffic, and after LiteLLM we weren't comfortable asking anyone to put a large codebase they can't check in front of all their keys and data. So we set out to build one small enough that you could prove what it does. The work of proving code grows with every line and every dependency, so we kept the gateway to forwarding the bytes and writing down what happened, and cut everything else. HypGate proves three things:

1. Data only goes where you configured it.
2. Request and response bodies pass through unchanged, and the audit log records exactly what was forwarded and how the request ended.
3. The core can't panic or overflow, and a crash never loses an acknowledged log record.

Formal verification with reproducible builds could help with attacks like LiteLLM's because the check is automatic. Anyone can rerun the proofs that the code only sends data where you configured it, rebuild from the same source, and compare the hash with the binary they're running. That doesn't make the gateway perfectly secure, since TLS and the OS are still trusted, but a release that had been tampered with to send data somewhere else would fail that check.

We built it over about a week, with Codex and Claude writing nearly all of the code and the proofs. HypAware recorded 55 sessions and about 1.4 billion tokens across the two, almost all of it cached input, with 12 million fresh input and 7 million output. Most of the work went into making sure the proofs said something that matters, and getting Verus to accept them was comparatively easy.

![Cumulative tokens used building HypGate, Claude and Codex, October 23 to November 3]({{site.baseurl}}/assets/images/hypgate-tokens.png)

### Picking what to prove

Left to themselves, the models write narrow proofs. A batch never exceeds 5000 rows. The upload cursor only advances when the server acknowledges the exact batch in flight. These are true and worth having, but they're really generalized unit tests about one function. When I asked Codex what we had proved about shipping logs to HypAware, it listed six properties like that, and none of them answered what a user actually wants to know: is it correct, does it only send my data where I told it, and does it survive a crash?

So those became the three guarantees, and the job from then on was tying every narrow proof up to one of them, and deleting proofs that didn't serve any. This took constant prompting. Whenever the model works on a specific function, it drifts back to proving local properties of that function, and I'd have to pull it back to the whole-program claim.

### Proved, and still buggy

Once everything verified, I started opening fresh Codex sessions and asking it to find bugs in HypGate. Over October 27 and 28 I ran eight rounds and it turned up fourteen real bugs, each reproduced with a failing test. A few of them:

- 204 responses carried a Content-Length header, which HTTP forbids.
- When a provider reported null token usage, we recorded zero.
- An error event inside a streaming response with HTTP status 200 was recorded as a success.
- With multiple completion choices in one stream, the text from different choices got interleaved.

After each round I asked why the proofs didn't catch it, and the answer was almost always the same. The code did exactly what the spec said, and the spec was wrong or incomplete. We had proved that every fixed response gets a Content-Length, and that rule was the bug. We had proved that the code turning a streaming response into log rows produces valid, bounded text, and never said text has to stay with the choice it came from. A verifier checks that the implementation matches the spec, and it has no way to tell you the spec is what you meant.

Patching each case would have meant chasing special cases forever, so I kept asking for general proofs instead. One bug was a client upload that used a longer timeout than the exchange it belonged to. We already had a "no stall" proof, but it only checked that each operation respected the deadline it was handed. The fix was to prove that every blocking operation draws from one shared budget for the whole exchange.

Another bug leaked sockets when connection setup failed because the process ran out of file descriptors, and that fix was a proof that every exit path releases everything it owns. Each of these closes a whole class of bugs at once. This issue came up repeatedly, and my most common feedback to the model was "why didn't our proofs catch this??"

We also run mutation testing, where a script deliberately breaks the code and confirms Verus rejects each broken version, because a proof that still passes on broken code isn't proving anything. There are 735 mutations now, and checking the proofs themselves takes about five seconds for the whole core.

### What the proof doesn't cover

The proofs cover the logic in the core, which is parsing, routing, what gets logged, and cancellation. The I/O happens in a thin runtime around it that handles sockets, TLS, files, threads, and clocks. That runtime is tested and audited but it isn't verified, and some bugs lived there. The `ship` command panicked because it started a Tokio runtime inside another one. TLS could keep reading slowly trickled bytes internally and stretch a 150 ms deadline past a second. The client watcher treated a client that had finished sending as disconnected and cancelled its response, so the verified cancellation logic worked correctly on a signal the runtime got wrong.

Below that are assumptions no proof here can remove: the Rust standard library, the OS network and disk calls, and storage that actually honors fsync. [PROOFS.md](https://github.com/hyparam/HypGate/blob/master/PROOFS.md) lists each of them, along with the places where the proved parts aren't yet connected into one proof of the whole program.

Every dependency is more code outside the proof, so we cut them as we went. On October 25 we replaced Hyper with our own verified HTTP/1.1 codec and dropped Tokio for plain blocking threads. On October 26 we verified our own SHA-256 and dropped the sha2 crate. The runtime now depends on rustls, webpki-roots, and getrandom, and TLS is the biggest piece left outside.

### What we learned

If you're thinking about formally verifying your own software, write the high-level claims first, in plain English, and keep asking the model which claim each proof serves. Then keep hunting bugs after it's proved, because every bug we found pointed at a rule we'd written too narrowly or a requirement we never wrote down.

The same approach should work for other small pieces of infrastructure that hold a lot of trust: anything that handles keys, moves sensitive data, or writes an audit log people rely on. Models make it cheap enough to try now, as long as someone keeps asking whether the proofs say what you meant.

HypGate is one part of the stack we're building for AI observability. The code and proofs are at [github.com/hyparam/HypGate](https://github.com/hyparam/HypGate).
