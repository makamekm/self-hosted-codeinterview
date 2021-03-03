#!/bin/bash

perl -e 'alarm shift; exec @ARGV' $1 docker run --rm -v "$2":/data -w /data $3 $4 ./$5
