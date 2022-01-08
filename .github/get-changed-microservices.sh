#!/usr/bin/env bash

FILES=${FILES:=""}

list=()
list_spaced=()

for changed_file in $FILES; do
  # skip not /microservices/ dir
  if [[ "$changed_file" != *"microservices/"* ]]; then
    continue
  fi

  # remove part of path before microservice name
  root=${changed_file#*"microservices/"}
  microservice=${root%%"/"*}

  # skip duplicates
  if [[ ${list[*]} =~ $microservice ]]; then
    continue
  fi

  list+=("\"$microservice\"")
  list_spaced+=("$microservice")
done

function join_by {
  local IFS="$1"; shift; echo "$*";
}

names=$(join_by , "${list[@]}")
names_spaced="${list_spaced[*]}"

if [ "$names" != "" ]; then
  names="[$names]"
fi

echo "Result: $names"

# output example: "[demo1,demo2,demo3]"
echo "::set-output name=list::$names"
# output example: "demo1 demo2 demo3"
echo "::set-output name=list-spaced::$names_spaced"
