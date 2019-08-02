# Schism eval('fib(n)') benchmark

## Overview

This benchmark runs a Scheme interpreter (`eval`), compiled by the
[Schism](https://github.com/google/schism) self-hosted Scheme
implementation.  The interpreter is used to compute and print a
fibonacci number.

This branch of Schism represents Scheme values using [`anyref`
values](https://github.com/WebAssembly/reference-types/blob/master/proposals/reference-types/Overview.md)
originating in the embedder.  The embedder has to supply allocator, type
predicate, and field access instructions for the different Scheme value
types supported by Schism: small integers, characters, strings, symbols,
pairs, and closures.  Schism provides a run-time written in JavaScript
which uses tagged JavaScript numbers for Scheme integers and characters,
tagged JavaScript strings for Scheme strings and symbols, and JavaScript
objects for pairs and closures.

This branch of Schism also uses [tail
calls](https://github.com/WebAssembly/tail-call/blob/master/proposals/tail-call/Overview.md)
where appropriate.

This benchmark largely tests the performance of `anyref`, host-side
allocation and GC, (tail) calls between WebAssembly and JS, as well as
inter-WebAssembly (tail) calls.

## Possible benchmark evolution

As WebAssembly evolves, the benchmark could be made more suitable in a
few ways:

 * Eq-able reference types would be useful.  It would be nice to be able
   to compare anyref values by identity, though what that means for host
   strings is a question.

 * `i31ref` would be really useful.

 * We could use GC types to avoid calling out so much to the host.
   Would need implementation of GC in an engine though.

## Benchmark category

I think we can consider this benchmark to be a "kernel".

## License

```
Copyright 2019 Google LLC

Licensed under the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.  You may obtain
a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

## How to build

Source: https://github.com/google/schism/blob/master/test/eval.ss

```
mkdir /tmp/schism-eval-fib
git clone https://github.com/google/schism
cd schism
# FIXME: Build from self-hosted wasm instead of Guile.
bootstrap-from-guile.sh /tmp/schism-eval-fib/schism-eval.wasm test/eval.ss
cp rt/rt.mjs /tmp/schism-eval-fib/rt.js
```

This particular build was created with `master` revision
`b709b789b5164847caf94cdd823811cf6391bdb3`.

Place this file in `/tmp/schism-eval-fib/main.js`:

```js
import { Engine } from "./rt.js";

export async function run(env, n) {
    const engine = new Engine;
    const bytes = env.readBinaryFile('schism-eval.wasm');
    const mod = await engine.loadWasmModule(bytes);
    engine.setCurrentInputPortChars(`
      (let fib ((n ${n}))
        (if (< n 2)
            n
            (+ (fib (- n 1)) (fib (- n 2)))))`);

    return mod.call('read-and-eval');
}
```

## How to run

I run this with V8 built from source:

```
$ export JS="/home/wingo/src/v8/out/x64.release/d8 --experimental-wasm-anyref --experimental-wasm-return-call"
$ proposals/bench run small schism-eval-fib
```

To run in SpiderMonkey, I would do the same, but with a different JS:

```
$ export JS=/home/wingo/src/mozilla-inbound/+js-release/js/src/js
$ proposals/bench run small schism-eval-fib
```

Except, SpiderMonkey doesn't yet implement the tail call proposal yet.
It can run other parts of the test runner though, e.g.:

```
$ proposals/bench list small
schism-eval-fib
```

## Expected output

The benchmark suite itself verifies that the benchmark computes the
expected value, thus it just outputs a time:

```
~/src/benchmarks$ for i in small medium large; do proposals/bench run $i schism-eval-fib; done
schism-eval-fib/small: 0.277 seconds
schism-eval-fib/medium: 1.862 seconds
schism-eval-fib/large: 18.639 seconds
```

## Is it a good benchmark?

Here's a perf output for v8, for the medium size, running v8 with
`--perf-prof --perf-basic-prof`.

```
Samples: 8K of event 'cycles:ppp', Event count (approx.): 5361550627
Overhead  Command          Shared Object       Symbol
   8.25%  d8               d8                  [.] Builtins_ToNumber
   5.95%  d8               perf-39773.map      [.] LazyCompile:*pair? /home/wingo/src/benchmarks/proposals/schism-eval-fib/
   5.80%  d8               d8                  [.] Builtins_WasmToNumber
   4.36%  d8               perf-39773.map      [.] LazyCompile:*eq? /home/wingo/src/benchmarks/proposals/schism-eval-fib/rt
   3.68%  d8               perf-39773.map      [.] 0x00001d10e9a233e8
   2.87%  d8               perf-39773.map      [.] 0x00001d10e99f0748
   2.69%  d8               d8                  [.] Builtins_StrictEqual
   2.61%  d8               perf-39773.map      [.] Function:list-tail-71
   2.56%  d8               perf-39773.map      [.] 0x00001d10e99f08e1
   2.26%  d8               perf-39773.map      [.] Function:cdr-51
   2.07%  d8               perf-39773.map      [.] 0x00001d10e9a233e1
   1.75%  d8               perf-39773.map      [.] LazyCompile:*%number-value /home/wingo/src/benchmarks/proposals/schism-e
   1.69%  d8               perf-39773.map      [.] Function:car-50
   1.61%  d8               perf-39773.map      [.] LazyCompile:*%cdr /home/wingo/src/benchmarks/proposals/schism-eval-fib/r
   1.60%  d8               perf-39773.map      [.] 0x00001d10e999963a
   1.46%  d8               perf-39773.map      [.] Function:%eval-151
   1.34%  d8               perf-39773.map      [.] LazyCompile:*%car /home/wingo/src/benchmarks/proposals/schism-eval-fib/r
   1.04%  d8               perf-39773.map      [.] 0x00001d10e99f075b
   0.97%  d8               perf-39773.map      [.] 0x00001d10e9a233fb
   0.96%  d8               perf-39773.map      [.] 0x00001d10e99f07a1
   0.91%  d8               perf-39773.map      [.] 0x00001d10e99f07b2
   0.89%  d8               perf-39773.map      [.] 0x00001d10e9a23421
   0.88%  d8               perf-39773.map      [.] 0x00001d10e99f07c3
   0.87%  d8               perf-39773.map      [.] 0x00001d10e99f0795
   0.84%  d8               perf-39773.map      [.] LazyCompile:*%make-number /home/wingo/src/benchmarks/proposals/schism-ev
   0.84%  d8               perf-39773.map      [.] 0x00001d10e99f0741
   0.81%  d8               perf-39773.map      [.] 0x00001d10e99f0765
   0.80%  d8               perf-39773.map      [.] 0x00001d10e99f0721
   0.80%  d8               perf-39773.map      [.] 0x00001d10e99f0733
   0.79%  d8               perf-39773.map      [.] Function:zero?-106
   0.78%  d8               perf-39773.map      [.] Function:length-70
   0.78%  d8               perf-39773.map      [.] 0x00001d10e9a23443
   0.76%  d8               perf-39773.map      [.] 0x00001d10e9a23454
   0.75%  d8               perf-39773.map      [.] 0x00001d10e99f0775
   0.75%  d8               perf-39773.map      [.] 0x00001d10e99f0919
   0.74%  d8               perf-39773.map      [.] 0x00001d10e99f08c1
   0.71%  d8               perf-39773.map      [.] 0x00001d10e99f077f
   0.69%  d8               perf-39773.map      [.] Function:null?-107
   0.67%  d8               perf-39773.map      [.] 0x00001d10e9a23413
   0.65%  d8               perf-39773.map      [.] 0x00001d10e9a23465
   0.62%  d8               perf-39773.map      [.] 0x00001d10e99f072a
   0.61%  d8               perf-39773.map      [.] 0x00001d10e99f08ca
   0.59%  V8 DefaultWorke  d8                  [.] v8::internal::compiler::ReferenceMapPopulator::PopulateReferenceMaps
   0.58%  d8               perf-39773.map      [.] 0x00001d10e99f090a
   0.58%  d8               perf-39773.map      [.] 0x00001d10e9a23501
   0.57%  d8               perf-39773.map      [.] Function:%eval*-152
   0.56%  d8               perf-39773.map      [.] 0x00001d10e9a23437
   0.55%  d8               perf-39773.map      [.] 0x00001d10e99f08d3
   0.52%  d8               perf-39773.map      [.] 0x00001d10e9a233d6
   0.51%  d8               perf-39773.map      [.] 0x00001d10e9a23403
```

I think these results show that the benchmark is indeed testing 
the performance of `anyref` and callouts to
accessors/constructors/predicates on the anyref values.
