# OpenCV kernels

## Overview
The HTML5 standard brings users the great capability of including and handling multimedia locally, together with an emerging need of computer vision programming functions available on the web. However, real-time user experience cannot be achieved when implementing those computation-intensive functions in JavaScript, even on the highly-optimized JavaScript engine. With the announcement of WebAssembly technology, source code in multiple programming languages, such as C, C++, Rust, etc. can be compiled into a sort of low-level and platform-independent bytecode which can run on the browsers while maintaining near-to-native execution speed. Thus, the widely-used OpenCV library can be ported to web platform with little extra effort, the ported library is officially called OpenCV.js.

The OpenCV-based applications relies on the kernel functions for the performance-critical work. This benchmark evaluates three vision kernels for image transformation, including: threshold, integral and cvtColor. The threshold function applies fixed-level thresholding to a single-channel array; the integral function calculates the integral of an image; the cvtColor converts an image from one color space to another. The reasons for their admission are:

1) they are representative kernels in OpenCV;
2) they are heavily used in the image-processing applications;
3) they are computation-intensive kernels which can reflect WebAssembly's performance and real user experience;
4) they are potential beneficiaries of WebAssembly SIMD or multi-thread features.

This benchmark runs each of the functions for 1000 times and measures the **prepare time**, **elapsed time** and **average time**, the standard deviations (**stddev**) are also calculated for stability analysis. Among the metrics we evaluate, **prepare time** and **elapsed time** are the dominant ones, and others are only for reference. In the tail of all 1000 runs, sha256 checksum of output image is calculated and compared with the reference value. By setting the size of images as 640\*480, 1280\*720 and 1920\*1080, the benchmark runs in small, medium and large mode respectively.

## Possible benchmark evolution
This benchmark is expected to be refined by:

* Providing another scheme for more accurate startup time measurement;
* Adding more representative kernel functions in OpenCV;
* Adding multi-thread and SIMD mode.

## Benchmark category
I think this benchmark should be categorized as “kernel”.

## License

