#! /bin/bash

rm -rf .nuxt .netlify .dist
bun run build
rm -rf .nuxt .netlify .dist