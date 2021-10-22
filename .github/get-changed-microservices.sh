#!/usr/bin/env bash

FILES=${FILES:=""}

list=()

for changed_file in $FILES; do
  if [[ "$changed_file" != *"microservices"* ]]; then
    continue
  fi

  # remove part of path before microservice name
  root=${changed_file#*"microservices/"}
  microservice=${root%%"/"*}

  echo $microservice

  list+=("$microservice")
done

function join_by {
  local IFS="$1"; shift; echo "$*";
}

names=$(join_by , "${list[@]}")

echo "::set-output name=list::$names"
