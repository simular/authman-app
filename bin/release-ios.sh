#! /bin/sh

# Define the path to your project and the scheme
PROJECT_PATH="ios/App/App.xcodeproj"
SCHEME="Authman"

cd "$PROJECT_PATH"

# Build and archive the project
xcodebuild -project "$PROJECT_PATH" -scheme "$SCHEME" -configuration Release clean archive -archivePath "./build/$SCHEME.xcarchive"

# Export the .ipa file for App Store
xcodebuild -exportArchive -archivePath "./build/$SCHEME.xcarchive" -exportPath "./build" -exportOptionsPlist "/path/to/your/exportOptions.plist"

# Note: Make sure to specify the correct path to your exportOptions.plist file which includes the method as app-store and other necessary configurations.
