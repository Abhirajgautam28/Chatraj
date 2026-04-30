#!/bin/bash
if [[ "$OSTYPE" == "linux-gnu"* ]] && [ -z "$DISPLAY" ]; then
    xvfb-run npx playwright test "$@"
else
    npx playwright test "$@"
fi
