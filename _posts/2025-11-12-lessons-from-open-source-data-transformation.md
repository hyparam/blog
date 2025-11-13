---
layout: post
title: "Lessons from Hyperparam's Year of Open-Source Data Transformation"
description: "Hyperparam's founder explains what a year of open source data transformation taught him about balancing community and development in the AI era."
date: 2025-11-12 00:00:00 -0800
author: "Diego Oppenheimer"
categories: [open-source, product, AI]
tags: [open-source, data-transformation, Hyperparam, Hyparquet, HighTable, HyLlama, community, product-development, AI-workflows, browser-native, startup, engineering-philosophy, interview]
image: /assets/images/banner-interview.jpg
banner_image: /assets/images/banner-interview.jpg
banner_color: "#000000"
keywords: [Hyperparam data transformation, open source data transformation, AI data tools, browser-native data, data transformation tool, Hyparquet, HighTable, HyLlama]
seo:
  title: "Lessons from Hyperparam's year of open source data transformation"
schema:
  type: Article
  about:
    - Hyperparam
    - Hyparquet
    - HighTable
    - HyLlama
  mentions:
    - ChatGPT
    - Jupyter
    - Visual Studio Code
    - Copilot
    - Hugging Face
    - Snowflake
    - Databricks
---

#### I sat down with my former cofounder, Kenny Daniel, to talk about his new startup Hyperparam

Hyperparam is an AI-powered data transformation tool that lets users and an army of AI agents look at, transform, score, and filter massive datasets instantly. As Kenny puts it, “It’s like a Swiss Army knife for your data.” It’s built on an ecosystem of open source data transformation libraries that power its paid app, which delivers the full Hyperparam experience.

Unlike most products that start with an enterprise focus and chase a single proof of concept, Kenny, as I’ve always known him to do, chose his own path. His thesis: Starting from open source is a better, faster way to build a product. In this interview, he shares his take on the open source community, product development in the new world of AI, and how Hyperparam took an intentional approach to open and closed source development.

# Key Takeaways:

* Open source development provides faster, more authentic product feedback than traditional enterprise development.
* Hugging Face’s adoption of Hyperparam’s libraries (HyLlama and Hyparquet) validated the browser-native approach and its value for large-scale AI workflows.
* Minimalism in engineering, or building without dependencies, creates faster, more reliable software.
* Building tools you want to use yourself often leads to creating products others didn’t realize they needed.

# Table of Contents:

