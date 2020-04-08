# Zen garden benchmark

## Overview

This benchmark loads a 40-megabyte WebAssembly file containing 24
megabytes of code, and times how long the WebAssembly takes to
instantiate the module.

The code comes from the "Zen Garden" demo, originally
[https://www.unrealengine.com/en-US/blog/epic-zen-garden-project-available-for-download](released
in 2016 to show off the Metal support in Unreal Engine), and later
retargetted to WebAssembly.  The
[https://s3.amazonaws.com/mozilla-games/ZenGarden/EpicZenGarden.html](original
URL for the demo) was disabled at some point in 2019; this benchmark
simply instantiates the WebAssembly file using a minimal set of import
shims.  It is a benchmark of WebAssembly compilation latency, and does
not measure the performance of generated code.  Implementations will do
better on this benchmark if they can use multiple threads, and if they
have a "baseline" compiler that can produce working suboptimal code
sooner.

## Possible benchmark evolution

It would be nice to have corresponding source to see how toolchain
evolutions affect the result.

## Benchmark category

Although this benchmark targets a specific aspect of a WebAssembly
implementation, the benchmark itself is of "application" size.  It is a
real-world program.

## License

???

## How to build

Don't know :(

## How to run

To run:

```
$ proposals/bench run large zen-garden-load
```

You will probably need to set the `JS` environment variable to select an
implementation.  There are a number of interesting configurations:

```
# V8
$ export JS="$HOME/src/v8/out/x64.release/d8"

# V8, single-threaded
$ export JS="$HOME/src/v8/out/x64.release/d8 --single-threaded"

# V8, single-threaded, just the baseline compiler
$ export JS="$HOME/src/v8/out/x64.release/d8 --single-threaded --liftoff --no-wasm-tier-up"

# V8, single-threaded, just the optimizing compiler
$ export JS="$HOME/src/v8/out/x64.release/d8 --single-threaded --no-liftoff"

# SpiderMonkey
$ export JS=$HOME/src/mozilla-unified/+js-release/js/src/js

# SpiderMonkey, single-threaded
$ export JS="$HOME/src/mozilla-unified/+js-release/js/src/js --no-threads"

# SpiderMonkey, single-threaded, just the baseline compiler
$ export JS="$HOME/src/mozilla-unified/+js-release/js/src/js --no-threads --wasm-compiler=baseline"

# SpiderMonkey, single-threaded, just the optimizing compiler
$ export JS="$HOME/src/mozilla-unified/+js-release/js/src/js --no-threads --wasm-compiler=ion"

# JavaScriptCore
$ export JS=$HOME/src/webkit/WebKitBuild/release/jsc

# JavaScriptCore, single-threaded
$ export JS="$HOME/src/webkit/WebKitBuild/Release/bin/jsc --useConcurrentGC=false --useConcurrentJIT=false"

# JavaScriptCore, single-threaded, interpreter only
$ export JS="$HOME/src/webkit/WebKitBuild/Release/bin/jsc --useWasmLLInt=true --useBBQJIT=false --useOMGJIT=false --useConcurrentGC=false --useConcurrentJIT=false"

# JavaScriptCore, single-threaded, baseline (BBQ) only
$ export JS="$HOME/src/webkit/WebKitBuild/Release/bin/jsc --useWasmLLInt=false --useBBQJIT=true --useOMGJIT=false --useConcurrentGC=false --useConcurrentJIT=false"

# I don't know of a way to benchmark code generation speed for JavaScriptCore's optimizing WebAssembly compiler (OMG).
```

## Expected output

The benchmark suite itself verifies that a trivial export of the module
is callable, checks its value, and just outputs a time:
a time:

```
~/src/benchmarks$ proposals/bench run large zen-garden-load
zen-garden-load/large: 0.438 seconds
```

## Is it a good benchmark?

The time that this benchmark takes corresponds directly to user
experience, so yes, it's a great benchmark!

Also, if you run the benchmark in the various single-threaded
configurations, you can test the throughput of a given compiler.  It
doesn't tell you anything about the quality of the generated code, but
it does measure how long it takes for code to become available.
