import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || "{}"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SPREADSHEET_ID || "";
    
    // Try to get players from the Cumulative Stats sheet first, then fallback to RAW Stats
    let range = "Cumulative Stats!D:D";
    let response;
    
    try {
      response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
    } catch (error) {
      // Fallback to RAW Stats sheet if Cumulative Stats doesn't exist
      range = "RAW Stats!D:D";
      response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
    }

    const rows = response.data.values || [];

    // Flatten & remove empty entries
    const players = rows.flat().filter((name) => name && name.toString().trim() !== "");

    return NextResponse.json(players);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}
