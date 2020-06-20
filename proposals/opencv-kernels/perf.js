// Copyright 2019 Intel Corporation
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

function standardDeviation(values){
  let avg = average(values);
  
  let squareDiffs = values.map(function(value){
    let diff = value - avg;
    let sqrDiff = diff * diff;
    return sqrDiff;
  });
  
  let avgSquareDiff = average(squareDiffs);

  let stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function average(data){
  let sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  let avg = sum / data.length;
  return avg;
}

function getNodeMs(hrstart, hrend) {
  return (hrend[0]-hrstart[0])*1000 + (hrend[1]-hrstart[1])/1000000;
}

function getMs(timestart, timeend) {
  return timeend - timestart;
}

function printResult(elapsed, perf) {
  console.log(`elapsed time: ${elapsed}`);
  console.log(`average time: ${average(perf)}`);
  console.log(`stddev: ${standardDeviation(perf)} (${(standardDeviation(perf)/average(perf)*100).toFixed(2)}%)`);
}

const samples = 1000;

const options = {
  small: {
    CvtColor: {
      height: 640,
      width: 480,
      expected_dest_hash: "e3d3fa4dc3c2920d484a9e309be01af596f7a8abd57824e08096fb7c5a7fb055"
    },
    Threshold: {
      height: 640,
      width: 480,
      expected_dest_hash: "8d7706b9d21f5ea62d147c19400a643163cef58e511fbe71138e42df3f880563"
    },
    Integral: {
      height: 640,
      width: 480,
      expected_sum_hash: "b9e6e35229e9cb86b449b1a40b1cf93ccf32a5cf81fbd5b6542c2e92b0acbeb3",
      expected_sqSum_hash: "88957e17569ce2628d514a3125ac8c4b229054b3cf0005c2a101451d41fe074a"
    }
  },
  medium: {
    CvtColor: {
      height: 1280,
      width: 720,
      expected_dest_hash: "0fd0eb4246a578028c0288bcf4208701a6c4365dce612b300d030185207a5358"
    },
    Threshold: {
      height: 1280,
      width: 720,
      expected_dest_hash: "174d324bd9138bf4e168907ddf500ae8282705b5229a4f023c6eff2031cd8f86"
    },
    Integral: {
      height: 1280,
      width: 720,
      expected_sum_hash: "7caea4305f6611a488aef2be84b567ddb71f85f5c462424327405b3454b13c30",
      expected_sqSum_hash: "9476de9674ee4f844baa75cb88b96d64e22ab3980c287608b10952cae4b9bdab"
    }
  },
  large: {
    CvtColor: {
      height: 1920,
      width: 1080,
      expected_dest_hash: "a125cb019c88b60a687cd92b5c21ad16e811a7765934c1968614e6e5d4880c84"
    },
    Threshold: {
      height: 1920,
      width: 1080,
      expected_dest_hash: "77897658dd78a779919dac57209a950aa76e7f3b0e58f5ca144794c5221ffa0e"
    },
    Integral: {
      height: 1920,
      width: 1080,
      expected_sum_hash: "cb5f25c64da1f6348225fcbe36357ee885aa4f49d497a2e7e100dd6b01aa3555",
      expected_sqSum_hash: "0fe35b14db31aa02a3675edec388ebc8e4aa93e005c34030a0f057ab5e93d252"
    }
  }
};

const options_keys = Object.keys(options);
let prestart;

if (typeof window !== "undefined") {
  getTimestamp = function(){ return performance.now() };

  let output_node = document.getElementById("output");
  output_node.value = "";

  console.log = function() {
    let text = "";
    for (let i = 0; i < arguments.length; ++i) {
      text += arguments[i];
    }
    text += "\n"
    output_node.value += text;
    output_node.scrollTop = output_node.scrollHeight;
  }

  prestart = getTimestamp();

  let opencv_script = document.createElement("script");
  opencv_script.id = "opencv_js";
  opencv_script.setAttribute("async", "false");
  opencv_script.setAttribute("type", "text/javascript");
  opencv_script.src = './opencv.js';
  opencv_script.onload = function() {
    cv.then(cv_resolved); 
  }
  output_node.parentElement.insertBefore(opencv_script, output_node);

  let arguments = window.location.search.substring(1).split("&");
  option_str = arguments.length > 0 && options_keys.includes(arguments[0]) ? arguments[0] : "small";
}
else if (typeof process !== "undefined") {
  getMs = getNodeMs;
  getTimestamp = process.hrtime;

  prestart = getTimestamp();

  cv = require('./opencv.js');
  Sha256 = require("./sha256.js");
  cv.then(cv_resolved); 

  option_str = process.argv.length > 2 && options_keys.includes(process.argv[2]) ? process.argv[2] : "small";
}
else {
  getTimestamp = performance.now;

  prestart = getTimestamp();

  load('./opencv.js');
  load("./sha256.js");
  cv.then(cv_resolved); 

  option_str = arguments.length > 0 && options_keys.includes(arguments[0]) ? arguments[0] : "small";
}

function cv_resolved(cv_module) {
  var preend = getTimestamp();
  console.log('opencv.js loaded');
  console.log('Prepare time:', getMs(prestart, preend));

  let option = options[option_str];

  perfCvtColor(cv_module, option["CvtColor"]);
  perfThreshold(cv_module, option["Threshold"]);
  perfIntegral(cv_module, option["Integral"]);
};

function perfCvtColor(cv_module, option) {
  let source = new cv_module.Mat(option.height, option.width, cv_module.CV_8UC4, new cv_module.Scalar(0, 0, 0, 0));
  let dest = new cv_module.Mat();

  console.log(`=== cvtColor ===`);
  let perf = [];
  const start = getTimestamp()
  for (let i = 0; i < samples; ++i) {
    let hrstart = getTimestamp();
    cv_module.cvtColor(source, dest, cv_module.COLOR_BGR2GRAY, 0);
    let hrend = getTimestamp();
    perf.push(getMs(hrstart, hrend));
  }

  const end = getTimestamp();
  printResult(getMs(start, end), perf);

  let dest_hash = Sha256.hash(dest.data.join('')); 
  if (dest_hash !== option.expected_dest_hash) {
    throw "Wrong result from cv_module.cvtColor()!";
  }

  source.delete();
  dest.delete();
}

function perfThreshold(cv_module, option) {
  const THRESHOLD = 127.0;
  const THRESHOLD_MAX = 210.0;
  let source = new cv_module.Mat(option.height, option.width, cv_module.CV_8UC1, new cv_module.Scalar(0));
  let sourceView = source.data;
  sourceView[0] = 0; // < threshold
  sourceView[1] = 100; // < threshold
  sourceView[2] = 200; // > threshold

  let dest = new cv_module.Mat();

  console.log(`=== threshold ===`);
  let perf = [];
  const start = getTimestamp();
  for (let i = 0; i < samples; ++i) {
    let hrstart = getTimestamp();
    cv_module.threshold(source, dest, THRESHOLD, THRESHOLD_MAX, cv_module.THRESH_BINARY);
    let hrend = getTimestamp();
    perf.push(getMs(hrstart, hrend));
  }

  const end = getTimestamp();
  printResult(getMs(start, end), perf);

  let dest_hash = Sha256.hash(dest.data.join('')); 
  if (dest_hash !== option.expected_dest_hash) {
    throw "Wrong result from cv_module.threshold()!";
  }

  source.delete();
  dest.delete();
}

function perfIntegral(cv_module, option) {
  let mat = cv_module.Mat.eye({height: option.height, width: option.width}, cv_module.CV_8UC1);
  let sum = new cv_module.Mat();
  let sqSum = new cv_module.Mat();

  console.log(`=== integral ===`);
  let perf = [];
  const start = getTimestamp();
  for (let i = 0; i < samples; ++i) {
    let hrstart = getTimestamp();
    cv_module.integral2(mat, sum, sqSum, -1, -1);
    let hrend = getTimestamp();
    perf.push(getMs(hrstart, hrend));
  }

  const end = getTimestamp();
  printResult(getMs(start, end), perf);

  let sum_hash = Sha256.hash(sum.data.join('')); 
  let sqSum_hash = Sha256.hash(sqSum.data.join('')); 
  if (sum_hash !== option.expected_sum_hash || sqSum_hash !== option.expected_sqSum_hash) {
    throw "Wrong result from cv_module.integral2()!";
  }

  mat.delete();
  sum.delete();
  sqSum.delete();
}
