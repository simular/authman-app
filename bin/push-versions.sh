#! /bin/sh

NEW_VERSION=$(npm version $1 --no-git-tag-version)

sh $(dirname $0)/push-ios-version.sh "$NEW_VERSION"

#git commit -am "Prepare version: $NEW_VERSION"

sh ./release-ios.sh
