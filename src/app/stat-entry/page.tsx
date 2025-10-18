"use client"
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { useState, useEffect } from "react";
import Link from "next/link"

export default function StatEntryPage() {
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [players, setPlayers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [attendanceTaken, setAttendanceTaken] = useState(false);
    const [attendanceLoading, setAttendanceLoading] = useState(true);
    const [attendanceInfo, setAttendanceInfo] = useState<{
      today: string;
      message: string;
    } | null>(null);
    const [lastStatEntry, setLastStatEntry] = useState<{
      player: string;
      stat: string;
      timestamp: string;
      count: string;
      notes: string;
    } | null>(null);
    const [showUndoModal, setShowUndoModal] = useState(false);
    const [undoLoading, setUndoLoading] = useState(false);
    const [pendingStats, setPendingStats] = useState<Array<{
      id: string;
      player: string;
      stat: string;
      timestamp: string;
    }>>([]);
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
        isVisible: boolean;
    }>({
        message: "",
        type: "success",
        isVisible: false,
    });

    useEffect(() => {
      async function fetchPlayers() {
        try {
          const res = await fetch("/api/loadPlayers");
          const data: string[] = await res.json();
          setPlayers(data);
        } catch (err) {
          console.error("Failed to load players", err);
          setToast({
            message: "Failed to load players. Please refresh the page.",
            type: "error",
            isVisible: true,
          });
        } finally {
          setLoading(false);
        }
      }

      async function checkAttendance() {
        try {
          const res = await fetch("/api/attendance-check");
          const data = await res.json();
          setAttendanceTaken(data.attendanceTaken);
        } catch (err) {
          console.error("Failed to check attendance", err);
        } finally {
          setAttendanceLoading(false);
        }
      }

      async function fetchLastStatEntry() {
        try {
          const res = await fetch("/api/last-stat");
          const data = await res.json();
          if (data.hasLastEntry) {
            setLastStatEntry(data.lastEntry);
          }
        } catch (err) {
          console.error("Failed to fetch last stat entry", err);
        }
      }

      fetchPlayers();
      checkAttendance();
      fetchLastStatEntry();
    }, []);

    if (loading) {
      return (
        <div className="min-h-screen py-8 flex items-center justify-center" style={{backgroundColor: '#000000'}}>
          <div className="text-center">
            <p className="text-xl font-bold " style={{color: '#ffffff'}}>Loading players...</p>
          </div>
        </div>
      );
    }

    const stats = ["3PMAKE", "3PMISS", "OREB", "DREB", "ASSIST", "TO"];

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    
    // Function to process stat entries in the background
    const processStatEntry = async (entry: any, statId: string) => {
        try {
            console.log("Processing stat entry:", entry);
            
            const response = await fetch('/api/addStat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(entry),
            });
            
            const result = await response.json();
            
            if (response.ok) {
                console.log("Stat processed successfully:", result);
                
                // Refresh the last stat entry after adding a new one
                setTimeout(async () => {
                  try {
                    const res = await fetch("/api/last-stat");
                    const data = await res.json();
                    if (data.hasLastEntry) {
                      setLastStatEntry(data.lastEntry);
                    }
                  } catch (err) {
                    console.error("Failed to refresh last stat entry", err);
                  }
                }, 1000);
            } else {
                console.error("Failed to add stat:", result.error);
                showToast(`Failed to add stat: ${result.error}`, "error");
            }
            
        } catch (error) {
            console.error("Error calling API:", error);
            showToast("Error adding stat", "error");
        } finally {
            // Remove from pending stats
            setPendingStats(prev => prev.filter(stat => stat.id !== statId));
        }
    };

    const addStatEntry = (playerDisplayName: string, statType: string) => {
        // Extract just the player name (remove ": NUMBER" part)
        const playerName = playerDisplayName.includes(': ') 
            ? playerDisplayName.split(': ')[0] 
            : playerDisplayName;
            
        const now = new Date();
        const timestamp = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
        
        const entry = {
            name: playerName,
            stat: statType,
            timestamp: timestamp,
            count: 1
        };
        
        // Generate unique ID for this stat entry
        const statId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Add to pending stats immediately for visual feedback
        setPendingStats(prev => [...prev, {
            id: statId,
            player: playerDisplayName,
            stat: statType,
            timestamp: timestamp
        }]);
        
        // Show immediate feedback
        showToast(`${playerDisplayName} ${statType} recorded`, "success");
        
        // Process the stat entry in the background (non-blocking)
        processStatEntry(entry, statId);
        
        setSelectedPlayer(null);
    };

    const handleUndoClick = async () => {
        setShowUndoModal(true);
    };

    const handleUndoConfirm = async () => {
        setUndoLoading(true);
        try {
            const response = await fetch('/api/delete-last-stat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                showToast(`Undone: ${data.deletedEntry.player} - ${data.deletedEntry.stat}`, "success");
                setLastStatEntry(null);
                setShowUndoModal(false);
            } else {
                const error = await response.json();
                showToast(`Failed to undo: ${error.error}`, "error");
            }
        } catch (error) {
            console.error("Error undoing last stat:", error);
            showToast("Error undoing last stat entry", "error");
        } finally {
            setUndoLoading(false);
        }
    };

    const handleUndoCancel = () => {
        setShowUndoModal(false);
    };
    
    return (
       <div className="min-h-screen py-8" style={{ backgroundColor: "#000000" }}>
         <Link href="/dashboard">
           <Button
             className="font text-lg px-6 py-3 m-4 ml-8 rounded-xl shadow-lg hover:shadow-xl hover:opacity-80 transition-all duration-300 border"
             style={{ backgroundColor: "#ffffff", color: "#000000" }}
           >
             Back
           </Button>
         </Link>

        <div className="w-[70%] mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center flex-col justify-center gap-6 ">
              <img
                src="/jumbos.png"
                alt="Tufts Jumbos Logo"
                className="h-16 w-auto opacity-90"
                onError={(e) => {
                  // Fallback if logo doesn't exist
                  e.currentTarget.style.display = "none";
                }}
              />
               <h1
                 className="md:text-5xl font-bold text-3xl "
                 style={{ color: "#ffffff" }}
               >
                 Tufts Men's Basketball
               </h1>
            </div>

            {/* Pending Stats Indicator */}
            {pendingStats.length > 0 && (
              <div className="mt-4 mb-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-200 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-200 border-t-transparent"></div>
                  <span className="text-sm">
                    Processing {pendingStats.length} stat{pendingStats.length > 1 ? 's' : ''}...
                  </span>
                </div>
              </div>
            )}

            {/* Attendance Button */}
            <div className="mt-8 mb-8">
              <Link href="/attendance" passHref>
                <Button
                  className="rounded-xl border border-solid border-transparent transition-all duration-300 flex items-center justify-center gap-2 font-medium text-lg h-16 px-8 shadow-lg mx-auto hover:opacity-80"
                   style={{
                     backgroundColor: "#ffffff",
                     color: "#000000",
                   }}
                >
                  {attendanceTaken ? "Update Attendance" : "Take Attendance"}
                </Button>
              </Link>
            </div>

            {/* Undo Last Entry Button */}
            {lastStatEntry && (
              <div className="mt-4 mb-8 flex justify-center">
                 <Button
                   onClick={handleUndoClick}
                   className="rounded-xl border-2 transition-all duration-300 flex items-center justify-center font-medium text-sm h-10 px-6 shadow-lg hover:opacity-80"
                   style={{
                     backgroundColor: "transparent",
                     color: "#ffffff",
                     borderColor: "red",
                   }}
                 >
                   Undo Last Entry: {lastStatEntry.player} - {lastStatEntry.stat}
                 </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            {players.map((name, index) => (
              <Button
                key={index}
                onClick={() => setSelectedPlayer(name)}
                className="group py-6 px-8 text-lg sm:text-2xl h-24 font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:opacity-80 border"
                 style={{ backgroundColor: "#ffffff", color: "#000000", borderColor:"gray" }}
              >
                <span className="transition-transform duration-200">
                  {name}
                </span>
              </Button>
            ))}
          </div>

           {selectedPlayer && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 animate-in fade-in duration-300">
               <div
                 className="rounded-3xl shadow-2xl p-10 max-w-lg w-full mx-4 border animate-in zoom-in-95 duration-300"
                 style={{ backgroundColor: "#ffffff" }}
               >
                <div className="text-center">
                  <div className="mb-8">
                    <h2
                      className="text-3xl font-bold mb-2"
                      style={{ color: "#000000" }}
                    >
                      Select Stat for
                    </h2>
                    <div
                      className="inline-block px-6 py-2 rounded-2xl text-xl font-bold shadow-lg"
                      style={{ backgroundColor: "#000000", color: "#ffffff" }}
                    >
                      {selectedPlayer}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {stats.map((stat) => (
                      <Button
                        key={stat}
                        onClick={() => addStatEntry(selectedPlayer, stat)}
                        className="group py-4 px-6 text-lg h-18 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:opacity-80 border"
                        style={{ backgroundColor: "#000000", color: "#ffffff" }}
                      >
                        <span className="transition-transform duration-200">
                          {stat}
                        </span>
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={() => setSelectedPlayer(null)}
                    variant="outline"
                    className="w-full py-3 border-2 rounded-xl font-medium transition-all duration-300 hover:opacity-80"
                    style={{
                      color: "#483C32",
                      borderColor: "#483C32",
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {}}
                    onMouseLeave={(e) => {}}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Undo Confirmation Modal */}
        {showUndoModal && lastStatEntry && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
             <div
               className="rounded-3xl shadow-2xl p-10 max-w-lg w-full mx-4 border animate-in zoom-in-95 duration-300"
               style={{ backgroundColor: "#ffffff" }}
             >
              <div className="text-center">
                <h2
                  className="text-3xl font-bold mb-6"
                   style={{ color: "#000000" }}
                >
                  Confirm Undo
                </h2>

                <div className="mb-8">
                  <p className="text-lg mb-4" style={{ color: "#483C32" }}>
                    Are you sure you want to undo the last entry?
                  </p>

                  <div className="bg-white/20 rounded-xl p-4 mb-4">
                    <div
                      className="text-lg font-semibold"
                      style={{ color: "#000000" }}
                    >
                      Player: {lastStatEntry.player}
                    </div>
                    <div
                      className="text-lg font-semibold"
                      style={{ color: "#000000" }}
                    >
                      Stat: {lastStatEntry.stat}
                    </div>
                  </div>

                  <p
                    className="text-sm"
                    style={{ color: "#483C32", opacity: 0.8 }}
                  >
                    This action cannot be undone.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleUndoCancel}
                    disabled={undoLoading}
                    variant="outline"
                    className="flex-1 py-3 border-2 rounded-xl font-medium transition-all duration-300 hover:opacity-80"
                    style={{
                      color: "#483C32",
                      borderColor: "#483C32",
                      backgroundColor: "transparent",
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleUndoConfirm}
                    disabled={undoLoading}
                    className="flex-1 py-3 rounded-xl font-medium transition-all duration-300 hover:opacity-80"
                     style={{ backgroundColor: "#c91616", color: "#ffffff" }}
                  >
                    {undoLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                        Undoing...
                      </>
                    ) : (
                      "Confirm Delete"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      </div>
    );
}