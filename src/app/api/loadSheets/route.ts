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
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheetTitles = response.data.sheets?.map(sheet => ({
      title: sheet.properties?.title,
      sheetId: sheet.properties?.sheetId,
    }))
    .filter(sheet => sheet.title !== "RAW STAT ENTRIES" && sheet.title !== "Roster") || [];

    return NextResponse.json(sheetTitles);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load sheets" }, { status: 500 });
  }
}