### License for perf.js and opencv-kernel.html
```
Copyright 2020 Intel Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

### License for sha256.js
```
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* SHA-256 (FIPS 180-4) implementation in JavaScript                  (c) Chris Veness 2002-2019  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/sha256.html                                                     */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
```
## Version
OpenCV: 4.3.0

Emscripten SDK: 1.39.16 (LLVM backend)

## How to build OpenCV.js (Optional)
The source code of OpenCV located at: https://github.com/opencv/opencv.git

After installing Emscripten SDK, and activating PATH and other environment variables in current terminal, running the following commands generates OpenCV.js:
```
cd opencv
python ./platforms/js/build_js.py build_wasm --build_wasm
```

A bash script, build.sh, is provided for building the workload with OpenCV 4.3.0. But before running this script, please ensure the Emscripten is successfully installed and can be located with the environment variables.

## How to run
This workload could run in three modes with input images of different sizes: small (640\*480), medium (1280\*720) and large (1920\*1080). And it supports Node.js, V8 shell and browsers.

Node.js:
```
node perf.js [mode]
```
V8 shell:
```
d8 perf.js [-- mode]
```
Browsers with the workload deployed at localhost:8000:
```
chrome http://localhost:8000/opencv-kernel.html[?mode]
```
If *mode* is not specified, the workload runs in small mode by default.

## Expected output
Moreover, this workload prints the startup time ("Prepare time"), total execution time each workload takes ("elapsed time") and average execution time ("average time") in milliseconds (ms), together with the standard deviation of execution time of 1000 rounds. The output matrices of the functions will not be displayed due to their huge sizes, instead, the benchmark checked the sha256 checksums of the results of last iterations.

An example of the output shows:
```
opencv.js loaded
Prepare time: 1379.532
=== cvtColor ===
elapsed time: 399.5210000000002
average time: 0.3636110000000008
stddev: 0.027607022276954076 (7.59%)
=== threshold ===
elapsed time: 228.27499999999986
average time: 0.19137500000000068
stddev: 0.017555750482386855 (9.17%)
=== integral ===
elapsed time: 1069.445
average time: 0.6642880000000128
stddev: 0.04055493873748415 (6.11%)
```
And here lists the performance data of d8 (8.5.58) with only TurboFan, data on Node.js and browsers should be close to it.
<table>
    <tr>
        <td>mode</td>
        <td>Prepare time</td>
        <td>Kernel</td>
        <td>elapsed time</td>
        <td>average time</td>
        <td>stddev</td>
    </tr>
    <tr>
        <td rowspan="3">small</td>
        <td rowspan="3">1379.532</td>
        <td>cvtColor</td>
        <td>399.521</td>
        <td>0.364</td>
        <td>0.027 (7.59%)</td>
    </tr>
    <tr>
        <td>threshold</td>
        <td>228.275</td>
        <td>0.191</td>
        <td>0.018 (9.17%)</td>
    </tr>
    <tr>
        <td>integral</td>
        <td>1069.445</td>
        <td>0.664</td>
        <td>0.041 (6.11%)</td>
    </tr>
    <tr>
        <td rowspan="3">medium</td>
        <td rowspan="3">1397.564</td>
        <td>cvtColor</td>
        <td>1149.412</td>
        <td>1.080</td>
        <td>0.033 (3.08%)</td>
    </tr>
    <tr>
        <td>threshold</td>
        <td>639.416</td>
        <td>0.571</td>
        <td>0.014 (2.40%)</td>
    </tr>
    <tr>
        <td>integral</td>
        <td>2805.676</td>
        <td>1.958</td>
        <td>0.090 (4.59%)</td>
    </tr>
    <tr>
        <td rowspan="3">large</td>
        <td rowspan="3">1381.105</td>
        <td>cvtColor</td>
        <td>2552.249</td>
        <td>2.419</td>
        <td>0.115 (4.75%)</td>
    </tr>
    <tr>
        <td>threshold</td>
        <td>1380.083</td>
        <td>1.249</td>
        <td>0.039 (3.10%)</td>
    </tr>
    <tr>
        <td>integral</td>
        <td>6183.895</td>
        <td>4.357</td>
        <td>0.172 (3.96%)</td>
    </tr>
</table>

## Profile report
We profiled the medium workload on d8 (8.5.58, only TurboFan) with Linux Perf tool:

```
perf record -k mono d8 --perf-prof --no-wasm-tier-up --no-liftoff perf.js -- medium
perf inject -j -i perf.data -o perf.data.jitted
perf report -i perf.data.jitted
```

And here is a snapshot of the profile report:

```
Samples: 56K of event 'cycles', Event count (approx.): 51288348348
Overhead  Command          Shared Object          Symbol
  15.90%  d8               jitted-30366-1605.so   [.] Function:wasm-function[3916]-3916-turbofan
   8.70%  d8               jitted-30366-8402.so   [.] Function:wasm-function[2905]-2905-turbofan
   4.54%  d8               jitted-30366-1739.so   [.] Function:wasm-function[3928]-3928-turbofan
   2.64%  d8               jitted-30366-12697.so  [.] LazyCompile:*hash ./sha256.js:38
   2.25%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LinearScanAllocator::ForwardStateTo
   2.13%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LinearScanAllocator::FindFreeRegistersForRange
   1.88%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LiveRangeConnector::ResolveControlFlow
   1.33%  d8               d8                     [.] v8::internal::Scavenger::EvacuateShortcutCandidate<v8::internal::CompressedHeapObjectSlot>
   1.25%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LinearScanAllocator::TryAllocatePreferredReg
   1.20%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::Scheduler::PrepareUses
   1.17%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::GraphReducer::ReduceTop
   1.08%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::GraphTrimmer::TrimGraph
   1.08%  d8               jitted-30366-628.so    [.] Builtin:TypedArrayPrototypeJoin
   0.97%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LinearScanAllocator::PickRegisterThatIsAvailableLongest
   0.94%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::ScheduleEarlyNodeVisitor::VisitNode
   0.92%  V8 DefaultWorke  d8                     [.] std::__1::__tree<v8::internal::compiler::LiveRange*, v8::internal::compiler::LinearScanAllocator::UnhandledLiveRangeOrdering, v8::internal::ZoneAllocator<v8::internal::compiler::LiveRange*> >::__emplace_multi<v8::internal::compi
   0.89%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LinearScanAllocator::TryAllocateFreeReg
   0.85%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LiveRangeBuilder::ProcessInstructions
   0.84%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::ScheduleLateNodeVisitor::SplitNode
   0.73%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::ScheduleLateNodeVisitor::VisitNode
   0.70%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LinearScanAllocator::UpdateDeferredFixedRanges(v8::internal::compiler::RegisterAllocationData::SpillMode, v8::internal::compiler::InstructionBlock*)::$_3::operator()(v8::internal::compiler::LiveRange*) co
   0.69%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::OperandAssigner::CommitAssignment
   0.65%  d8               d8                     [.] v8::internal::BodyDescriptorBase::IteratePointers<v8::internal::IterateAndScavengePromotedObjectsVisitor>
   0.63%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LinearScanAllocator::AllocateRegisters
   0.61%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LinearScanAllocator::AssignRegisterOnReload
   0.59%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::BasicBlock::GetCommonDominator
   0.56%  V8 DefaultWorke  d8                     [.] std::__1::__tree_balance_after_insert<std::__1::__tree_node_base<void*>*>
   0.54%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::Node::New
   0.53%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::InstructionSelector::VisitBlock
   0.53%  d8               jitted-30366-672.so    [.] Builtin:StringPrototypeCharCodeAt
   0.52%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::Scheduler::DecrementUnscheduledUseCount
   0.51%  d8               d8                     [.] v8::internal::String::WriteToFlat<unsigned char>
   0.50%  V8 DefaultWorke  d8                     [.] v8::internal::wasm::WasmFullDecoder<(v8::internal::wasm::Decoder::ValidateFlag)1, v8::internal::wasm::(anonymous namespace)::WasmGraphBuildingInterface>::DecodeFunctionBody
   0.48%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::OperandAssigner::AssignSpillSlots
   0.45%  d8               jitted-30366-1599.so   [.] LazyCompile:*decodeBase64 ./opencv.js:31
   0.45%  V8 DefaultWorke  d8                     [.] v8::internal::TickCounter::DoTick
   0.44%  d8               d8                     [.] v8::internal::MarkCompactCollector::ProcessMarkingWorklist<(v8::internal::MarkCompactCollector::MarkingWorklistProcessingMode)0>
   0.44%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::ScheduleEarlyNodeVisitor::PropagateMinimumPositionToNode
   0.42%  V8 DefaultWorke  d8                     [.] std::__1::__tree_remove<std::__1::__tree_node_base<void*>*>
   0.40%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LinearScanAllocator::AllocateBlockedReg
   0.40%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::MoveOptimizer::MigrateMoves
   0.39%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LiveRangeConnector::ConnectRanges
   0.39%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::TopLevelLiveRange::AddUseInterval
   0.39%  d8               d8                     [.] v8::internal::Uri::Encode
   0.38%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::ValueNumberingReducer::Reduce
   0.38%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::InstructionSelector::SelectInstructions
   0.38%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LinearScanAllocator::SetLiveRangeAssignedRegister
   0.36%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::ScheduleLateNodeVisitor::ProcessQueue
   0.36%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::RegisterAllocationData::GetOrCreateLiveRangeFor
   0.35%  d8               jitted-30366-59.so     [.] Builtin:StringIndexOf
   0.33%  d8               d8                     [.] v8::internal::Scavenger::Process
   0.32%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LinearScanAllocator::AllocateRegisters()::$_4::operator()
   0.31%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::InstructionSequence::GetInstructionBlock
   0.31%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LiveRangeBuilder::AddInitialIntervals
   0.31%  d8               d8                     [.] v8::internal::MarkingVisitorBase<v8::internal::MainMarkingVisitor<v8::internal::MajorMarkingState>, v8::internal::MajorMarkingState>::ProcessStrongHeapObject<v8::internal::CompressedHeapObjectSlot>
   0.31%  d8               jitted-30366-12698.so  [.] LazyCompile:*hash ./sha256.js:38
   0.31%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LiveRangeBuilder::ComputeLiveOut
   0.30%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::InstructionSequence::GetSourcePosition
   0.30%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::Scheduler::UpdatePlacement
   0.30%  d8               d8                     [.] v8::internal::Worklist<std::__1::pair<v8::internal::HeapObject, int>, 256>::Pop
   0.29%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::ConstraintBuilder::MeetConstraintsBefore
   0.29%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::Schedule::AddNode
   0.29%  V8 DefaultWorke  libc-2.27.so           [.] _int_malloc
   0.28%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::ScheduleLateNodeVisitor::GetBlockForUse
   0.28%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::ScheduleLateNodeVisitor::ScheduleNode
   0.28%  d8               d8                     [.] v8::internal::Scavenger::ScavengeObject<v8::internal::CompressedHeapObjectSlot>
   0.27%  V8 DefaultWorke  d8                     [.] v8::internal::compiler::LiveRangeBuilder::Use
```
It can be observed that the top 3 functions are WebAssembly functions, which account for around 29.14% of the total CPU time.

## Known issues

It is observed on d8 that when tiers are not specified, the first testee (cvtColor) suffers from tier switching (Liftoff to Turbofan), while other functions runs on top tier only. This may lead to incomparable results. Currently, we'd like to recommend running this workload with only one tier enabled.
