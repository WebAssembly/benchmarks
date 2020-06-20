#!/bin/bash
git clone https://github.com/opencv/opencv.git
cd opencv
git checkout -b V_4_3_0 4.3.0
python ./platforms/js/build_js.py build_wasm --build_wasm