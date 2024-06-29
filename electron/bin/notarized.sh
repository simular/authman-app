xcrun notarytool submit dist/Authman-macOS.dmg --wait --apple-id "$APPLE_ID" \
  --password "$APPLE_ID_PASSWORD" \
  --team-id "$APPLE_TEAM_ID";

xcrun stapler staple dist/Authman-macOS.dmg;
