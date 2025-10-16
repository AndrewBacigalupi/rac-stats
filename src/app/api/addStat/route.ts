import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    
    
    // Check environment variables
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
    const spreadsheetId = process.env.SPREADSHEET_ID;
    
    
    
    if (!spreadsheetId) {
      console.error("SPREADSHEET_ID not configured");
      return NextResponse.json(
        { error: "Spreadsheet ID not configured. Check your .env.local file." },
        { status: 500 }
      );
    }

    if (!credentials) {
      console.error("GOOGLE_SERVICE_ACCOUNT_CREDENTIALS not configured");
      return NextResponse.json(
        { error: "Google credentials not configured. Check your .env.local file." },
        { status: 500 }
      );
    }

    // Try to parse credentials
    let parsedCredentials;
    try {
      parsedCredentials = JSON.parse(credentials);
      
    } catch (parseError) {
      console.error("Failed to parse credentials JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid credentials format. Check your .env.local file." },
        { status: 500 }
      );
    }

    console.log("Creating Google Auth...");
    const auth = new google.auth.GoogleAuth({
      credentials: parsedCredentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    
    const sheets = google.sheets({ version: "v4", auth });

    

    // Try to read the first few rows to test connection
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "RAW STAT ENTRIES!A1:D5",
    });

    

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Google Sheets",
      data: result.data.values || [],
      rowCount: result.data.values?.length || 0
    });

  } catch (error) {
    console.error("Error testing Google Sheets connection:", error);
    console.error("Error details:", {
    });
    
    return NextResponse.json(
      { 
        error: "Failed to connect to Google Sheets", 
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    
    const { name, stat, timestamp, count } = body;

    if (!name || !stat || !timestamp || count === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, stat, timestamp, count" },
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

    // Extract date from timestamp (assuming timestamp is in format like "2025-09-28T10:30:00")
    const date = new Date(timestamp);
    const dateString = date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    }); // Format: "9/28/2025"
    
    
    // Check if sheet exists for this date
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets?.map(sheet => sheet.properties?.title) || [];
    
    let sheetName = dateString;
    let sheetExists = existingSheets.includes(sheetName);

    // Create new sheet if it doesn't exist
    if (!sheetExists) {
      

      await duplicateTemplateSheet(sheets, spreadsheetId, sheetName);

      
    }

    // Add the stat to the appropriate sheet (both the date-specific sheet and Cumulative Stats)
    const promises = [
      // Add to date-specific sheet
      // Also add to RAW STAT ENTRIES for cumulative tracking
      sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "RAW STAT ENTRIES!A:D",
        valueInputOption: "RAW",
        requestBody: {
          values: [[name, stat, timestamp, count]],
        },
      })
    ];

    const results = await Promise.all(promises);

    return NextResponse.json({ 
      success: true, 
      message: "Stat added successfully",
      dateSheet: sheetName,
      data: results[0].data 
    });

  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

// Helper function to set up a new sheet with formulas
async function duplicateTemplateSheet(sheets: any, spreadsheetId: string, sheetName: string) {
  // Get all sheets
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetsData = spreadsheet.data.sheets || [];

  // Find your template sheet by title
  const templateSheet = sheetsData.find(
    (s: any) => s.properties?.title === "9/27/2025" // <-- change this to your template sheet’s name
  );

  if (!templateSheet) {
    throw new Error("Template sheet not found!");
  }

  // Copy the template sheet
  const copyResponse = await sheets.spreadsheets.sheets.copyTo({
    spreadsheetId,
    sheetId: templateSheet.properties.sheetId,
    requestBody: {
      destinationSpreadsheetId: spreadsheetId,
    },
  });

  // Rename the copied sheet to the requested date-specific name
  const newSheetId = copyResponse.data.sheetId;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId: newSheetId,
              title: sheetName,
            },
            fields: "title",
          },
        },
      ],
    },
  });

  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!F22`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[sheetName]], // write the current sheet name / date directly
    },
  });

}


// Helper function to get sheet ID by name
async function getSheetId(sheets: any, spreadsheetId: string, sheetName: string): Promise<number> {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === sheetName);
  return sheet?.properties?.sheetId || 0;
}
