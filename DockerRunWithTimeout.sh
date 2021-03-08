#!/bin/bash

all_args=("$@")
timeout_arg=$1
mount_dir_arg=$2
image_arg=$3
rest_args="${@:4}"

docker run --rm -v "$mount_dir_arg":/data -w /data $image_arg timeout $timeout_arg bash -c "$rest_args"
