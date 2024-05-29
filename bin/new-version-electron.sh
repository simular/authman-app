#! /bin/sh

if [[ -z "$1" ]]; then
    echo "Error: Please provide a version string."
    exit 1
fi

ELECTRON_PATH=$(realpath $(dirname $0)/../electron)
NEW_VERSION="$1"

cd $ELECTRON_PATH;
npm version $NEW_VERSION --no-git-tag-version >> /dev/null

echo "Update Electron package.json Version to: $NEW_VERSION"
