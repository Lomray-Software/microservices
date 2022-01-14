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

  universalSed "s/microservices-name/$NAME/g" "$MICROSERVICE_PATH/src/constants/index.ts"
  universalSed "s/microservices-name/microservices-$NAME/g" "$MICROSERVICE_PATH/package.json"
  universalSed "s/microservices-name/microservices-$NAME/g" "$MICROSERVICE_PATH/package-lock.json"
  universalSed "s/microservices-name/$NAME/g" "$MICROSERVICE_PATH/README.md"
  universalSed "s/microservices-name/$NAME/g" "$MICROSERVICE_PATH/__tests__/index-test.ts"
  universalSed "s/microservices-name/microservices-$NAME/g" "$MICROSERVICE_PATH/sonar-project.properties"
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

# Run "npm update package" in each microservice dir
function globalUpdatePackage() {
  PACKAGE=$1

  for microservice_dir in $(getMicroservices yes yes) ; do
    (set -e && cd "$microservice_dir" && grep -q "$PACKAGE" "package.json" && npm update $PACKAGE)

    echo "$microservice_dir - updated package $PACKAGE!"
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
  with_coverage="${1:-}"

  for microservice_dir in $(getMicroservices yes yes) ; do
    if [ "$with_coverage" == "yes" ]; then
      (set -e && cd "$microservice_dir" && nyc npm run test)
    else
      (set -e && cd "$microservice_dir" && npm run test)
    fi

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

# run build each microservice
function runBuild() {
  for microservice_dir in $(getMicroservices yes yes) ; do
    (set -e && cd "$microservice_dir" && npm run build)

    # @TODO Extra step, remove it after publish package
    cp ./packages/@lomray/microservice-helpers/lomray-microservice-helpers-1.0.0.tgz "$microservice_dir/lib/lomray-microservice-helpers-1.0.0.tgz"

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

# run semantic release
function runSemanticRelease() {
  with_dry_run="${1:-yes}"

  token=${GITHUB_TOKEN:=}
  branch=${GIT_BRANCH:=}
  npm_token=${NPM_TOKEN:=}

  for microservice_dir in $(getMicroservices yes yes) ; do
    if [ "$with_dry_run" == "yes" ]; then
      # shellcheck disable=SC2030
      (export NPM_TOKEN=$npm_token && export GITHUB_TOKEN=$token && export GIT_BRANCH=$branch && set -e && cd "$microservice_dir" && npx semantic-release --dryRun)
    else
      # shellcheck disable=SC2031
      (export NPM_TOKEN=$npm_token && export GITHUB_TOKEN=$token && export GIT_BRANCH=$branch && set -e && cd "$microservice_dir" && npx semantic-release)
    fi

    echo "$microservice_dir - updated!"
  done
}

case "$ACTION" in

  "create-ms")
    createMicroservice "${@:2}"
    ;;

  "global-install")
    globalInstall "${@:2}"
    ;;

  "global-update-package")
    globalUpdatePackage "${@:2}"
    ;;

  "ts-check")
    checkTypescript
    ;;

  "tests")
    runTests "${@:2}"
    ;;

  "lint")
    runLint "${@:2}"
    ;;

  "prettier")
    runPrettier "${@:2}"
    ;;

  "build")
    runBuild
    ;;

  "lint-staged")
    runLintStaged
    ;;

  "semantic-release")
    runSemanticRelease "${@:2}"
    ;;

esac
