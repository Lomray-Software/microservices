#!/usr/bin/env bash

set -e

ACTION=$1
MICROSERVICE_TEMPLATE_DIR=template
MICROSERVICES_DIR=microservices

function universalSed() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i "" "$1" "$2"
  else
      sed -i "$1" "$2"
  fi
}

# Get microservices list
function getMicroservices() {
  list=()

  for microserviceDir in "$MICROSERVICES_DIR"/* ; do
      list+=("$(basename "$microserviceDir")")
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

  for microserviceDir in "$MICROSERVICES_DIR"/* ; do
    if [ "$SHOULD_UPDATE" == "update" ]; then
      (set -e && cd "$microserviceDir" && npm i)
    else
      (set -e && cd "$microserviceDir" && npm ci)
    fi

    echo "${microserviceDir} - installed!"
  done
}

# check typescript for each microservice
function checkTypescript() {
  for microserviceDir in "$MICROSERVICES_DIR"/* ; do
    (set -e && cd "$microserviceDir" && npm run ts:check)

    echo "${microserviceDir} - checked!"
  done
}

# run tests for each microservice
function runTests() {
  for microserviceDir in "$MICROSERVICES_DIR"/* ; do
    (set -e && cd "$microserviceDir" && npm run test)

    echo "${microserviceDir} - passed!"
  done
}

# run linter for each microservice
function runLint() {
  ACTION="${1:-check}"

  for microserviceDir in "$MICROSERVICES_DIR"/* ; do
    (set -e && cd "$microserviceDir" && npm run lint:"$ACTION")

    echo "${microserviceDir} - done!"
  done
}

# run prettier for each microservice
function runPrettier() {
  ACTION="${1:-check}"

  for microserviceDir in "$MICROSERVICES_DIR"/* ; do
    (set -e && cd "$microserviceDir" && npm run prettier:"$ACTION")

    echo "${microserviceDir} - done!"
  done
}

# run lint-staged for each microservice
function runLintStaged() {
  for microserviceDir in "$MICROSERVICES_DIR"/* ; do
    (set -e && cd "$microserviceDir" && npx lint-staged)

    echo "${microserviceDir} - done!"
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
