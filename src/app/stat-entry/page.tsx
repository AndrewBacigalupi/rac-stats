"use client"
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { useState, useEffect } from "react";
import Link from "next/link"

export default function StatEntryPage() {
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
        isVisible: boolean;
    }>({
        message: "",
        type: "success",
        isVisible: false,
    });

    const players = [
        "LIU", "SID", "MORAKIS", "DYLAN", "IAN", "LIAM", "JON", "ZION",
        "LUKAS", "GRIFF", "RICKY", "SCOTT", "DEACON", "EVAN", "ISAAC", "ROBBIE", "BERNIE"
    ];

    // const [players, setPlayers] = useState<string[]>([]);
    // const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //   async function fetchPlayers() {
    //     try {
    //       const res = await fetch("/api/loadPlayers"); // API route you wrote
    //       const data: string[] = await res.json();
    //       setPlayers(data);
    //     } catch (err) {
    //       console.error("Failed to load players", err);
    //     } finally {
    //       setLoading(false);
    //     }
    //   }

    //   fetchPlayers();
    // }, []);

    // if (loading) {
    //   return <p>Loading players...</p>;
    // }

    const stats = ["3PMAKE", "3PMISS", "OREB", "DREB", "ASSIST", "TO"];

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    
    const addStatEntry = async (playerName: string, statType: string) => {
        const now = new Date();
        const timestamp = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
        
        const entry = {
            name: playerName,
            stat: statType,
            timestamp: timestamp,
            count: 1
        };
        
        try {
            console.log("Sending entry:", entry);
            
            const response = await fetch('/api/addStat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(entry),
            });
            
            console.log("Response status:", response.status);
            console.log("Response ok:", response.ok);
            
            const result = await response.json();
            console.log("Response data:", result);
            
            if (response.ok) {
                showToast(`${playerName} ${statType} recorded`, "success");
            } else {
                console.error("Failed to add stat:", result.error);
                showToast(`Failed to add stat: ${result.error}`, "error");
            }
            
        } catch (error) {
            console.error("Error calling API:", error);
            showToast("Error adding stat", "error");
        }
        
        setSelectedPlayer(null);
    };
    
    return (
       <div className="min-h-screen py-8" style={{backgroundColor: '#483C32'}}>
         
         <Link href="/dashboard">
           <Button className="font text-lg px-6 py-3 m-4 ml-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border" style={{backgroundColor: '#91D2FD', color: '#483C32'}}>
             ← Back
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
                   e.currentTarget.style.display = 'none';
                 }}
               />
               <h1 className="md:text-5xl font-bold text-3xl " style={{color: '#91D2FD'}}>
                 Tufts Men's Basketball
               </h1>
             </div>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
             {players.map((name, index) => (
               <Button
                 key={index}
                 onClick={() => setSelectedPlayer(name)}
                 className="group py-6 px-8 text-2xl h-24 font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 border"
                 style={{backgroundColor: '#91D2FD', color: '#483C32'}}
                 
               >
                 <span className="group-hover:scale-105 transition-transform duration-200">
                   {name}
                 </span>
               </Button>
             ))}
           </div>

          {selectedPlayer && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 animate-in fade-in duration-300">
              <div className="rounded-3xl shadow-2xl p-10 max-w-lg w-full mx-4 border animate-in zoom-in-95 duration-300" style={{backgroundColor: '#91D2FD'}}>
                <div className="text-center">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2" style={{color: '#483C32'}}>
                      Select Stat for
                    </h2>
                    <div className="inline-block px-6 py-2 rounded-2xl text-xl font-bold shadow-lg" style={{backgroundColor: '#483C32', color: '#91D2FD'}}>
                      {selectedPlayer}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {stats.map((stat) => (
                      <Button
                        key={stat}
                        onClick={() => addStatEntry(selectedPlayer, stat)}
                        className="group py-4 px-6 text-lg h-18 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border"
                        style={{backgroundColor: '#483C32', color: '#91D2FD'}}
                      >
                        <span className="group-hover:scale-105 transition-transform duration-200">
                          {stat}
                        </span>
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={() => setSelectedPlayer(null)}
                    variant="outline"
                    className="w-full py-3 border-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                    style={{color: '#483C32', borderColor: '#483C32', backgroundColor: 'transparent'}}
                    onMouseEnter={(e) => {
                    }}
                    onMouseLeave={(e) => {
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      </div>
    );
}