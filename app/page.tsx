"use client"

import { Vectorizer } from "@/components/vectorizer"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { Monitor } from "lucide-react"

export default function Home() {
  const isMobile = useIsMobile()

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col py-3 px-4">
        <main className="flex-1 container mx-auto">
          <div className="max-w-6xl mx-auto">
            <img src="/logo.svg" alt="SVG It 4 Me" className="w-[200px] h-[200px] mx-auto mb-4" />
            
            {/* Mobile Warning Banner */}
            {isMobile && (
              <div className="mx-auto mb-6 max-w-md">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-amber-800 text-sm font-medium">
                    <Monitor className="h-4 w-4" />
                    For best results, please try on desktop
                  </div>
                </div>
              </div>
            )}
            
            <Vectorizer />
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
