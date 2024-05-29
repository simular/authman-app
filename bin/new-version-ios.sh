#! /bin/sh

source $(dirname $0)/functions/cross-replace.sh

if [[ -z "$1" ]]; then
    echo "Error: Please provide a version string."
    exit 1
fi

CONFIG_FILE=$(realpath $(dirname $0)/../ios/App/App.xcodeproj/project.pbxproj)
NEW_VERSION="$1"

replace "s/MARKETING_VERSION = [^;]*;/MARKETING_VERSION = $NEW_VERSION;/g" "$CONFIG_FILE"

echo "Update iOS MARKETING_VERSION to: $NEW_VERSION"
