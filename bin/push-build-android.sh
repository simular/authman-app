#! /bin/sh

source $(dirname $0)/functions/cross-replace.sh

CONFIG_FILE=$(realpath $(dirname $0)/../android/app/build.gradle)
PROJECT_PATH=$(realpath $(dirname $0)/../ios/App)

cd $PROJECT_PATH;

if [ -z $1 ]; then
  CURRENT_BUILD=$(sed -n 's/versionCode \([0-9]*\).*/\1/p' "$CONFIG_FILE")

  if [ -z $CURRENT_BUILD ]; then
    echo "Unable to get versionCode";
    exit 1;
  fi

  NEW_BUILD=$((CURRENT_BUILD + 1))
  else
  NEW_BUILD="$1"
fi

if [[ -z "$NEW_BUILD" ]]; then
    echo "Error: Empty build version."
    exit 1
fi

replace "s/versionCode \([0-9]*\).*/versionCode $NEW_BUILD/g" "$CONFIG_FILE"

echo "Update Android versionCode to: $NEW_BUILD"
