import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import path from "path";
import fs from "fs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Path to service account credentials
    const keyFilePath = path.join(process.cwd(), "secrets/service-account.json");

    // Read credentials
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.SPREADSHEET_ID || ""; // from sheet URL
    const range = "RAW Stats!D:D"; // Adjust if needed

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    // Flatten & remove empty entries
    const players = rows.flat().filter((name) => name && name.toString().trim() !== "");

    res.status(200).json(players);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch players" });
  }
}
