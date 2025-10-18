import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    console.log("=== Testing Google Sheets Connection ===");
    
    // Check environment variables
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
    const spreadsheetId = process.env.SPREADSHEET_ID;
    
    console.log("Environment check:");
    console.log("- SPREADSHEET_ID exists:", !!spreadsheetId);
    console.log("- SPREADSHEET_ID value:", spreadsheetId ? `${spreadsheetId.substring(0, 10)}...` : "NOT SET");
    console.log("- CREDENTIALS exist:", !!credentials);
    console.log("- CREDENTIALS length:", credentials ? credentials.length : 0);
    
    if (!spreadsheetId) {
      console.error("❌ SPREADSHEET_ID not configured");
      return NextResponse.json(
        { error: "Spreadsheet ID not configured. Check your .env.local file." },
        { status: 500 }
      );
    }

    if (!credentials) {
      console.error("❌ GOOGLE_SERVICE_ACCOUNT_CREDENTIALS not configured");
      return NextResponse.json(
        { error: "Google credentials not configured. Check your .env.local file." },
        { status: 500 }
      );
    }

    // Try to parse credentials
    let parsedCredentials;
    try {
      parsedCredentials = JSON.parse(credentials);
      console.log("✅ Credentials parsed successfully");
      console.log("- Project ID:", parsedCredentials.project_id);
      console.log("- Client Email:", parsedCredentials.client_email);
    } catch (parseError) {
      console.error("❌ Failed to parse credentials JSON:", parseError);
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

    console.log("Creating Sheets client...");
    const sheets = google.sheets({ version: "v4", auth });

    console.log("Attempting to read from sheet...");
    console.log("- Spreadsheet ID:", spreadsheetId);
    console.log("- Range: RAW STAT ENTRIES!A1:D5");

    // Try to read the first few rows to test connection
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "RAW STAT ENTRIES!A1:D5",
    });

    console.log("✅ Successfully read from sheet!");
    console.log("- Rows found:", result.data.values?.length || 0);
    console.log("- Data:", result.data.values);

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Google Sheets",
      data: result.data.values || [],
      rowCount: result.data.values?.length || 0
    });

  } catch (error) {
    console.error("❌ Error testing Google Sheets connection:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
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
    console.log("Received request body:", body);
    
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

    // Extract date from timestamp (format: "1/1/2025" - month/day/year)
    const date = new Date(timestamp);
    const dateString = date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    }); // Format: "1/1/2025"
    
    console.log(`Processing stat for date: ${dateString}`);

    // Check if sheet exists for this date
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets?.map(sheet => sheet.properties?.title) || [];
    
    let sheetName = dateString;
    let sheetExists = existingSheets.includes(sheetName);

    // Create new sheet if it doesn't exist by duplicating the template
    if (!sheetExists) {
      console.log(`Creating new sheet by duplicating template: ${sheetName}`);
      
      // Duplicate the template sheet (this creates and configures the sheet)
      await duplicateTemplateSheet(sheets, spreadsheetId, sheetName);
      
      console.log(`Successfully created and configured sheet: ${sheetName}`);
    }

    // Add the stat to both the date-specific sheet and RAW STAT ENTRIES
    const promises = [
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

    console.log("Successfully added to sheets:", results.map(r => r.data));
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

  console.log(`Successfully duplicated template sheet and renamed to: ${sheetName}`);
}
// Helper function to get sheet ID by name
async function getSheetId(sheets: any, spreadsheetId: string, sheetName: string): Promise<number> {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === sheetName);
  return sheet?.properties?.sheetId || 0;
}
