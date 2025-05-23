# Use `just <recipe>` to run a recipe
# https://just.systems/man/en/

import "vendor/toolkit/shared/justfile"

# By default, run the `--list` command
default:
    @just --list

# Variables

zellijSession := "dispatch-app"
