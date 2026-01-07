import { sql } from "./lib/db.js";

async function check() {
  const result = await sql`SELECT COUNT(*) FROM natura_shipments`;
  console.log("Natura count:", result[0]);
  const samples = await sql`SELECT guia FROM natura_shipments LIMIT 5`;
  console.log("Natura sample guides:", samples);
}

check().catch(console.error);
