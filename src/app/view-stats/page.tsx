"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Sheet = {
  title: string;
  sheetId: number;
};

type Leader = {
  name: string;
  count: number;
};

type Leaders = Record<string, Leader[]>;

export default function Page() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [leaders, setLeaders] = useState<Leaders>({});

  useEffect(() => {
    const fetchSheets = async () => {
      const res = await fetch("/api/loadSheets");
      const data = await res.json();
      setSheets(data || []);
    };
    fetchSheets();
  }, []);

  useEffect(() => {
    const fetchLeaders = async () => {
      const res = await fetch("/api/cumulativeStats");
      const data = await res.json();
      setLeaders(data || {});
    };
    fetchLeaders();
  }, []);

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#483C32' }}>
      <Link href="/dashboard">
        <Button className="font text-lg px-6 py-3 m-4 ml-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border" style={{ backgroundColor: '#91D2FD', color: '#483C32' }}>
          ← Back
        </Button>
      </Link>

      <div className="w-[90%] mx-auto px-4">
        {/* <div className="text-center mb-12">
          <h1 className="md:text-5xl font-bold text-3xl mb-8" style={{ color: '#91D2FD' }}>
            Leaders
          </h1>
          <div className="bg-white/10 rounded-2xl p-6 mb-8 shadow-lg">
            {Object.keys(leaders).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {Object.entries(leaders).map(([stat, topPlayers]) => (
                  <div key={stat} className="text-center">
                    <h3 className="text-xl font-bold mb-4" style={{ color: '#91D2FD' }}>{stat}</h3>
                    <div className="space-y-2">
                      {topPlayers.map((player, index) => (
                        <div key={player.name} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2">
                          <span className="text-sm font-medium" style={{ color: '#91D2FD' }}>
                            {index + 1}. {player.name}
                          </span>
                          <span className="text-sm" style={{ color: '#91D2FD', opacity: 0.8 }}>
                            {player.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#91D2FD' }}>Loading leaders...</p>
            )}
          </div>
        </div> */}

        <div className="text-center mb-8">
          <h2 className="md:text-4xl font-bold text-2xl" style={{ color: '#91D2FD' }}>
            Practice Sheets
          </h2>
        </div>

        <div className="space-y-4 mr-30 ml-30">
          {sheets.map((sheet) => (
            <div
              key={sheet.sheetId}
              className="flex items-center justify-between p-6 bg-white/10 hover:bg-white/2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border"
              onClick={() => {
                window.open(
                  `https://docs.google.com/spreadsheets/d/${process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID}/export?format=pdf&gid=${sheet.sheetId}&range=A1:Z30&gridlines=true&portrait=false&size=letter&scale=4`,
                  "_blank"
                );
              }}
            >
              <div>
                <p className="text-xl font-semibold" style={{ color: '#91D2FD' }}>{sheet.title === "Cumulative Stats" ? sheet.title : `Practice: ${sheet.title}`}</p>
                <p className="text-sm" style={{ color: '#91D2FD', opacity: 0.7 }}>Click to download PDF</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
