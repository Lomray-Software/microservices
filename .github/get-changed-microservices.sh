#!/usr/bin/env bash

#FILES=${FILES:=""}

FILES=".github/get-changed-microservices.sh .github/workflows/pr-check.yml .github/workflows/release.yml .run/gateway.run.xml microservices/gateway/__tests__/index-test.ts microservices/gateway/src/index.ts operations.sh"

list=()

for changed_file in $FILES; do
  # skip not /microservices/ dir
  if [[ "$changed_file" != *"microservices/"* ]]; then
    continue
  fi

  # remove part of path before microservice name
  root=${changed_file#*"microservices/"}
  microservice=${root%%"/"*}

  # skip duplicates
  if [[ -n "${list[$microservice]}" ]]; then
    continue
  fi

  list+=("\"$microservice\"")
done

function join_by {
  local IFS="$1"; shift; echo "$*";
}

names=$(join_by , "${list[@]}")

if [ "$names" != "" ]; then
  names="[$names]"
fi

echo "::set-output name=list::$names"
echo "::set-output name=list-spaced::$names"
