#! /bin/sh

source $(dirname $0)/functions/cross-replace.sh

if [[ -z "$1" ]]; then
    echo "Error: Please provide a version string."
    exit 1
fi

CONFIG_FILE=$(realpath $(dirname $0)/../android/app/build.gradle)
NEW_VERSION="$1"

replace "s/versionName \"[^\"]*\"/versionName \"$NEW_VERSION\"/g" "$CONFIG_FILE"

echo "Update Android versionName to: $NEW_VERSION"
