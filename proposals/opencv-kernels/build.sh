#! /bin/bash

git submodule init
git submodule update

cd opencv
python ./platforms/js/build_js.py build_wasm --build_wasm

cp build_wasm/bin/opencv.js ..
