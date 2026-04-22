#! /bin/bash

rm -rf .netlify .dist
npm run build
rm -rf .netlify .dist