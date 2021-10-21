#!/usr/bin/env bash

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

  universalSed "s/microservices-name/$NAME/g" "$MICROSERVICE_PATH/index.ts"
  universalSed "s/microservices-name/microservices-$NAME/g" "$MICROSERVICE_PATH/package.json"
  universalSed "s/microservices-name/microservices-$NAME/g" "$MICROSERVICE_PATH/package-lock.json"
  universalSed "s/microservices-name/$NAME/g" "$MICROSERVICE_PATH/README.md"

  cd "$MICROSERVICE_PATH" && npm ci

  echo "Done."
}

# Run "npm install" in each microservice dir
function globalInstall() {
  SHOULD_UPDATE=$1

  for microserviceDir in "$MICROSERVICES_DIR"/* ; do
    if [ "$SHOULD_UPDATE" == "update" ]; then
      (cd "$microserviceDir" && npm i)
    else
      (cd "$microserviceDir" && npm ci)
    fi

    echo "${microserviceDir} - installed!"
  done
}

case "$ACTION" in

  "create-ms")
    createMicroservice "${@:2}"
    ;;

  "global-install")
    globalInstall "${@:2}"
    ;;

esac
