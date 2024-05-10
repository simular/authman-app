#! /bin/sh

ACTION="${1:-open}"
MODE="${2:-development}"

echo "cross-env NODE_ENV=${MODE} ionic cap ${ACTION} @capacitor-community/electron -- --mode ${MODE}";
cross-env NODE_ENV=${MODE} ionic cap ${ACTION} @capacitor-community/electron -- --mode ${MODE}
