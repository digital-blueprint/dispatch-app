#!/usr/bin/env bash
###############################################################
# Updates all vendor repositories to the latest main branch
###############################################################

git submodule foreach "git checkout main; git pull"
