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

    // Get today's date in EST/EDT timezone (consistent with attendance recording)
    const now = new Date();
    const today = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    }).format(now);

    // Get yesterday's date for comparison
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    }).format(yesterday);

    // Get attendance data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Attendance!A:Z",
    });

    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return NextResponse.json({ 
        attendanceTaken: false,
        today,
        message: "No attendance records found"
      });
    }
    
    // Skip the first row (headers) and second row (totals) when checking for existing dates
    const existingDates = rows.slice(2).map(row => row[0]).filter(date => date);
    
    // Check if attendance was taken today
    const attendanceTakenToday = existingDates.includes(today);
    
    // Check if attendance was taken yesterday (for context)
    const attendanceTakenYesterday = existingDates.includes(yesterdayFormatted);

    return NextResponse.json({ 
      attendanceTaken: attendanceTakenToday,
      today,
      yesterday: yesterdayFormatted,
      attendanceTakenYesterday,
      message: attendanceTakenToday 
        ? `Attendance already taken for ${today}` 
        : `Attendance available for ${today}`
    });

  } catch (error) {
    console.error("Error checking attendance:", error);
    return NextResponse.json(
      { 
        error: "Failed to check attendance", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
