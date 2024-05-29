#! /bin/sh

CONFIG_FILE=$(realpath $(dirname $0)/../ios/App/App.xcodeproj/project.pbxproj)
PROJECT_PATH=$(realpath $(dirname $0)/../ios/App)

cd $PROJECT_PATH;

if [ -z $1 ]; then
  CURRENT_BUILD=$(agvtool vers -terse)
  NEW_BUILD=$((CURRENT_BUILD + 1))
  else
  NEW_BUILD="$1"
fi

if [[ -z "$NEW_BUILD" ]]; then
    echo "Error: Empty build version."
    exit 1
fi

sed -i '' "s/CURRENT_PROJECT_VERSION = [^;]*;/CURRENT_PROJECT_VERSION = $NEW_BUILD;/g" "$CONFIG_FILE"

echo "Update iOS CURRENT_PROJECT_VERSION to: $NEW_BUILD"
