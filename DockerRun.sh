#!/bin/bash

docker run --rm -it -v "$1":/data -w /data node bash
