const requiredMajor = 24;
const currentVersion = process.versions.node;
const currentMajor = Number(currentVersion.split(".")[0]);

if (currentMajor !== requiredMajor) {
  console.error(
    [
      `Bribe requires Node ${requiredMajor}.x for local development.`,
      `Detected Node ${currentVersion}.`,
      "",
      "Node 26 makes the current Tailwind/Turbopack toolchain print repeated DEP0205 module.register() deprecation warnings during CSS compilation.",
      "",
      "Use one of:",
      "  nvm use",
      "  fnm use",
      "  mise use",
      "  PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run dev",
    ].join("\n"),
  );
  process.exit(1);
}