* [Why Hyperparam Went Open Source](#why-hyperparam-went-open-source)
* [Hyperparam vs. Data Visualization Tools](#hyperparam-vs-data-visualization-tools)
* [How Hugging Face Validated the Browser-Native Approach](#how-hugging-face-validated-hyperparams-browser-native-approach)
* [What's Open Source and What's Product at Hyperparam](#whats-open-source-and-whats-product-at-hyperparam)
* [AI Workflows That Make Large-Scale Data Transformation Faster](#ai-workflows-that-make-large-scale-data-transformation-faster)
* [Why Minimalism Drives Hyperparam's Engineering Philosophy](#why-minimalism-drives-hyperparams-engineering-philosophy)
* [Advice for Developers Exploring Open Source Projects](#advice-for-developers-exploring-open-source-projects)

# Why Hyperparam Went Open Source

**At our previous company, Algorithmia, we didn’t go open source. What made you decide to do it differently this time?**

I built Hyperparam as the [data transformation tool](https://hyperparam.app/) I wished I had because there wasn’t one that met my criteria. The first version of Hyperparam was a simple browser-based data viewer for Parquet files with some simple data transformation tools. The majority of large datasets for AI training and monitoring are Parquet files, and I just wanted to look at the data and play around with it. But I didn’t think people would pay for a Parquet viewer, so I doubted I’d be shooting myself in the foot by giving it away. If anything, I was going to get all the benefits of usage in the community. So I just put it out there without promoting it.

One of the most compelling arguments for doing open source is because I think it’s fundamentally a better way to build a product and get feedback. If you start building a product straight for the enterprise, it’s a recipe for disaster. You start asking the wrong questions, like, "How do we fit into their workflows?’ rather than asking, “How do we build a product that would see organic adoption?” With open source, people use your software if it’s useful and if it’s not, they don’t. That’s an incredibly valuable signal.

# Hyperparam vs. Data Visualization Tools

**Though you can use Hyperparam to view large datasets, you describe it as a data transformation tool. What makes Hyperparam different from data visualizers?**

Hyperparam lets you instantly view, explore, and transform millions of rows of data, all through a user-friendly, chat-based UI built for scale and usability. So it’s much more than a data visualizer; it’s a data transformation tool.

When I went looking for a data tool, I just wanted to open one dataset. [Jupyter](https://jupyter.org/) was frustratingly slow. ChatGPT, VS Code, Copilot, and other assistants weren’t designed for interacting with massive datasets. And I quickly realized there wasn’t a single tool out there that let me look at any scaled dataset.

That led me on this path, and the question became: What does the interface look like for using AI across data? The answer is Hyperparam. It delivers the power of instant data transformation with the ease and nuance of natural language querying.

# How Hugging Face Validated Hyperparam’s Browser-Native Approach

**Hugging Face is just one of the organizations that started using your libraries HyLlama and Hyparquet. What was the significance of that moment?**

Hugging Face’s adoption of my libraries validated hugely that there was something to my idea of moving more AI workflows to the browser. It was the strongest market signal I’d had up to that point, and it made me start thinking about what else we could build with these components.

For context, Hugging Face is the world’s repository for open models and open data. They use multi-gigabyte files in Llama CCP format, and they wanted to enable the user to simply get the metadata instead of downloading the entire file. HiLlama does exactly that: it pulls the metadata and provides the info the user needs, saving bandwidth, time, and disk space.

After Hugging Face integrated HyLlama into their website, they started looking into Hyparquet.  When they realized it offered many of the same benefits for data, they started integrating it, as well. And it was a great honor that because they support OSS in general and have adopted our libraries, they gave us a substantial open-source grant.

# What’s Open Source and What’s Product at Hyperparam

**You’re launching a paid version of Hyperparam soon. What’s open source and what’s part of the product?**

I’ve already open sourced the parts of Hyperparam that have shared value to the community, and I’ve kept the full product experience (including the AI workflows) within the paid app.

Hyparquet, HighTable, HyLlama are some libraries we’ve released that are building blocks that help others explore data in the browser and also power what we’re building internally. My belief is that connectors, frontend components, writers, readers, and other “glue” components should be open source. They’re globally useful beyond what I’m building and should be shared by the community. But on their own, they’re not the Hyperparam product.

Beyond just thinking about what is useful for the community, there are a few other upsides of open sourcing components. For one, I get to control how the component is optimized and designed, and I can make sure it’s designed to work well with Hyperparam. Secondly, and probably most importantly, there’s the community of developers invested in these components. Approximately a dozen people contributed code to Hyparquet and HighTable, and even more filed bugs that I subsequently fixed. Giving away components doesn’t diminish value; it amplifies it through feedback, goodwill, and contributions.

Now, when thinking about the paid product, any AI component and the core user experience is proprietary. I care deeply how users flow through my product, and I need to own that experience because I don’t think anyone else can build it correctly. That’s a bit of a cocky statement, but my team is a select group of people obsessed with the overall data experience and how the AI should work.

# AI Workflows That Make Large-Scale Data Transformation Faster

**What kind of AI workflows can you do with Hyperparam?**

Hyperparam is a general purpose data transformation tool that enables you to do multiple things with your data, so it’s easiest to give an example.

Let’s say you’re a company that’s deploying a chatbot to your users, and a user files a ticket. Your support team needs to dive into the data to understand what happened, whether it’s sycophancy or some other issue. With Hyperparam, you can apply an LLM-generated score to every row in your dataset, look at the values, filter out the bad ones, transform them into something better, export the results, and just continue with your workflow.

That’s just one example of what Hyperparam can do. In addition to applying AI scores and sorting, filtering, and searching based on those scores, you can ask natural-language questions about your data, for example: “Rate every chatbot conversation for sycophancy,” “Did the user seem satisfied?” or “Was a conclusion reached?” You can categorize, tag, and explore your dataset in ways that were never possible before.

You can also run experiments: import historical data, tweak prompts, compare models, and see how the outputs change. It’s a deep research workflow that lets one person do what used to take an entire team.

# Why Minimalism Drives Hyperparam’s Engineering Philosophy

**What’s your core engineering philosophy and how did open source support that?**

One of my fundamental engineering principles is to take no dependencies. I feel very strongly against building a huge stack of dependent software, which is something you see a lot of in JavaScript. Because Hyperparam started as a passion project and it’s open source, I could optimize purely for the function that I cared about. That’s not necessarily how that would have been at a company.

That simplification reminds me of SpaceX’s Raptor engine. Each iteration of the Raptor keeps getting simpler… yet more powerful. I wanted to do the same for software. It’s an aesthetic choice, but it also influences the architecture and engineering. With an obsession over engineering and product, you can build minimal software, and that’s what Hyperparam is. I built it from the ground up depending on nothing else. That’s why it’s as small, light, and fast as it is.

# Advice for Developers Exploring Open Source Projects

**What’s your advice for developers starting out with open source?**

[Build the product you want to use yourself](https://blog.hyperparam.app/machine-learning/product/2025/01/21/browser-based-tools-will-reshape-ai/). If you have to solely rely on other people to tell you if what you are building is useful, your iteration cycles will be slow and painful. This advice might run contrary to conventional startup wisdom, which says you should assume you know nothing, talk to a hundred customers, and then build to solve their problem. That’s viable, but it’s not the only way to create something meaningful.

To build a certain kind of product, you need more vision and aesthetic opinion. In open source, you’ll see these shining monuments to technology, and why? Because someone cared enough to make them both functional and beautiful. Hyperparam is the data transformation tool I wished existed. I’m building for an audience of one: myself. When you build something you want to use yourself, you often end up building something others didn’t realize they needed.
