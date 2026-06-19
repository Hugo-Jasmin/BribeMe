import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const requiredMajor = 24;
const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Usage: node scripts/use-node-24.mjs <command> [...args]");
  process.exit(1);
}

function runWithPath(binDir) {
  const localBin = join(dirname(new URL(import.meta.url).pathname), "..", "node_modules", ".bin");
  const sep = process.platform === "win32" ? ";" : ":";
  const env = {
    ...process.env,
    PATH: `${binDir}${sep}${localBin}${process.env.PATH ? `${sep}${process.env.PATH}` : ""}`,
  };

  const child = spawn(command, args, {
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  child.on("exit", (code, signal) => {
    if (signal === "SIGINT") {
      process.exit(130);
    }
    if (signal === "SIGTERM") {
      process.exit(143);
    }
    process.exit(code ?? 1);
  });
}

function getNodeMajor(nodeBin) {
  const result = spawnSync(nodeBin, ["-p", "process.versions.node"], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return null;
  }

  return Number(result.stdout.trim().split(".")[0]);
}

function findNode24BinDir() {
  const candidates = [
    process.env.BRIBE_NODE24_BIN,
    "/opt/homebrew/opt/node@24/bin",
    "/usr/local/opt/node@24/bin",
  ].filter(Boolean);

  for (const brewBin of ["/opt/homebrew/bin/brew", "/usr/local/bin/brew", "brew"]) {
    const result = spawnSync(brewBin, ["--prefix", "node@24"], {
      encoding: "utf8",
    });
    if (result.status === 0) {
      candidates.push(join(result.stdout.trim(), "bin"));
    }
  }

  for (const binDir of candidates) {
    const nodeBin = join(binDir, "node");
    if (existsSync(nodeBin) && getNodeMajor(nodeBin) === requiredMajor) {
      return binDir;
    }
  }

  return null;
}

const currentMajor = Number(process.versions.node.split(".")[0]);

if (currentMajor === requiredMajor) {
  runWithPath(dirname(process.execPath));
} else {
  const node24BinDir = findNode24BinDir();

  if (!node24BinDir) {
    console.error(
      [
        `Bribe needs Node ${requiredMajor}.x, but this shell is using Node ${process.versions.node}.`,
        "I could not find a local Node 24 install automatically.",
        "",
        "Install it with:",
        "  brew install node@24",
        "",
        "Or point the wrapper at a custom install:",
        "  BRIBE_NODE24_BIN=/path/to/node24/bin npm run dev",
      ].join("\n"),
    );
    process.exit(1);
  }

  runWithPath(node24BinDir);
}
