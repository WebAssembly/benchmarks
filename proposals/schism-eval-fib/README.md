# Schism eval('fib(25)') benchmark

## Overview

This benchmark runs a Scheme interpreter (`eval`), compiled by the
[Schism](https://github.com/google/schism) self-hosted Scheme
implementation.  The interpreter is used to compute and print the 25th
fibonacci number.

This branch of Schism represents Scheme values using `anyref` values
originating in the embedder.  The embedder has to supply allocator, type
predicate, and field access instructions for the different Scheme value
types supported by Schism: small integers, characters, strings, symbols,
pairs, and closures.  Schism provides a run-time written in JavaScript
which uses tagged JavaScript numbers for Scheme integers and characters,
tagged JavaScript strings for Scheme strings and symbols, and JavaScript
objects for pairs and closures.

This benchmark largely tests the performance of `anyref`, host-side
allocation and GC, and JavaScript strings.  It also stress-tests calls
between WebAssembly and JS, as well as inter-WebAssembly calls.

## Possible benchmark evolution

The benchmark could be made more suitable in a few ways:

 * Eq-able reference types would be useful.  It would be nice to be able
   to compare anyref values by identity, though what that means for host
   strings is a question.

 * We could use tail calls.

 * `i31ref` would be really useful.

 * The Schism compiler can improve in many ways.  Notably the current
   version doesn't support static data, which means that it allocates
   more than usual at run-time in order to create literals anew each
   time they appear.  We could take a version of `eval` compiled from a
   newer version of Schism that doesn't have this problem.

 * We could use GC types to avoid calling out so much to the host.
   Would need implementation of GC in an engine though.

## Benchmark kind

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
# Anyref support pending merge: https://github.com/google/schism/pull/72
git checkout 1b202ad59b7db45c95107f38ba5513cdaac421f7
# FIXME: Build from self-hosted wasm instead of Guile.
bootstrap-from-guile.sh /tmp/schism-eval-fib/schism-eval.wasm test/eval.ss
cp rt/rt.mjs /tmp/schism-eval-fib/
```

Place this file in `/tmp/schism-eval-fib/run.mjs`:

```js
import fs from 'fs';
import path from 'path';
import process from 'process';

import { Engine } from './rt.mjs';

async function callAndThenExit(f) {
    // Pending promises don't keep Node alive; you need timeouts for
    // that.  A bit hacky, but whatever.
    const timer = setTimeout(() => {}, 999999);
    try {
        await f();
    } catch (e) {
        console.warn('Test failed: ' + e);
        console.warn(e.stack);
        process.exit(1);
    }
    process.exit(0);
}

async function run() {
    const engine = new Engine;
    const file = path.dirname(process.argv[1]) + '/schism-eval.wasm';
    const bytes = fs.readFileSync(file);
    const wasm = await engine.loadWasmModule(bytes);
    engine.setCurrentInputPortChars(`
      (begin
        (display
         (let fib ((n 25))
           (if (< n 2)
               n
               (+ (fib (- n 1)) (fib (- n 2))))))
        (newline))`);

    wasm.exports['read-and-eval']();
}

callAndThenExit(run);
```

Note that this `run.mjs` test runner uses Node APIs.  We should
certainly factor out all of this to some helper library.

## How to run

To run in Node/v8, use:

```
node --experimental-modules --experimental-wasm-anyref \
    ./run.mjs
```

## Expected output

The benchmark suite should verify that the node invocation prints the
following:

```
75025
```

## Expected latency

On my system this test runs in about 4 or 5 seconds:

```
real	0m4.729s
user	0m4.913s
sys	0m0.077s
```

## Is it a good benchmark?

Here's a perf output for v8, running node with `--perf-prof
--perf-basic-prof`.

```
Samples: 21K of event 'cycles:ppp', Event count (approx.): 13825294727
Overhead  Command  Shared Object        Symbol
   9.42%  node     node                 [.] Builtins_StringAdd_CheckNone
   5.04%  node     perf-6553.map        [.] LazyCompile:*%list->string file:///tmp/schism-eval-fib/rt.mjs:123
   4.16%  node     perf-6553.map        [.] LazyCompile:*cons file:///tmp/schism-eval-fib/rt.mjs:143
   3.62%  node     node                 [.] Builtins_ToNumber
   3.47%  node     node                 [.] Builtins_WasmToNumber
   2.90%  node     perf-6553.map        [.] Function:%eval-150
   2.55%  node     perf-6553.map        [.] LazyCompile:*pair? file:///tmp/schism-eval-fib/rt.mjs:144
   2.40%  node     perf-6553.map        [.] LazyCompile:*%make-char file:///tmp/schism-eval-fib/rt.mjs:108
   2.21%  node     perf-6553.map        [.] 0x0000231eb1ec6405
   2.17%  node     perf-6553.map        [.] 0x0000231eb1ec6505
   2.16%  node     perf-6553.map        [.] 0x0000231eb1ec62ec
   1.81%  node     perf-6553.map        [.] 0x0000231eb1ec6485
   1.76%  node     perf-6553.map        [.] 0x0000231eb1ec6605
   1.75%  node     perf-6553.map        [.] LazyCompile:*eq? file:///tmp/schism-eval-fib/rt.mjs:100
   1.51%  node     perf-6553.map        [.] 0x0000231eb1ec61cc
   1.39%  node     perf-6553.map        [.] LazyCompile:*string? file:///tmp/schism-eval-fib/rt.mjs:119
   1.18%  node     node                 [.] Builtins_StrictEqual
   1.15%  node     perf-6553.map        [.] LazyCompile:*%make-number file:///tmp/schism-eval-fib/rt.mjs:107
   1.12%  node     perf-6553.map        [.] Function:list-tail-70
   1.03%  node     perf-6553.map        [.] Function:cdr-50
   1.00%  node     perf-6553.map        [.] 0x0000231eb1ec62e5
   0.99%  node     perf-6553.map        [.] LazyCompile:*%string->symbol file:///tmp/schism-eval-fib/rt.mjs:136
   0.93%  node     perf-6553.map        [.] 0x0000231eb1ec61c5
   0.90%  node     perf-6553.map        [.] Function:string->symbol-83
   0.88%  node     perf-6553.map        [.] Function:car-49
   0.87%  node     perf-6553.map        [.] LazyCompile:*%cdr file:///tmp/schism-eval-fib/rt.mjs:146
   0.85%  node     perf-6553.map        [.] 0x0000231eb1e62aba
   0.74%  node     perf-6553.map        [.] 0x0000231eb1ec65fe
   0.74%  node     perf-6553.map        [.] LazyCompile:*%number-value file:///tmp/schism-eval-fib/rt.mjs:110
   0.72%  node     node                 [.] Builtins_StringEqual
   0.69%  node     perf-6553.map        [.] LazyCompile:*%get-false file:///tmp/schism-eval-fib/rt.mjs:150
   0.68%  node     perf-6553.map        [.] 0x0000231eb1ec64b3
   0.68%  node     perf-6553.map        [.] LazyCompile:*%car file:///tmp/schism-eval-fib/rt.mjs:145
   0.64%  node     perf-6553.map        [.] 0x0000231eb1ec63fe
   0.62%  node     perf-6553.map        [.] 0x0000231eb1ec64fe
   0.58%  node     perf-6553.map        [.] LazyCompile:*%get-null file:///tmp/schism-eval-fib/rt.mjs:152
   0.51%  node     perf-6553.map        [.] 0x0000231eb1ec647e
```

I think probably before an eventual adoption into official benchmarks,
we should fix the static string allocation issue, to avoid testing
string creation so much.
