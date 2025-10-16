import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, attendance } = body;

    if (!date || !attendance || !Array.isArray(attendance)) {
      return NextResponse.json(
        { error: "Missing required fields: date, attendance" },
        { status: 400 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || "{}"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Spreadsheet ID not configured" },
        { status: 500 }
      );
    }

    // Check if Attendance sheet exists, create if it doesn't
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets?.map(sheet => sheet.properties?.title) || [];
    
    if (!existingSheets.includes("Attendance")) {
      console.log("Creating Attendance sheet...");
      
      const createSheetRequest = {
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: "Attendance",
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 10
                }
              }
            }
          }]
        }
      };

      await sheets.spreadsheets.batchUpdate(createSheetRequest);
      
      // Set up the attendance sheet with headers
      await setupAttendanceSheet(sheets, spreadsheetId);
      
      console.log("Successfully created and configured Attendance sheet");
    }

    // Check if attendance for this date already exists in the practice records
    const existingPracticeData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Attendance!A:Z",
    });

    const existingRows = existingPracticeData.data.values || [];
    const headerRow = existingRows[0] || [];
    // Skip the first row (headers) and second row (totals) when checking for existing dates
    const existingDates = existingRows.slice(2).map(row => row[0]).filter(date => date);
    
    if (existingDates.includes(date)) {
      return NextResponse.json(
        { error: `❌ STOP: Attendance for ${date} has already been recorded! You cannot record attendance twice for the same practice date.` },
        { status: 409 }
      );
    }

    // Only record present players (we only care about total days attended)
    const presentPlayers = attendance.filter(record => record.present);
    
    if (presentPlayers.length === 0) {
      return NextResponse.json(
        { error: "No players marked as present" },
        { status: 400 }
      );
    }

    // Get all unique player names from the roster
    const allPlayers = attendance.map(record => record.playerName);
    const uniquePlayers = [...new Set(allPlayers)];

    // Create the practice record row: [Date, Player1, Player2, Player3, ...]
    const practiceRow = [date];
    uniquePlayers.forEach(playerName => {
      const wasPresent = presentPlayers.some(record => record.playerName === playerName);
      practiceRow.push(wasPresent ? 1 : 0);
    });

    // If this is the first practice record, we need to create headers and totals row
    if (existingRows.length === 0) {
      const headerRow = ["Date", ...uniquePlayers];
      // Create formulas for totals - starting from row 3 (after headers and totals row)
      const totalsRow = ["TOTALS"];
      uniquePlayers.forEach((playerName, index) => {
        const columnLetter = String.fromCharCode(66 + index); // B, C, D, etc. (B = column 2)
        totalsRow.push('');
      });
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Attendance!A1",
        valueInputOption: "RAW",
        requestBody: {
          values: [headerRow, totalsRow],
        },
      });
    } else {
      // Update the totals row formulas to include the new row
      const totalsRow = ["TOTALS"];
      const lastRowNumber = existingRows.length + 1; // +1 because we're adding a new row
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Attendance!A2",
        valueInputOption: "RAW",
        requestBody: {
          values: [totalsRow],
        },
      });
    }

    // Add the practice record
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Attendance!A:Z",
      valueInputOption: "RAW",
      requestBody: {
        values: [practiceRow],
      },
    });

    console.log("Successfully recorded attendance:", result.data);
    
    return NextResponse.json({ 
      success: true, 
      message: `Attendance recorded for ${date}`,
      date: date,
      presentCount: presentPlayers.length,
      totalCount: attendance.length,
      data: result.data 
    });

  } catch (error) {
    console.error("Error in attendance API:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

// Helper function to set up the attendance sheet with headers
async function setupAttendanceSheet(sheets: any, spreadsheetId: string) {
  // We'll create headers dynamically when the first attendance is recorded
  // This function is kept for consistency but headers are created in the main logic
  console.log("Attendance sheet created - headers will be added with first attendance record");
}

// Helper function to get attendance sheet ID
async function getAttendanceSheetId(sheets: any, spreadsheetId: string): Promise<number> {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === "Attendance");
  return sheet?.properties?.sheetId || 0;
}
