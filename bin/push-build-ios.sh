#! /bin/sh

source $(dirname $0)/functions/cross-replace.sh

CONFIG_FILE=$(realpath $(dirname $0)/../ios/App/App.xcodeproj/project.pbxproj)
PROJECT_PATH=$(realpath $(dirname $0)/../ios/App)

cd $PROJECT_PATH;

if [ -z $1 ]; then
  CURRENT_BUILD=$(sed -n 's/CURRENT_PROJECT_VERSION = \([0-9]*\);/\1/p' "$CONFIG_FILE")

  # CURRENT_PROJECT_VERSION has 2 lines, return value will contains 2 numbers.
  # We split them and only get first.
  read -r CURRENT_BUILD _ <<< "$CURRENT_BUILD";

  if [ -z $CURRENT_BUILD ]; then
    echo "Unable to get CURRENT_PROJECT_VERSION";
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

replace "s/CURRENT_PROJECT_VERSION = [^;]*;/CURRENT_PROJECT_VERSION = $NEW_BUILD;/g" "$CONFIG_FILE"

echo "Update iOS CURRENT_PROJECT_VERSION to: $NEW_BUILD"
