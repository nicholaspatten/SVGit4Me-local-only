import { Vectorizer } from "@/components/vectorizer"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function Home() {
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col py-3 px-4">
        <main className="flex-1 container mx-auto">
          <div className="max-w-6xl mx-auto">
            <img src="/logo.svg" alt="SVG It 4 Me" className="w-[200px] h-[200px] mx-auto mb-4" />
            
            <Vectorizer />
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
