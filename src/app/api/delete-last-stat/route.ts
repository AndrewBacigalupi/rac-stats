import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(request: NextRequest) {
  try {
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

    // First, get the current data to find the last entry
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "RAW STAT ENTRIES!A:E",
    });

    const rows = getResponse.data.values || [];
    
    if (rows.length <= 1) {
      return NextResponse.json(
        { error: "No stat entries found to delete" },
        { status: 404 }
      );
    }

    const lastRowNumber = rows.length;
    const lastEntry = rows[lastRowNumber - 1];
    
    // Extract the date from the timestamp to find the corresponding date sheet
    const timestamp = lastEntry[2];
    const date = new Date(timestamp);
    const dateString = date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });

    // Delete the row from RAW STAT ENTRIES sheet
    const deleteRequest = {
      spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: await getSheetId(sheets, spreadsheetId, "RAW STAT ENTRIES"),
              dimension: "ROWS",
              startIndex: lastRowNumber - 1, // 0-indexed
              endIndex: lastRowNumber
            }
          }
        }]
      }
    };

    await sheets.spreadsheets.batchUpdate(deleteRequest);

    // Also try to remove from the date-specific sheet if it exists
    try {
      const dateSheetExists = await checkIfSheetExists(sheets, spreadsheetId, dateString);
      if (dateSheetExists) {
        // Get the date sheet data to find the matching entry
        const dateSheetResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${dateString}!A:E`,
        });

        const dateSheetRows = dateSheetResponse.data.values || [];
        
        // Find the matching row in the date sheet
        for (let i = dateSheetRows.length - 1; i >= 0; i--) {
          const row = dateSheetRows[i];
          if (row[0] === lastEntry[0] && row[1] === lastEntry[1] && row[2] === lastEntry[2]) {
            // Found matching entry, delete it
            const deleteDateRequest = {
              spreadsheetId,
              resource: {
                requests: [{
                  deleteDimension: {
                    range: {
                      sheetId: await getSheetId(sheets, spreadsheetId, dateString),
                      dimension: "ROWS",
                      startIndex: i,
                      endIndex: i + 1
                    }
                  }
                }]
              }
            };
            await sheets.spreadsheets.batchUpdate(deleteDateRequest);
            break;
          }
        }
      }
    } catch (error) {
      console.log("Could not delete from date sheet:", error);
      // Continue even if date sheet deletion fails
    }

    return NextResponse.json({ 
      success: true,
      message: `Last stat entry deleted: ${lastEntry[0]} - ${lastEntry[1]}`,
      deletedEntry: {
        player: lastEntry[0],
        stat: lastEntry[1],
        timestamp: lastEntry[2],
        date: dateString
      }
    });

  } catch (error) {
    console.error("Error deleting last stat entry:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete last stat entry", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

// Helper function to get sheet ID by name
async function getSheetId(sheets: any, spreadsheetId: string, sheetName: string): Promise<number> {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === sheetName);
  return sheet?.properties?.sheetId || 0;
}

// Helper function to check if a sheet exists
async function checkIfSheetExists(sheets: any, spreadsheetId: string, sheetName: string): Promise<boolean> {
  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets?.map((sheet: any) => sheet.properties?.title) || [];
    return existingSheets.includes(sheetName);
  } catch (error) {
    return false;
  }
}
