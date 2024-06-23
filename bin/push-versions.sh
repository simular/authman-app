#! /bin/sh

if [ -z $1 ]; then
  echo "Please provide version name or version type:";
  echo "  [major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]";
  exit 1;
fi

BASE=$(dirname $0)
NEW_VERSION=$(npm version $1 --no-git-tag-version)

echo "Update package.json Version to: $NEW_VERSION"

# iOS
sh $BASE/push-build-ios.sh
sh $BASE/new-version-ios.sh "$NEW_VERSION"

# Android
sh $BASE/push-build-android.sh
sh $BASE/new-version-android.sh "$NEW_VERSION"

# Electron
sh $BASE/new-version-electron.sh "$NEW_VERSION"
