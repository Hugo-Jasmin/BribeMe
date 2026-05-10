import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getDataDir } from "../src/lib/config";
import { toDataUrl } from "../src/lib/media";
import { verifyImageSubmission } from "../src/lib/openrouter";
import type { Campaign, Venue } from "../src/lib/types";

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  await loadDotEnv();

  const fixturePath = path.join(
    getDataDir(),
    "fixtures",
    "friend-group-drinks-realistic.png",
  );
  await fs.mkdir(path.dirname(fixturePath), { recursive: true });

  const png = await readOrCreateFixture(fixturePath);

  const venue: Venue = {
    id: "ven_llm_demo",
    name: "BribeMe Demo Cafe",
    slug: "bribeme-demo-cafe",
    createdAt: new Date().toISOString(),
  };

  const campaign: Campaign = {
    id: "camp_llm_demo",
    venueId: venue.id,
    title: "Next round on us",
    challengePrompt:
      "Take a clear photo of your friend group at the table with drinks visible.",
    rewardLabel: "Next round on us",
    budgetCents: 10_000,
    maxRedemptions: 20,
    validationThreshold: 70,
    startsAt: null,
    endsAt: null,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await verifyImageSubmission({
    venue,
    campaign,
    imageDataUrl: toDataUrl(png, "image/png"),
  });

  console.log(
    JSON.stringify(
      {
        fixturePath,
        model: process.env.OPENROUTER_MODEL ?? "google/gemini-3-flash-preview",
        approved: result.approved,
        qualityScore: result.qualityScore,
        taskMatchScore: result.taskMatchScore,
        safetyScore: result.safetyScore,
        decisionReason: result.decisionReason,
        caption: result.caption,
        hashtags: result.hashtags,
      },
      null,
      2,
    ),
  );
}

async function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  try {
    const env = await fs.readFile(envPath, "utf8");
    for (const line of env.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator);
      const value = trimmed.slice(separator + 1);
      process.env[key] ??= value;
    }
  } catch {
    return;
  }
}

async function renderFixturePng() {
  const svg = `
    <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#f6efe7"/>
      <rect x="70" y="520" width="1060" height="210" rx="34" fill="#9b5f3d"/>
      <rect x="120" y="570" width="960" height="90" rx="22" fill="#7d472b"/>
      <text x="600" y="82" font-family="Arial, sans-serif" font-size="46" font-weight="700" text-anchor="middle" fill="#2d231f">Friend group at a cafe table with drinks</text>
      ${person(240, 280, "#2457a6", "A")}
      ${person(440, 255, "#c03546", "B")}
      ${person(650, 265, "#2f7d50", "C")}
      ${person(870, 285, "#7b4db7", "D")}
      ${drink(260, 565, "#e9c46a", "iced tea")}
      ${drink(455, 548, "#8ecae6", "water")}
      ${drink(655, 560, "#d4a373", "coffee")}
      ${drink(870, 548, "#f28482", "spritz")}
      <text x="600" y="718" font-family="Arial, sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="#fff">four friends + visible drinks</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function readOrCreateFixture(fixturePath: string) {
  try {
    return await fs.readFile(fixturePath);
  } catch {
    const png = await renderFixturePng();
    await fs.writeFile(fixturePath, png);
    return png;
  }
}

function person(x: number, y: number, shirt: string, label: string) {
  return `
    <circle cx="${x}" cy="${y}" r="64" fill="#d9a679"/>
    <circle cx="${x}" cy="${y - 28}" r="70" fill="#332018" opacity="0.3"/>
    <rect x="${x - 75}" y="${y + 66}" width="150" height="170" rx="48" fill="${shirt}"/>
    <text x="${x}" y="${y + 166}" font-family="Arial, sans-serif" font-size="42" font-weight="700" text-anchor="middle" fill="#ffffff">${label}</text>
  `;
}

function drink(x: number, y: number, liquid: string, label: string) {
  return `
    <rect x="${x - 35}" y="${y - 95}" width="70" height="120" rx="14" fill="#ffffff" opacity="0.86"/>
    <rect x="${x - 28}" y="${y - 38}" width="56" height="56" rx="8" fill="${liquid}"/>
    <line x1="${x + 18}" y1="${y - 110}" x2="${x + 44}" y2="${y + 16}" stroke="#ffffff" stroke-width="8"/>
    <text x="${x}" y="${y + 72}" font-family="Arial, sans-serif" font-size="22" text-anchor="middle" fill="#fff">${label}</text>
  `;
}
