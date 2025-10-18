"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Player = {
  name: string;
  number: string;
  displayName: string;
};

export default function AttendancePage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const res = await fetch("/api/loadPlayers");
        const data: string[] = await res.json();
        
        const playerList = data.map(playerStr => {
          const [name, number] = playerStr.split(': ');
          return {
            name: name.trim(),
            number: number?.trim() || '',
            displayName: playerStr
          };
        });
        
        setPlayers(playerList);
        
        // Initialize all players as present by default
        const initialAttendance: Record<string, boolean> = {};
        playerList.forEach(player => {
          initialAttendance[player.displayName] = true;
        });
        setAttendance(initialAttendance);
        
      } catch (err) {
        console.error("Failed to load players", err);
        setMessage({
          text: "Failed to load players. Please refresh the page.",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPlayers();
  }, []);

  const toggleAttendance = (playerName: string) => {
    setAttendance(prev => ({
      ...prev,
      [playerName]: !prev[playerName]
    }));
  };

  const submitAttendance = async () => {
    console.log("Starting attendance submission...");
    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const today = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      }).format(new Date());

      const attendanceData = Object.entries(attendance).map(([playerDisplayName, present]) => {
        const playerName = playerDisplayName.split(': ')[0];
        return {
          playerName,
          present,
          date: today
        };
      });

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: today,
          attendance: attendanceData
        }),
      });

      console.log("Response status:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("Success response:", result);
        const messageText = result.overwritten 
          ? `${result.message} (You can submit again to update attendance)`
          : `${result.message} (You can submit again to update attendance)`;
        
        setMessage({
          text: messageText,
          type: "success"
        });
        
        // Don't auto-redirect - let users submit multiple times
        // Users can manually navigate back using the "Back to Track Stats" button
      } else {
        const error = await response.json();
        console.log("Error response:", error);
        setMessage({
          text: `Failed to record attendance: ${error.error}`,
          type: "error"
        });
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      setMessage({
        text: "Error recording attendance",
        type: "error"
      });
    } finally {
      console.log("Setting submitting to false");
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(attendance).filter(present => present).length;
  const totalCount = players.length;

  if (loading) {
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: '#483C32' }}>
        <Link href="/stat-entry">
          <Button className="font text-lg px-6 py-3 m-4 ml-8 rounded-xl shadow-lg hover:shadow-xl hover:opacity-80 transition-all duration-300 border" style={{ backgroundColor: '#91D2FD', color: '#483C32' }}>
            Back to Track Stats
          </Button>
        </Link>

        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
              Practice Attendance
            </h1>
            <Skeleton className="h-6 w-64 mx-auto bg-white/20" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-6 shadow-lg">
                <Skeleton className="h-6 w-24 mb-4 bg-white/20" />
                <Skeleton className="h-8 w-full bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#000000' }}>
      <Link href="/stat-entry">
        <Button className="font text-lg px-6 py-3 m-4 ml-8 rounded-xl shadow-lg hover:shadow-xl hover:opacity-80 transition-all duration-300 border" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
          Back to Track Stats
        </Button>
      </Link>

      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Practice Attendance
          </h1>
          <p className="text-lg" style={{ color: '#ffffff', opacity: 0.8 }}>
            {new Intl.DateTimeFormat('en-US', { 
              timeZone: 'America/New_York',
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }).format(new Date())}
          </p>
          <div className="mt-4 text-sm" style={{ color: '#ffffff', opacity: 0.7 }}>
            Present: {presentCount} / {totalCount} players
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg text-center ${
            message.type === 'success' ? 'bg-green-500/20 text-green-200' : 
            message.type === 'error' ? 'bg-red-500/20 text-red-200' : ''
          }`}>
            {message.text}
          </div>
        )}

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {players.map((player) => (
            <div
              key={player.displayName}
              className={`bg-white/10 rounded-xl p-6 shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl ${
                attendance[player.displayName] 
                  ? 'ring-2 ring-green-500' 
                  : 'ring-2 ring-red-500'
              }`}
              onClick={() => toggleAttendance(player.displayName)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: '#91D2FD' }}>
                    {player.displayName}
                  </h3>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  attendance[player.displayName] 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}>
                  {attendance[player.displayName] ? (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-sm mt-2" style={{ color: attendance[player.displayName] ? '#4ade80' : '#f87171' }}>
                {attendance[player.displayName] ? 'Present' : 'Absent'}
              </p>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <Button
            onClick={submitAttendance}
            disabled={submitting}
            className="rounded-xl border border-solid border-transparent transition-all duration-300 flex items-center justify-center gap-2 font-medium text-lg h-14 px-8 shadow-lg hover:shadow-xl hover:opacity-80 mx-auto"
            style={{ backgroundColor: '#ffffff', color: '#000000' }}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                Recording...
              </>
            ) : (
              'Record Attendance'
            )}
          </Button>
          
          {/* Debug: Reset button if stuck */}
          {submitting && (
            <div className="mt-4">
              <Button
                onClick={() => {
                  console.log("Manually resetting submitting state");
                  setSubmitting(false);
                }}
                className="text-sm px-4 py-2 bg-red-500 text-white rounded"
              >
                Reset (if stuck)
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
