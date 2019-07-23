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
