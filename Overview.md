[![Build Status](https://travis-ci.org/WebAssembly/spec.svg?branch=master)](https://travis-ci.org/WebAssembly/spec)

# Overview

This repository contains a number of benchmarking resources, including tools, best practices, 
line items, and workloads for the purposes of measuring and improving both engine and toolchain performance.

# Goals

Let's make Make WebAssembly fast everywhere!
Benchmarks help drive improvements in performance for a number of tools that produce, analyze, optimize, 
and execute WebAssembly code. Having a comprehensive set of benchmarks across a number of important domains
allows developers of tools measure relevant performance characteristics and direct their efforts to
improve efficiency. There are many different use cases for a benchmark suite, depending on who is using it.

* **Users** would like to get confidence that a given WebAssembly engine offers its programs the best performance across a wide range of use cases.
* **Product managers** who are contemplating a product that targets WASM want to make informed decisions about which engine offers the right performance characteristics.
* **Language implementers** use the performance characteristics of various engines in deciding their implementation strategies (e.g. working around what is expensive or slow).
* **Toolchain implementers** use the source code of the benchmarks as a corpus to explore static optimizations and build time improvements.
* **Engine maintainers** want to catch performance regressions on important items so that they have confidence in shipping new features and optimizations.
* **Engine authors** want to know their engine is “up to speed” with other engines and find directions for further improvement, especially when comparing to native.

# A Community-Driven Benchmarking Effort

We'd like to continue WebAssembly's open, community-driven process for developing and specifying new features by
also extending that process to benchmarking. Instead of vendors, engine implementers, or language designers developing
suites in sometimes closed processes, we'd like the methodology of proposing, evaluating, and establishing benchmarks
to be as open and transparent as possible. Drawing on the experience of other benchmark suites and using the most
rigorous statistical methodology, we'll always try to measure the right thing.

# Avoiding Common Pitfalls

A benchmark suite and the methodology used to evaluate it can be tricky to get right. Mistakes in the selection and curation of benchmarks, or how they are measured, can lead to distorted results and misdirect resource investment. Many common pitfalls are worth pointing out so that we don't repeat the mistakes of the past.

* **Over-reliance on microbenchmarks.** While useful, as we explain below, microbenchmarks are inevitably too and pointed of workloads to accurately reflect the performance of any but the most simplified computations.
* **Measuring the wrong thing.** Ultimately, benchmarks should be designed to measure a particular metric of interest, whether that be memory consumption, execution time, or another aspect of performance. A poorly designed benchmark may end up measuring something other than its intended purpose, leading engines or other tools to optimize for the wrong thing.
* **Not validating outputs.** Benchmarks should check the result of the computations they perform, both to serve as a useful check on correctness, but also to prevent optimizations from dead-code-eliminating parts of the workload.
* **Non-fixed workloads.** Benchmark items that iterate for a number of seconds or rely on throughput measurements over time can perform a non-determinism amount of work, leading to paradoxical outcomes such as making a program faster means it executes more iterations, which means it allocates more memory. Instead, to deal with a wide range of performance, benchmarks should have a fixed set of different size workloads.
* **Not understanding benchmark behavior.** Benchmarks that contain intricate algorithms and behavior not understood by anyone are difficult to gain insight into, and often can be misconfigured so that the core calculations are not measured properly. Benchmark items' computations should be understood and at least explained at a high level as part of integration into the suite.

# Making use of Benchmarks Big and Small

Performance of programs can be vastly complicated. In order to understand tool, engine, and hardware performance in multiple dimensions, over multiple workloads, we should make use of benchmarks across a wide variety of sizes. We have identified 4 categories of benchmarks based on their size and complexity.

* **Microbenchmarks** are small, usually single-purpose tests that cover a single piece of functionality. They are useful for verifying that a particular subroutine or operation is "not slow". They don't necessarily generalize to the performance of a larger application, but can point to potential bottlenecks in operations that "should be fast."
* **Kernels** are moderately small "core algorithms" that implement performance-critical work as part of a larger application, such as the main logic of a video codec, compression, or numerical algorithm. They are often useful for tuning optimizing compilers and are only indicative of application performance to the extent that applications spend time in such kernels. Many past benchmark suites have consisted soley of kernels.
* **Applications** represent complete programs that have the full set of functionality that would be useful to them. Their workload may include canned user interactions and should also include the costs of, e.g. IO, if they load/emit files or network requests.
* **Domain-specific applications** represent applications that drive important functionality from a given domain, such as the web. Such an application might make use of graphics resources, the DOM, or networking.

