#!/bin/bash
if [[ "$OSTYPE" == "linux-gnu"* ]] && [ -z "$DISPLAY" ] && [ "$CI" != "true" ]; then
    xvfb-run -a npx playwright test "$@"
else
    npx playwright test "$@"
fi
