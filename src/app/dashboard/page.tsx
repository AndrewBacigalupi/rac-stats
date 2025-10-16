"use client"
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20" style={{backgroundColor: '#483C32'}}>
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4" style={{color: '#91D2FD'}}>Tufts MBB In-Practice Statistics</h1>
          <p className="text-lg" style={{color: '#91D2FD', opacity: 0.9}}>Let's make a run!</p>
        </div>

        <div className="flex gap-6 items-center justify-center flex-col sm:flex-row">
          {/* Track Stats Button */}
          <Link href="/stat-entry" passHref>
            <Button 
              className="rounded-xl border border-solid border-transparent transition-all duration-300 flex items-center justify-center gap-2 font-medium text-lg h-14 px-8 shadow-lg hover:shadow-xl hover:scale-105"
              style={{backgroundColor: '#91D2FD', color: '#483C32'}}
            >
              Track Stats
            </Button>
          </Link>

          {/* View Stats Button */}
          <Link href="/view-stats" passHref>
            <Button
              className="rounded-xl border-2 transition-all duration-300 flex items-center justify-center font-medium text-lg h-14 px-8 shadow-lg hover:shadow-xl hover:scale-105"
              style={{backgroundColor: 'transparent', color: '#91D2FD', borderColor: '#91D2FD'}}
            >
              View Stats
            </Button>
          </Link>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 transition-colors duration-200"
          style={{color: '#91D2FD'}}
          href="https://www.tufts.edu/"
          target="_blank"
          rel="noopener noreferrer"
        >
          About Tufts
        </a>
         <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 transition-colors duration-200"
          style={{color: '#91D2FD'}}
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

