import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || "{}"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Spreadsheet ID not configured" },
        { status: 500 }
      );
    }

    // Get the RAW STAT ENTRIES sheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "RAW STAT ENTRIES!A:E",
    });

    const rows = response.data.values || [];
    
    if (rows.length <= 1) {
      // Only header row or empty
      return NextResponse.json({ 
        hasLastEntry: false,
        message: "No stat entries found" 
      });
    }
    
    // Get the last row (most recent entry)
    const lastRow = rows[rows.length - 1];
    
    // Expected format: [Player, Stat, Timestamp, Count, Notes]
    const lastEntry = {
      player: lastRow[0] || '',
      stat: lastRow[1] || '',
      timestamp: lastRow[2] || '',
      count: lastRow[3] || '1',
      notes: lastRow[4] || '',
      rowNumber: rows.length // The row number in the sheet (1-indexed)
    };

    return NextResponse.json({ 
      hasLastEntry: true,
      lastEntry 
    });

  } catch (error) {
    console.error("Error fetching last stat entry:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch last stat entry", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
