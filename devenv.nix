{
  pkgs,
  ...
}:
{
  # More config is provided by input shared

  packages = with pkgs; [
    sshuttle # For connecting to the dev server for API requests to Vendo
  ];

  enterShell = ''
    echo "🛠️ DBP Dispatch App Dev Shell"
  '';
}
