#!/bin/bash
cd /home/kavia/workspace/code-generation/pixel-nightmares-animatronic-assault-111254-f6d49b64/horror_pixel_shooter_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

