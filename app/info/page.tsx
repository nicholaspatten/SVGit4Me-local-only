"use client"

import { ArrowLeft, Github, Lock, Globe, Zap, Shield, Code, Cpu, Monitor } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 self-start">
                <ArrowLeft className="h-4 w-4" />
                Back to App
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="SVG It 4 Me" className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">How SVGit4Me Works</h1>
                <p className="text-sm md:text-base text-gray-600 truncate">Technical Deep Dive & Architecture Overview</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl overflow-hidden">
        {/* Architecture Overview */}
        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2 flex-wrap">
            <Code className="h-6 w-6 text-blue-600" />
            Architecture Overview
          </h2>
          <p className="text-base text-gray-700 mb-6">
            SVGit4Me uses a <strong>dual-deployment strategy</strong> for privacy control: local Docker (100% private) or cloud demo (quick testing).
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Local Docker Deployment */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Lock className="h-5 w-5" />
                  Local Docker Deployment
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Recommended</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-700 pt-3">
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    <strong>100% Local</strong>: Vectorization on your computer
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    <strong>Zero Upload</strong>: Images never leave your machine
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    <strong>Complete Privacy</strong>: No external servers
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    <strong>Offline Capable</strong>: Works without internet
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Cloud Demo Deployment */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Globe className="h-5 w-5" />
                  Cloud Demo Deployment
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">Demo Only</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-orange-700 pt-3">
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    <strong>Quick Demo</strong>: Testing without setup
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    <strong>Server Processing</strong>: Images processed on Railway
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    <strong>Honest Labels</strong>: Clearly marked as "Demo Mode"
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    <strong>Educational</strong>: Shows functionality before install
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technical Implementation */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 flex-wrap">
            <Cpu className="h-5 w-5 text-purple-600" />
            Core Vectorization Engines
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* VTracer */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-800 text-base">VTracer (Color)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-0.5 text-xs text-gray-700 mb-2">
                  <li><strong>Rust-based</strong>: High-performance</li>
                  <li><strong>Color Accuracy</strong>: Superior quality</li>
                  <li><strong>Multiple Modes</strong>: Spline, polygon</li>
                  <li><strong>Quality Control</strong>: Configurable</li>
                </ul>
                <div className="bg-gray-100 p-1.5 rounded overflow-x-auto">
                  <code className="text-gray-800 text-xs block">
                    vtracer --input "img.png"<br />
                    --output "result.svg"<br />
                    --colormode color
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Potrace */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-800 text-base">Potrace (B&W)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-0.5 text-xs text-gray-700 mb-2">
                  <li><strong>Bitmap Tracing</strong>: Monochrome specialist</li>
                  <li><strong>ImageMagick Prep</strong>: Auto optimization</li>
                  <li><strong>Precise Curves</strong>: Mathematical fitting</li>
                  <li><strong>Size Optimized</strong>: Minimal SVG files</li>
                </ul>
                <div className="bg-gray-100 p-1.5 rounded overflow-x-auto">
                  <code className="text-gray-800 text-xs block">
                    magick "img.png" -threshold<br />
                    50% "prep.pbm"<br />
                    potrace "prep.pbm" -s -o<br />
                    "result.svg"
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>



        {/* Privacy & Security */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 flex-wrap">
            <Shield className="h-5 w-5 text-green-600" />
            Privacy & Security Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-800 text-base">Local Docker Security</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 pt-0">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1 text-xs">Complete Data Isolation</h4>
                    <div className="bg-gray-100 p-1.5 rounded overflow-x-auto">
                      <code className="text-gray-800 text-xs block">
                        ports: ["3000:3000"]<br />
                        # Local only<br />
                        NEXT_TELEMETRY_DISABLED=1
                      </code>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-xs">Auto Cleanup</h4>
                    <ul className="text-xs space-y-0.5">
                      <li>• Temp files deleted immediately</li>
                      <li>• No persistent storage</li>
                      <li>• Memory cleared after processing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-orange-800 text-base">Cloud Demo Safeguards</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 pt-0">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1 text-xs">Honest Disclosure</h4>
                    <div className="bg-gray-100 p-1.5 rounded overflow-x-auto">
                      <code className="text-gray-800 text-xs block">
                        if (isLocal) &#123;<br />
                        &nbsp;&nbsp;"🔒 Local"<br />
                        &#125; else &#123;<br />
                        &nbsp;&nbsp;"🌐 Demo"<br />
                        &#125;
                      </code>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-xs">Temporary Processing</h4>
                    <ul className="text-xs space-y-0.5">
                      <li>• Files deleted immediately</li>
                      <li>• No permanent storage</li>
                      <li>• Ephemeral containers</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 flex-wrap">
            <Monitor className="h-5 w-5 text-indigo-600" />
            Technical Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-indigo-800 text-base">Input Formats</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 pt-0">
                <ul className="space-y-0.5 text-xs">
                  <li>• PNG, JPG, JPEG</li>
                  <li>• GIF, WebP, BMP</li>
                  <li>• Maximum: 15MB</li>
                  <li>• Optimal: 300-2000px</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-indigo-800 text-base">Output Quality</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 pt-0">
                <ul className="space-y-0.5 text-xs">
                  <li>• SVG 1.1 compliant</li>
                  <li>• 1-8 decimal precision</li>
                  <li>• Color, grayscale, binary</li>
                  <li>• Auto viewBox correction</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-indigo-800 text-base">Performance</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 pt-0">
                <ul className="space-y-0.5 text-xs">
                  <li>• Simple logos: 1-3s</li>
                  <li>• Complex photos: 10-30s</li>
                  <li>• Large images: 30-60s</li>
                  <li>• Desktop optimized</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Deployment Options */}
        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2 flex-wrap">
            <Zap className="h-6 w-6 text-yellow-600" />
            Getting Started
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-800 text-lg">Local Docker Setup (Recommended)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs mb-3 overflow-x-auto">
                  <div># Quick start</div>
                  <div className="whitespace-nowrap">git clone https://github.com/nicholaspatten/SVGit4Me-local-only</div>
                  <div>cd SVGit4Me-local-only</div>
                  <div>docker compose up</div>
                  <div># Access at http://localhost:3000</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center gap-1 text-green-700">
                    <Shield className="h-3 w-3" />
                    100% local
                  </div>
                  <div className="flex items-center gap-1 text-green-700">
                    <Shield className="h-3 w-3" />
                    Complete privacy
                  </div>
                  <div className="flex items-center gap-1 text-green-700">
                    <Shield className="h-3 w-3" />
                    Offline capable
                  </div>
                  <div className="flex items-center gap-1 text-green-700">
                    <Shield className="h-3 w-3" />
                    Professional results
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-orange-800 text-lg">Cloud Demo</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <p className="text-orange-700 text-sm">
                    Perfect for:
                  </p>
                  <ul className="space-y-1 text-orange-700 text-xs">
                    <li className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Showcasing functionality
                    </li>
                    <li className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Quick testing without setup
                    </li>
                    <li className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Educational demos
                    </li>
                  </ul>
                  <div className="bg-orange-100 border border-orange-200 p-2 rounded">
                    <p className="text-orange-800 text-xs font-medium">
                      ⚠️ Not for sensitive images - server processing
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t pt-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
            <Link href="https://github.com/nicholaspatten/SVGit4Me-local-only">
              <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                <Github className="h-4 w-4" />
                GitHub
              </Button>
            </Link>
            <Link href="/">
              <Button size="sm" className="gap-2 w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                Try SVGit4Me
              </Button>
            </Link>
          </div>
          <p className="text-gray-600 text-sm">
            Made with ❤️ for privacy-conscious users who demand quality results.
          </p>
        </div>
      </div>
    </div>
  )
}
