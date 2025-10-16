"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [sheetsLoading, setSheetsLoading] = useState(true);
  const [leadersLoading, setLeadersLoading] = useState(true);

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        const res = await fetch("/api/loadSheets");
        const data = await res.json();
        setSheets(data || []);
      } catch (error) {
        console.error("Failed to fetch sheets:", error);
      } finally {
        setSheetsLoading(false);
      }
    };
    fetchSheets();
  }, []);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await fetch("/api/cumulativeStats");
        const data = await res.json();
        setLeaders(data || {});
      } catch (error) {
        console.error("Failed to fetch leaders:", error);
      } finally {
        setLeadersLoading(false);
      }
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

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Leaders Section - Uncommented and with skeleton loading */}
        {/* <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8" style={{ color: '#91D2FD' }}>
            Leaders
          </h1>
          <div className="bg-white/10 rounded-2xl p-4 sm:p-6 mb-8 shadow-lg">
            {leadersLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-6 w-24 mx-auto mb-4 bg-white/20" />
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2">
                          <Skeleton className="h-4 w-20 bg-white/10" />
                          <Skeleton className="h-4 w-8 bg-white/10" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : Object.keys(leaders).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Object.entries(leaders).map(([stat, topPlayers]) => (
                  <div key={stat} className="text-center">
                    <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#91D2FD' }}>{stat}</h3>
                    <div className="space-y-2">
                      {topPlayers.map((player, index) => (
                        <div key={player.name} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2">
                          <span className="text-xs sm:text-sm font-medium" style={{ color: '#91D2FD' }}>
                            {index + 1}. {player.name}
                          </span>
                          <span className="text-xs sm:text-sm" style={{ color: '#91D2FD', opacity: 0.8 }}>
                            {player.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm sm:text-base" style={{ color: '#91D2FD' }}>No leader data available</p>
            )}
          </div>
        </div> */}

        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold" style={{ color: '#91D2FD' }}>
            Practice Sheets
          </h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {sheetsLoading ? (
            // Skeleton loading for sheets
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 sm:p-6 bg-white/10 rounded-xl shadow-lg border">
                <div className="flex-1">
                  <Skeleton className="h-5 sm:h-6 w-32 sm:w-48 mb-2 bg-white/20" />
                  <Skeleton className="h-4 w-24 sm:w-32 bg-white/10" />
                </div>
                <Skeleton className="h-8 w-8 bg-white/10 rounded" />
              </div>
            ))
          ) : sheets.length > 0 ? (
            sheets.map((sheet) => (
              <div
                key={sheet.sheetId}
                className="flex items-center justify-between p-4 sm:p-6 bg-white/10 hover:bg-white/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border"
                onClick={() => {
                  window.open(
                    `https://docs.google.com/spreadsheets/d/${process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID}/export?format=pdf&gid=${sheet.sheetId}&range=A1:Z30&gridlines=true&portrait=false&size=letter&scale=4`,
                    "_blank"
                  );
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-base sm:text-lg lg:text-xl font-semibold truncate" style={{ color: '#91D2FD' }}>
                    {sheet.title === "Cumulative Stats" ? sheet.title : `Practice: ${sheet.title}`}
                  </p>
                  <p className="text-xs sm:text-sm truncate" style={{ color: '#91D2FD', opacity: 0.7 }}>
                    Click to download PDF
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#91D2FD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm sm:text-base" style={{ color: '#91D2FD' }}>No practice sheets available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
