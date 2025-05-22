{ pkgs ? import <nixpkgs> {} }:
  pkgs.mkShell {
    # nativeBuildInputs is usually what you want -- tools you need to run
    nativeBuildInputs = with pkgs; [
      nodejs_22
      zellij # smart terminal workspace
      lazygit # git terminal
    ];

    shellHook = ''
      export CHROMIUM_BIN=${pkgs.chromium}/bin/chromium
      export FIREFOX_BIN=${pkgs.firefox}/bin/firefox

      echo "Using chromium at $CHROMIUM_BIN and firefox at $FIREFOX_BIN for karma tests"
    '';
}
