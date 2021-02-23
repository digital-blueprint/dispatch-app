#!/usr/bin/env bash
###############################################################
# Updates all vendor repositories to the latest master branch
###############################################################

git submodule foreach "git checkout master; git pull"
