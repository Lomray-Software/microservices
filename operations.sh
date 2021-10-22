#!/usr/bin/env bash

set -e

ACTION=$1
MICROSERVICE_TEMPLATE_DIR=template
MICROSERVICES_DIR=microservices
ONLY=${ONLY:=}

function universalSed() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i "" "$1" "$2"
  else
      sed -i "$1" "$2"
  fi
}

# Get microservices list
function getMicroservices() {
  with_dir=${1:=}
  check_json=${2:=}

  list=()

  for microserviceDir in "$MICROSERVICES_DIR"/* ; do
    name=$(basename "$microserviceDir")

    if [[ "$ONLY" != "" ]] && [[ "$ONLY" != *"$name"* ]]; then
      continue
    fi

    if [[ "$check_json" == "yes" ]] && [[ ! -f "$MICROSERVICES_DIR/$name/package.json" ]]; then
      continue
    fi

    if [ "$with_dir" == "yes" ]; then
      name="$MICROSERVICES_DIR/$name"
    fi

    list+=("$name")
  done

  echo "${list[@]}"
}

# Create microservice from template
function createMicroservice() {
  NAME=$1
  MICROSERVICE_PATH="$MICROSERVICES_DIR/$NAME"

  if [ -d "$MICROSERVICE_PATH" ]; then
    echo "Microservice exist!"
    exit
  fi

  cp -R "$MICROSERVICE_TEMPLATE_DIR" "$MICROSERVICE_PATH"

  universalSed "s/microservices-name/$NAME/g" "$MICROSERVICE_PATH/src/constants/environment.ts"
  universalSed "s/microservices-name/microservices-$NAME/g" "$MICROSERVICE_PATH/package.json"
  universalSed "s/microservices-name/microservices-$NAME/g" "$MICROSERVICE_PATH/package-lock.json"
  universalSed "s/microservices-name/$NAME/g" "$MICROSERVICE_PATH/README.md"
  universalSed "s/.eslintrc.js/..\/.eslintrc.js/g" "$MICROSERVICE_PATH/.eslintrc.js"

  cd "$MICROSERVICE_PATH" && npm ci

  echo "Done."
}

# Run "npm install" in each microservice dir
function globalInstall() {
  SHOULD_UPDATE=$1

  for microservice_dir in $(getMicroservices yes yes) ; do
    if [ "$SHOULD_UPDATE" == "update" ]; then
      (set -e && cd "$microservice_dir" && npm i)
    else
      (set -e && cd "$microservice_dir" && npm ci)
    fi

    echo "$microservice_dir - installed!"
  done
}

# check typescript for each microservice
function checkTypescript() {
  for microservice_dir in $(getMicroservices yes yes) ; do
    (set -e && cd "$microservice_dir" && npm run "ts:check")

    echo "$microservice_dir - checked!"
  done
}

# run tests for each microservice
function runTests() {
  for microservice_dir in $(getMicroservices yes yes) ; do
    (set -e && cd "$microservice_dir" && npm run test)

    echo "$microservice_dir - passed!"
  done
}

# run linter for each microservice
function runLint() {
  ACTION="${1:-check}"

  for microservice_dir in $(getMicroservices yes yes) ; do
    (set -e && cd "$microservice_dir" && npm run "lint:$ACTION")

    echo "$microservice_dir - done!"
  done
}

# run prettier for each microservice
function runPrettier() {
  ACTION="${1:-check}"

  for microservice_dir in $(getMicroservices yes yes) ; do
    (set -e && cd "$microservice_dir" && npm run "prettier:$ACTION")

    echo "$microservice_dir - done!"
  done
}

# run lint-staged for each microservice
function runLintStaged() {
  for microservice_dir in $(getMicroservices yes yes) ; do
    (set -e && cd "$microservice_dir" && npx lint-staged)

    echo "$microservice_dir - done!"
  done
}

case "$ACTION" in

  "create-ms")
    createMicroservice "${@:2}"
    ;;

  "global-install")
    globalInstall "${@:2}"
    ;;

  "ts-check")
    checkTypescript
    ;;

  "tests")
    runTests
    ;;

  "lint")
    runLint "${@:2}"
    ;;

  "prettier")
    runPrettier "${@:2}"
    ;;

  "lint-staged")
    runLintStaged
    ;;

esac
