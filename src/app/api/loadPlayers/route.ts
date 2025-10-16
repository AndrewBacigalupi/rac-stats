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
    
    // Try to get players from a Roster sheet (with numbers, names, and shortened names)
    let range = "Roster!A:D"; // Column A: Numbers, Column B: Names, Column C: (empty), Column D: Shortened Names
    let response;
    
    try {
      response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
    } catch (error) {
      // Fallback to Cumulative Stats sheet for names only
      try {
        range = "RAW STAT ENTRIES!D:D";
        response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });
      } catch (error2) {
        // Final fallback to RAW Stats sheet
        range = "RAW STAT ENTRIES!D:D";
        response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });
      }
    }

    const rows = response.data.values || [];

    // Check if we have three columns (A:B:D format with numbers, names, and shortened names)
    if (rows.length > 0 && rows[0].length >= 3) {
      const players = rows
        .slice(1) // Skip header row
        .filter(row => row[0] && row[3] && row[0].toString().trim() !== "" && row[3].toString().trim() !== "")
        .map(row => {
          const number = row[0]?.toString().trim() || "";
          const shortenedName = row[3]?.toString().trim() || ""; // Column D (index 3)
          return `${shortenedName}: ${number}`;
        })
        .filter(name => name !== "");

      return NextResponse.json(players);
    } else if (rows.length > 0 && rows[0].length >= 2) {
      // Fallback to two columns (A:B format with numbers and names)
      const players = rows
        .slice(1) // Skip header row
        .filter(row => row[0] && row[1] && row[0].toString().trim() !== "" && row[1].toString().trim() !== "")
        .map(row => {
          const number = row[0]?.toString().trim() || "";
          const name = row[1]?.toString().trim() || "";
          return `${name}: ${number}`;
        })
        .filter(name => name !== "");

      return NextResponse.json(players);
    } else {
      // Handle single column data that might be in "Number - Name" format
      const players = rows
        .flat()
        .filter((item) => item && item.toString().trim() !== "")
        .filter(item => item.toString().trim() !== "Number" && item.toString().trim() !== "First Name") // Filter out headers
        .map(item => {
          const itemStr = item.toString().trim();
          // Check if it's in "Number - Name" format and convert to "Name - Number"
          if (itemStr.includes(' - ')) {
            const parts = itemStr.split(' - ');
            const firstPart = parts[0].trim();
            const secondPart = parts[1].trim();
            
            // If first part is a number, convert to "Name - Number"
            if (!isNaN(parseInt(firstPart))) {
              return `${secondPart} - ${firstPart}`;
            }
            // If it's already in "Name - Number" format, keep it
            return itemStr;
          }
          return itemStr;
        })
        .filter(name => name !== "");

      return NextResponse.json(players);
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}
