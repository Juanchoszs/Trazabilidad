
import 'dotenv/config';
import { sql } from '../lib/db';

async function checkStatuses() {
  try {
    const result = await sql`
      SELECT DISTINCT estado 
      FROM natura_shipments 
      ORDER BY estado
    `;
    console.log('Natura Statuses:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkStatuses();
