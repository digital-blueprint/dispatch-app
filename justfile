# Use `just <recipe>` to run a recipe
# https://just.systems/man/en/

import ".shared/common.just"
import ".shared/dbp-app.just"

# By default, run the `--list` command
default:
    @just --list

# Variables

zellijSession := "dispatch-app"
