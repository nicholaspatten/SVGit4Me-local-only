"use client"

import { Vectorizer } from "@/components/vectorizer"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useState, useEffect } from "react"

function DeploymentBanner() {
  const [isLocalDeployment, setIsLocalDeployment] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Detect if running locally vs on cloud deployment
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || 
                   hostname === '127.0.0.1' ||
                   hostname.includes('192.168.') ||
                   hostname.includes('10.0.') ||
                   hostname.includes('172.');
    
    setIsLocalDeployment(isLocal);
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return null; // Prevent flash while detecting
  }

  if (isLocalDeployment) {
    return (
      <div className="text-center mb-6">
        <div className="inline-block bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
          <div className="text-sm font-medium text-green-800 mb-1">
            🔒 100% Local Processing - Runs on Your Computer
          </div>
          <div className="text-xs text-green-600">
            Your images never leave your computer • Zero data collection • Professional results
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="text-center mb-6">
        <div className="inline-block bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg">
          <div className="text-sm font-medium text-orange-800 mb-1">
            🌐 Demo Mode - Cloud Processing
          </div>
          <div className="text-xs text-orange-600">
            For true privacy, run locally with Docker • This demo processes images on our servers
          </div>
          <div className="text-xs text-blue-600 mt-1">
            <a href="https://github.com/nicholaspatten/SVGit4Me-local-only" className="underline">
              Get the local version →
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default function Home() {
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col py-3 px-4">
        <main className="flex-1 container mx-auto">
          <div className="max-w-6xl mx-auto">
            <img src="/logo.svg" alt="SVG It 4 Me" className="w-[200px] h-[200px] mx-auto mb-4" />
            
            <DeploymentBanner />

            <Vectorizer />
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
