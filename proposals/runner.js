// -*- javascript -*-
//
// Copyright 2019 Igalia, S.L.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//           V8 usage: d8 runner.js -- COMMAND ARG...
// SpiderMonkey usage: js runner.js COMMAND ARG...

const computeEnv = () => {
    const env = {};
    
    env.thisProgram = "runner.js";
    env.readFilePrefix = "";

    env.print = print;
    if (typeof printErr !== 'undefined') {
        env.printErr = printErr;
    } else {
        env.printErr = print;
    }

    if (typeof read !== 'undefined') {
        env.readBinaryFile = function (fileName) {
            return read(this.readFilePrefix + fileName, 'binary')
        };
    } else if (typeof readFile !== 'undefined') {
        env.readBinaryFile = function (fileName) {
            return readFile(this.readFilePrefix + fileName, 'binary')
        };
    } else {
        env.readBinaryFile = function readBinaryFile() {
            throw 'no readBinaryFile() available';
        };
    }
    
    if (typeof scriptArgs !== 'undefined') {
        env.args = scriptArgs;
    } else if (typeof arguments !== 'undefined') {
        env.args = arguments;
    } else {
        // No script arguments available
        env.args = [];
    }

    // V8 treats multiple arguments as files, unless -- is given, but
    // SpiderMonkey doesn't treat -- specially.  This is a hack to allow
    // for -- on SpiderMonkey.
    if (env.args[0] == '--') {
        env.args.shift();
    }
    
    if (typeof drainJobQueue !== 'undefined') {
        env.waitFor = function waitFor(p) { drainJobQueue(); return p; };
    } else if (typeof testRunner !== 'undefined') {
        env.waitFor = function waitFor(p) {
            testRunner.waitUntilDone();
            return p.then(testRunner.notifyDone);
        };
    } else {
        env.waitFor = function waitFor(p) { throw 'no waitFor() available'; };
    }

    if (typeof quit !== 'undefined') {
        env.quit = quit.bind(this);
    } else if (typeof testRunner !== 'undefined') {
        env.quit = testRunner.quit.bind(testRunner);
    }

    return env;
}

class UnexpectedResult extends Error {
    constructor(actual, expected) {
        super(`Unexpected result: ${actual} (expected ${expected})`);
        this.actual = actual;
        this.expected = expected;
    }
}

class Benchmark {
    constructor() {}
    startClock() { this.start = new Date; }
    elapsedTime() { return (new Date - this.start) / 1000; }
    async run(env) { throw "implement me"; }
}

class ModuleBenchmark extends Benchmark {
    constructor(dirName, exportName, args, expectedResult) {
        super();
        this.dirName = dirName
        this.exportName = exportName;
        this.args = args;
        this.expectedResult = expectedResult;
    }
    async run(env) {
        env.readFilePrefix = this.dirName + '/';
        const mod = await import(this.dirName + '/main.js');
        this.startClock();
        const result = await mod[this.exportName](env, ...this.args);
        const elapsed = this.elapsedTime();
        if (result !== this.expectedResult) {
            throw new UnexpectedResult(result, this.expectedResult);
        }
        return elapsed;
    }
}

const benchmarksBySize = {
    'small': {
        'schism-eval-fib': new ModuleBenchmark('schism-eval-fib', 'run', [20], 6765),
    },
    'medium': {
        'schism-eval-fib': new ModuleBenchmark('schism-eval-fib', 'run', [25], 75025),
    },
    'large': {
        'schism-eval-fib': new ModuleBenchmark('schism-eval-fib', 'run', [30], 832040),
    }
};

function usage(env, p) {
    p(`Usage: ${env.thisProgram} COMMAND ARG...`);
    p(`Available commands:`);
    for (var k in commands) {
        p(`  ${k}`);
    }
}

const commands = {
    async help(env) { usage(env, print); env.quit(0); },
    async list(env, size) {
        if (arguments.length != 2 || !benchmarksBySize[size]) {
            env.printErr(`Usage: ${env.thisProgram} list SIZE`);
            env.printErr(`Available sizes:`);
            for (var k in benchmarksBySize) {
                env.printErr(`  ${k}`);
            }
            env.quit(1);
        }
        for (var id in benchmarksBySize[size]) {
            print(id);
        }
    },
    async run(env, size, id) {
        if (arguments.length != 3) {
            env.printErr(`Usage: ${env.thisProgram} run SIZE ID`);
            env.quit(1);
        }
        const benchmarks = benchmarksBySize[size]
        if (!benchmarks) {
            env.printErr(`Unknown benchmark size '${size}'`);
            env.printErr(`Try '${env.thisProgram} list' for a list of valid sizes`);
            env.quit(1);
        }
        const benchmark = benchmarks[id]
        if (!benchmark) {
            env.printErr(`Unknown benchmark '${id}' for size '${size}'`);
            env.printErr(`Try '${env.thisProgram} list ${size}' for a list of ${size} benchmarks`);
            env.quit(1);
        }
        try {
            const elapsed = await benchmark.run(env);
            env.print(`${id}/${size}: ${elapsed} seconds`)
            env.quit(0);
        } catch (e) {
            env.printErr(`Benchmark ${id}/${size} failed: ${e}`);
            env.printErr(e.stack);
            env.quit(1);
        }
    }
}
const aliases = { '--help': 'help', '-h': 'help' };

async function main(env) {
    if (env.args.length == 0) {
        usage(env, x => env.printErr(x));
        env.quit(1);
    }
    let command = env.args.shift();
    let canonical = command in aliases ? aliases[command] : command;
    if (!commands[canonical]) {
        env.printErr(`Unknown command: ${command}`)
        usage(env, x => env.printErr(x));
        env.quit(1);
    }
    try {
        await env.waitFor(commands[canonical](env, ...env.args));
        env.quit(0);
    } catch (e) {
        env.printErr(`Error running command ${canonical}: ${e}`);
        env.printErr(e.stack);
        env.quit(1);
    }
}

main(computeEnv());
