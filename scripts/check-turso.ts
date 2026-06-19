import { getDb } from "../src/lib/db";
import { listCampaigns, listVenues } from "../src/lib/repositories";

const url = process.env.TURSO_DATABASE_URL;

if (!url) {
  throw new Error("TURSO_DATABASE_URL is not set.");
}
const databaseUrl = url;

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const db = await getDb();
  const tables = await db.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
  );
  const [venues, campaigns] = await Promise.all([listVenues(), listCampaigns()]);

  console.log(
    JSON.stringify(
      {
        ok: true,
        url: maskUrl(databaseUrl),
        tables: tables.rows.map((row) => row.name),
        venueCount: venues.length,
        campaignCount: campaigns.length,
        latestCampaign: campaigns[0]
          ? {
              id: campaigns[0].id,
              title: campaigns[0].title,
              venueId: campaigns[0].venueId,
              status: campaigns[0].status,
            }
          : null,
      },
      null,
      2,
    ),
  );

  db.close();
}

function maskUrl(value: string) {
  const parsed = new URL(value);
  const [database, ...rest] = parsed.hostname.split(".");
  parsed.hostname = [`${database.slice(0, 3)}...`, ...rest].join(".");
  return parsed.toString();
}
