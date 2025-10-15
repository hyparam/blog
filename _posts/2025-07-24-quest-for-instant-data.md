---
layout: post
title: "Hyparquet: The Quest for Instant Data"
date: 2025-07-24 07:00:00 -0700
banner_image: /assets/images/banner-hyparquet.jpg
banner_color: "#000000"
---

# The Quest for Instant Data

I just wanted to build a javascript code model.

Following the common adage that “data quality determines model quality”, I did what every AI engineer does and tried to *look* at some training data hosted on HuggingFace. I did not care how, I just needed to see some data and interact with it \- search around rows, sort, and otherwise get a feel for the data quality. 

This is where my goal started to go off the rails… Most modern AI datasets are 10GB or more and are in parquet format – we’ll talk more about this later – which means you need to parse and open the file. No simple `less` would work. The most common tools to read parquet for easy viewing are pandas/polars and DuckDB. With some ChatGPT help, I was running the command to load the first 5 rows of data. As shown below, I sat there waiting... and waiting.

![Jupyter Notebook Slow]({{site.baseurl}}/assets/images/hyparquet/notebook.gif)

Modern data viewer tools take anywhere from 5 sec (DuckDB) to 57 sec (Pandas) to load just 10 rows of data. The HCI community largely agrees that the ideal time-to-first-interactivity is 500 ms [[Lui, Heer 2014]](https://idl.cs.washington.edu/files/2014-Latency-InfoVis.pdf). Why should that not hold for data? Why is it acceptable for data to take 20x longer to load data than a webpage?

The rest of this blog describes my multi-month journey to hyper-optimize time-to-first-data for parquet files. I am still on this journey but, along the way, released [Hyparquet](https://github.com/hyparam/hyparquet), the most conformant browser-based parquet file reader in existence. It’s open source and, most importantly, can load my 10 rows of data in 150 ms.

## Legacy Server Architecture

Let’s take a step back and first understand where the runtime is going in existing data viewer tools. Let’s take an oversimplified version of a simple pandas backed data viewer and pretend it’s hosted in AWS and reading a parquet file from S3. Before the data even gets loaded, the user’s browser has to first hit cloud front, goes to [ELB](https://aws.amazon.com/elasticloadbalancing/), then finally gets redirected to the Node JS frontend server of the data hosting service, goes through another ELB, hits the backend server hosting the data and then finally pings S3 and downloads the data. In total this takes about 40 sec of latency just to get the request and download the data. The data then gets parsed in the backend server (taking about 1 sec), and finally makes its way back to the user’s browser.

![Legacy server architecture diagram]({{site.baseurl}}/assets/images/hyparquet/arch1.svg)

This diagram may feel complicated but it’s drastically oversimplified compared to most real-world architectures that have: auth, logging, message brokers, etc. Systems that each add additional latency.

When optimizing this pipeline, most engineers only have control of the backend and spend time optimizing parsing. This can speed up the time-to-first-data a lot, but it’s not enough for me. I wanted to completely remove the latency before parsing even started.

## Browser-First Architecture

Fundamentally, whenever you have a backend, you need layers of tooling on top. And backend servers are generally good ideas \- they manage application state, can handle compute heavy processes, and decouple the viewer from the data models. But I don’t care about any of that. A data viewer isn’t a feature in my application, it is the entire application. So what if I just remove everything backend related and point the browser directly at S3 \*(Well, you still need cloudfront to optimize the SSL handshake)?

![Browser-first architecture diagram]({{site.baseurl}}/assets/images/hyparquet/arch2.svg)

You would be left with just the browser talking straight to cloud storage:  

![Simplified browser to cloud storage architecture]({{site.baseurl}}/assets/images/hyparquet/arch3.svg)  

With this architecture, you immediately save latency as you skip having to hit ELB and a backend. As an added bonus, it’s cheaper because you don’t need cloud costs to host the backend server and far simpler for developers to maintain.

This simplified architecture does leave two issues: (a) where does user state live so if they, for example, refresh a page, they don’t lose their location in the viewer and (b) you still need to parse a parquet file.

It turns out, if you use browser cookies and local storage, you can manage user state all in the browser. Sure, if the user clears their browsing history, they’re in trouble, but I’m okay with that. The parsing…well, I was just going to have to use a javascript parser instead. Or, as it turns out, build my own.

## Parquet in the Browser

At the beginning 2024, when I started this quest, there were 3 libraries that could load parquet files from cloud storage directly into the browser: ParquetJS, ParquetWASM, and DuckDB WASM. And I had a goal to parse parquet files in under 500ms. As shown below, none of these were fast and ParquetJS wasn’t even supported anymore.

![Parquet browser library performance comparison]({{site.baseurl}}/assets/images/hyparquet/browser-library-performance.png)

Looking at this waterfall chart we can see that all libraries take at least 600 ms to get a request and parse a parquet file. But, they also show multiple opportunities for optimization. Let’s summarize some of the inefficiencies of the duckdb-wasm library \- we will go into more details below.

1. Loading the WASM engine (extra \> 1 sec)  
2. Multiple requests to get metadata when it could be done in one (extra 200 ms)  
3. Sequential read requests when it could be in parallel  
4. Limited optimizations based on metadata  
5. Synchronous fetches versus asynchronous  
6. Inefficient compression algorithms

If I could optimize these pieces, I could achieve my 500ms time-to-first-data. And I could do it in Kenny style: 100% javascript and no dependencies (because who doesn’t want to rebuild everything from scratch). Time to introduce Hyparquet.

## Parquet from Scratch

Re-writing a parquet parser from scratch, how hard can it be?? It took about a week to be able to parse my first parquet file, which I thought was pretty good. The problem is that I kept finding more parquet files that I couldn’t open. Parquet is a sprawling format, with many features:

* 8 physical types (bool, int, float, etc)  
* 22 converted types  
* 17 logical types  
* 8 compression codecs (snappy, gzip, brotli, etc)  
* 2 major versions

It took **6 months** to parse ALL the parquet files.  
![Parquet development timeline]({{site.baseurl}}/assets/images/hyparquet/hyparquet-github.png)

## Gotta Go Fast

Javascript is not exactly known as a high performance language. I think this reputation is undeserved. I’m not saying it's going to beat rust in a benchmark. But with careful engineering and tactical use of modern browser apis, we can make decoding parquet in the browser surprisingly performant.

Let’s dive deeper into some of the mistakes made by other parquet libraries, and how we can make it better in the browser:

1. **Engine Size** – DuckDB-WASM requires downloading and compiling several megabytes of WebAssembly, incurring seconds of startup delay before queries can run. That's seconds where your user sees... nothing.

   Could we get a performance advantage from starting with less? Every kilobyte of WASM adds startup latency. Hyparquet’s core engine is only 10KB (minified, gzipped), dramatically reducing startup latency, and is substantially easier to bundle. By narrowing the focus strictly to Parquet parsing with pushdown filters, we achieve near-instant initialization.

   We also save an entire round-trip loading the wasm blob:

   ![Engine size comparison showing reduced latency]({{site.baseurl}}/assets/images/hyparquet/parquet-wasm.png)

2. **Smart Metadata Fetching** – In parquet, the metadata is stored in the footer of the file. So in order to fetch the metadata, you might naively make at least three requests:

   This is what parquet-wasm and parquetjs do:

   1. HEAD request to get file size

   2. Fetch the last 8 bytes to get the metadata\_length field

   3. Fetch the metadata

   But with hyparquet we actually do a little better: we can skip the second step. Rather than make an 8 byte round-trip fetch request, we optimistically fetch 512kb of the footer of the file. 99% of the time that includes the entire metadata. In the rare cases where this initial request fails to include all the metadata, we use the metadata length in the footer and make another request for just the remainder of the missing metadata. On http over the internet, an 8 byte fetch takes *almost* the same amount of time as a 512 kb request.

3. **Parallelization** – Traditional databases fetch data sequentially. But browsers can handle 6+ concurrent HTTP connections. Hyparquet leverages parallel HTTP range requests, retrieving only needed portions of the Parquet file (specific columns or row groups) in parallel. This overlap of I/O helps reduce wall-clock latency for data access.

   Duckdb uses a different (and much worse) algorithm: it does a sequence of exponentially increasing request sizes, all in series (not parallel). This is fine when you’re reading from local disk but is pathological when loading over the network:

   ![DuckDB sequential vs Hyparquet parallel fetching]({{site.baseurl}}/assets/images/hyparquet/duckdb-wasm.png)

4. **Use the Metadata** – Hyparquet employs predicate pushdown by analyzing Parquet metadata (schema, column statistics). This allows it to identify and skip irrelevant row groups entirely, reducing network load and improving speed. This isn't new—every modern columnar database does this. But when network latency is your enemy, skipping even one unnecessary 25MB column chunk can save seconds.

   It’s worth mentioning that by default parquetjs does NOT do this. In fact, neither does python\! The default pyarrow and pandas parquet readers WILL READ THE ENTIRE FILE. I had to tweak parquetjs to make it load partial data at all. [[2]](https://github.com/hyparam/parquet-browser-eval)

5. **Async Everything** – JavaScript might be the world’s most async-friendly language. We utilize this to return whatever data is ready first. Parquet is a column-oriented format, so if rows are being emitted from a cursor object, you’re making users wait for ALL the columns to load before returning any data to the user. Hyparquet can return data asynchronously whenever it’s ready (but provides helpers for row-oriented data if that’s needed).

6. **Compression That Doesn't Suck** – Standard JavaScript Snappy decompression was too slow, so we implemented HySnappy, a WebAssembly-based decoder that's 40% faster yet adds minimal size (\<4KB). This ensures decompression never becomes the performance bottleneck.

   The problem with WASM is that it normally adds an extra round-trip fetch request for the wasm file. We improved this using a little-known browser trick: you can *synchronously* load wasm if and only if it is less than 4kb\! So we wrote our own snappy decompression library, with no dependencies, not even memcpy, and definitely no emscripten. This makes hysnappy super easy to bundle, deploy, and load.

## The Result: Sub-Second Magic

This obsession with latency has real-world implications. Where DuckDB-Wasm might take several seconds just to initialize its query engine, Hyparquet can produce visible results on multi-gigabyte datasets in under a second.

![Final performance results showing sub-second loading]({{site.baseurl}}/assets/images/hyparquet/final-performance-results.png)

## The Philosophy: Bringing Compute to Data (In Your Browser)

Hyparquet demonstrates a shift toward treating the browser as a fully capable query processor operating directly on data stored in cloud storage, suggesting a new paradigm for database research:

This inverts traditional assumptions:

* Thin server, client doing the heavy lifting.  
* Round trips matter more than total bandwidth.  
* Time-to-first-byte is the new query optimization target.

Hyparquet’s extreme minimalism sets a new benchmark for browser-native analytics. But what are the broader implications?

Hyparquet enables ML researchers and data analysts to interactively explore large datasets directly in the browser, eliminating the need for traditional backend setup or data infrastructure management.

Hyparquet also allows data analysis over a much-simplified infrastructure: By removing backend databases, there's less infrastructure to maintain, simpler developer experience, and faster user experience.

## Where did this lead? Hyperparam.

If you remember where this started, I wanted users to see the first few rows of a large AI parquet dataset in under a second. But I started looking at data because I wanted to train a model. I obsessed over the first step of the AI data curation pipeline because it was painful. But I didn’t stop there. I founded Hyperparam, a company built on this paradigm of hyper optimization of browser native applications for data curation. Hyperparam’s goal is for users to build their training, evaluation, or RAG datasets with the seamless interactivity of the browser they are accustomed to for non data-intensive tasks. Our motto \- “javascript can do it too”

## Try It Yourself

Want to see Hyparquet in action? Head to [https://hyperparam.app](https://hyperparam.app), drop any Parquet file or url, and watch your data appear instantly.

![Hyperparam Parquet Viewer]({{site.baseurl}}/assets/images/hyparquet/hyperparam.gif)
