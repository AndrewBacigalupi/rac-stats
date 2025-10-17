"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ManagerDocsPage() {
  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#000000' }}>
      <Link href="/dashboard">
        <Button className="font text-lg px-6 py-3 m-4 ml-8 rounded-xl shadow-lg hover:shadow-xl hover:opacity-80 transition-all duration-300 border" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
          Back
        </Button>
      </Link>

      <div className="w-full mt-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold" style={{ color: '#ffffff' }}>
              How to Start Tracking Stats
            </h1>
          </div>

          <div className=" rounded-2xl p-6 sm:p-8">
            <div className="space-y-8">
              
              {/* Step-by-Step Process */}
              <section>
                
                <div className="space-y-6 text-base" style={{ color: '#ffffff', opacity: 0.9 }}>
                  
                  <div>
                    <h3 className="font-semibold text-2xl mb-2">Step 1: Take Attendance</h3>
                    <p className="text-lg">Before tracking any stats, mark which players are present at practice. This is done on the Track Stats page through the "Take Attendance" button. 
                      This ensures accurate averages.  
                    </p>
                    <br/>
                    <p className="text-lg">I typically wait until practice is about to start to officially submit the attendance, and I would recommend checking in with one of 
                      the coaches (probably Lydon). If you make a mistake, attendance can be resubmitted and will overwrite whatever the last submission for that day was. 
                      This means that everytime you submit, whatever you have selected will be recorded for ALL players, not just the ones you changed since last time.</p>

                  </div>

                  <div>
                    <h3 className="font-semibold text-2xl mb-2">Step 2: Select Player</h3>
                    <p>Click on the player's name button who performed the action you want to track.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-2xl mb-2">Step 3: Choose Stat Type</h3>
                    <p className="text-lg">Select the appropriate statistic from the options: 3PMAKE, 3PMISS, OREB, DREB, ASSIST, or TO.</p>
                    <br/>
                    <p className="text-lg">
                      <span className="font-bold text-xl text-blue-300">NOTE:</span> The system will log that stat (that player and that type of stat) <span className="text-red-500 text-xl font-semibold">AS SOON AS YOU CLICK THE STAT TYPE.</span> So don't press the stat type unless you are ready to enter the stat. 
                      This is to reduce the time it takes to record when practice is moving quickly, but it does mean you have to be aware that stats will be recorded right away without a confirm button. Also, there will be 
                      a little bit of lag each time as the call the spreadsheet is being made, so don't click again for a second or so.    
                    </p>
                    <br/>
                    <p className="text-lg">
                       Each time a stat is entered, a red button at the top of the track stats button will appear that allows you to undo the last entry. This should only be used if you misrecord
                       a stat. If you submit two stats and you realize the first one was wrong, you can text me, or don't worry too much about it.
                    </p>
                    
                  </div>

                </div>
              </section>
              {/* Important Notes */}
              <section className="mb-30">
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#ffffff' }}>
                  Issues, Bugs, or Mistakes
                </h2>
                <div className="space-y-4 text-lg" style={{ color: '#ffffff', opacity: 0.9 }}>
                  You can contact Andrew at 605-252-1868 (I'm in the managers chat as well) if anything goes wrong. 
                  No worries if so - it's probably my fault, not yours!
                </div>
                <br/>
                <p className=" text-white text-2xl"> Thanks for helping us track stats this season! <span className="text-blue-300 italic">Go Jumbos!</span></p>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
