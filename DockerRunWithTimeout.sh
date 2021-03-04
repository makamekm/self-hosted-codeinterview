#!/bin/bash

docker run --rm -v "$2":/data -w /data $3 timeout $1 $4 ./$5
