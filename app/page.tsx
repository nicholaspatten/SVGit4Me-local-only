import { Vectorizer } from "@/components/vectorizer"
import { TooltipProvider } from "@/components/ui/tooltip"

function DeploymentBanner() {
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
