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
