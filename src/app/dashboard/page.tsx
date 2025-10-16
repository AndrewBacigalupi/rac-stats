"use client"
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20" style={{backgroundColor: '#000000'}}>
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4" style={{color: '#ffffff'}}>Tufts MBB In-Practice Statistics</h1>
          <p className="text-lg" style={{color: '#ffffff', opacity: 0.8}}>Let's make a run!</p>
        </div>

        <div className="flex gap-6 items-center justify-center flex-col sm:flex-row">
          {/* Track Stats Button */}
          <Link href="/stat-entry" passHref>
            <Button 
              className="rounded-xl border border-solid border-transparent transition-all duration-300 flex items-center justify-center gap-2 font-medium text-lg h-14 px-8 shadow-lg hover:shadow-xl hover:opacity-80"
              style={{backgroundColor: '#ffffff', color: '#000000'}}
            >
              Track Stats
            </Button>
          </Link>

          {/* View Stats Button */}
          <Link href="/view-stats" passHref>
            <Button
              className="rounded-xl border-2 transition-all duration-300 flex items-center justify-center font-medium text-lg h-14 px-8 shadow-lg hover:shadow-xl hover:opacity-80"
              style={{backgroundColor: 'transparent', color: '#ffffff', borderColor: '#ffffff'}}
            >
              View Stats
            </Button>
          </Link>
        </div>

        {/* Additional Features */}
        <div className="mt-8 flex gap-4 items-center justify-center flex-col sm:flex-row">
          <Link href="/manager-docs" passHref>
            <Button
              className="rounded-xl border-2 transition-all duration-300 flex items-center justify-center font-medium text-sm h-10 px-6 shadow-lg hover:shadow-xl hover:opacity-80"
              style={{backgroundColor: 'transparent', color: '#ffffff', borderColor: '#2f9ffa'}}
            >
              MANAGERS: PLEASE READ BEFORE TRACKING STATS
            </Button>
          </Link>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 transition-colors duration-200"
          style={{color: '#ffffff', opacity: 0.8}}
          href="https://www.tufts.edu/"
          target="_blank"
          rel="noopener noreferrer"
        >
          About Tufts
        </a>
         <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 transition-colors duration-200"
          style={{color: '#ffffff', opacity: 0.8}}
          href="https://gotuftsjumbos.com/sports/mens-basketball"
          target="_blank"
          rel="noopener noreferrer"
        >
          Team Site
        </a>
       
      </footer>
    </div>
  );
}

