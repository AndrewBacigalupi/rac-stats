import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || "{}"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SPREADSHEET_ID!;

    // Use the "Cumulative Stats" sheet to get leader data
    const sheetName = "Cumulative Stats";
    const range = `${sheetName}!A:D`; // A=name, B=stat, C=timestamp, D=count

    // Read all data from the specified sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    // Aggregate stats by player
    const statsMap: Record<string, Record<string, number>> = {};

    rows.slice(1).forEach((row: any[]) => { // Skip header
      const [name, stat, timestamp, countStr] = row;
      const count = parseInt(countStr, 10) || 0;

      if (!statsMap[name]) {
        statsMap[name] = {};
      }
      if (!statsMap[name][stat]) {
        statsMap[name][stat] = 0;
      }
      statsMap[name][stat] += count;
    });

    // Compute leaders: top 3 for each stat category
    const statCategories = ["3PMAKE", "3PMISS", "OREB", "DREB", "ASSIST", "TO"]; // PLACEHOLDER: Add or remove categories as needed
    const leaders: Record<string, { name: string; count: number }[]> = {};

    statCategories.forEach(stat => {
      const playerStats = Object.entries(statsMap)
        .map(([name, stats]) => ({ name, count: stats[stat] || 0 }))
        .sort((a, b) => b.count - a.count) // Sort descending (highest first)
        .slice(0, 3); // Top 3

      leaders[stat] = playerStats;
    });

    return NextResponse.json(leaders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load leaders" }, { status: 500 });
  }
}