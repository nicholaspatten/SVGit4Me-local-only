"use client"

import { ArrowLeft, Github, Lock, Globe, Zap, Shield, Code, Cpu, Smartphone, Monitor } from "lucide-react"
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
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to App
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="SVG It 4 Me" className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">How SVGit4Me Works</h1>
                <p className="text-gray-600">Technical Deep Dive & Architecture Overview</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Architecture Overview */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Code className="h-8 w-8 text-blue-600" />
            Architecture Overview
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            SVGit4Me is designed with <strong>privacy and security as core principles</strong>. 
            The application uses a dual-deployment strategy that gives users control over their data privacy.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Local Docker Deployment */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Lock className="h-5 w-5" />
                  Local Docker Deployment
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Recommended</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-700">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <strong>100% Local Processing</strong>: All vectorization happens on your computer
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <strong>Zero Data Transmission</strong>: Images never leave your machine
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <strong>Complete Privacy</strong>: No external servers involved
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <strong>Offline Capable</strong>: Works without internet after setup
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
              <CardContent className="text-orange-700">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <strong>Convenience Demo</strong>: Quick testing without setup
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <strong>Server-Side Processing</strong>: Images processed on Railway
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <strong>Honest Labeling</strong>: Clearly marked as "Demo Mode"
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <strong>Educational Purpose</strong>: Shows functionality before local install
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technical Implementation */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Cpu className="h-8 w-8 text-purple-600" />
            Core Vectorization Engines
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* VTracer */}
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-800">VTracer (Color Images)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Rust-based</strong>: High-performance vectorization engine</li>
                  <li><strong>Color Accuracy</strong>: Superior color reproduction and gradients</li>
                  <li><strong>Multiple Modes</strong>: Spline, polygon, and mixed vectorization</li>
                  <li><strong>Quality Control</strong>: Configurable precision and filtering</li>
                </ul>
                <div className="mt-4 bg-gray-100 p-3 rounded-lg">
                  <code className="text-sm text-gray-800">
                    vtracer --input "image.png" --output "result.svg"<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;--colormode color --color_precision 6<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;--mode spline --corner_threshold 60
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Potrace */}
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-800">Potrace (Black & White)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Bitmap Tracing</strong>: Specialized for monochrome conversion</li>
                  <li><strong>ImageMagick Preprocessing</strong>: Automatic optimization</li>
                  <li><strong>Precise Curves</strong>: Mathematical curve fitting</li>
                  <li><strong>Size Optimization</strong>: Minimal SVG file sizes</li>
                </ul>
                <div className="mt-4 bg-gray-100 p-3 rounded-lg">
                  <code className="text-sm text-gray-800">
                    magick "image.png" -trim +repage -threshold 50% "prep.pbm"<br />
                    potrace "prep.pbm" -s -o "result.svg"
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Mobile Optimizations */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Smartphone className="h-8 w-8 text-blue-600" />
            Mobile Optimizations
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-800 text-lg">Intelligent Preprocessing</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                <ul className="space-y-1 text-sm">
                  <li>• Auto-resize: 800x800px max</li>
                  <li>• 400K pixel limit</li>
                  <li>• 0.8 compression quality</li>
                  <li>• Memory management</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-800 text-lg">Progressive Retry</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                <ul className="space-y-1 text-sm">
                  <li>• Auto-retry with simpler settings</li>
                  <li>• Force B&W for reliability</li>
                  <li>• Ultra-conservative parameters</li>
                  <li>• Aggressive filtering</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-800 text-lg">Extended Timeouts</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                <ul className="space-y-1 text-sm">
                  <li>• Desktop: 60 seconds</li>
                  <li>• Mobile/Safari: 120 seconds</li>
                  <li>• Mobile Retry: 180 seconds</li>
                  <li>• Slower connection support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Privacy & Security */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Shield className="h-8 w-8 text-green-600" />
            Privacy & Security Features
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Local Docker Security</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Complete Data Isolation</h4>
                    <div className="bg-gray-100 p-3 rounded text-sm">
                      <code>
                        ports: ["3000:3000"] # Only local access<br />
                        NEXT_TELEMETRY_DISABLED=1 # No telemetry
                      </code>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Automatic Cleanup</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Temporary files deleted immediately</li>
                      <li>• No persistent storage</li>
                      <li>• Memory clearing after processing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-800">Cloud Demo Safeguards</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Honest Disclosure</h4>
                    <div className="bg-gray-100 p-3 rounded text-sm">
                      <code>
                        if (isLocalDeployment) &#123;<br />
                        &nbsp;&nbsp;// Show: "🔒 100% Local Processing"<br />
                        &#125; else &#123;<br />
                        &nbsp;&nbsp;// Show: "🌐 Demo Mode - Cloud Processing"<br />
                        &#125;
                      </code>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Temporary Processing</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Files deleted immediately after processing</li>
                      <li>• No permanent storage of user images</li>
                      <li>• Ephemeral container processing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Monitor className="h-8 w-8 text-indigo-600" />
            Technical Specifications
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-indigo-800 text-lg">Input Formats</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                <ul className="space-y-1 text-sm">
                  <li>• PNG, JPG, JPEG</li>
                  <li>• GIF, WebP, BMP</li>
                  <li>• Maximum: 15MB</li>
                  <li>• Optimal: 300-2000px</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-indigo-800 text-lg">Output Quality</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                <ul className="space-y-1 text-sm">
                  <li>• SVG 1.1 compliant</li>
                  <li>• 1-8 decimal precision</li>
                  <li>• Color, grayscale, binary</li>
                  <li>• Auto viewBox correction</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-indigo-800 text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                <ul className="space-y-1 text-sm">
                  <li>• Simple logos: 1-3s</li>
                  <li>• Complex photos: 10-30s</li>
                  <li>• Large images: 30-60s</li>
                  <li>• Mobile: +50% time</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Deployment Options */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-600" />
            Getting Started
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Local Docker Setup (Recommended)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
                  <div># Quick start</div>
                  <div>git clone https://github.com/nicholaspatten/SVGit4Me-local-only</div>
                  <div>cd SVGit4Me-local-only</div>
                  <div>docker compose up</div>
                  <div># Access at http://localhost:3000</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-700">
                    <Shield className="h-4 w-4" />
                    100% local processing
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <Shield className="h-4 w-4" />
                    Complete privacy
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <Shield className="h-4 w-4" />
                    Offline capable
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <Shield className="h-4 w-4" />
                    Professional-grade results
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Cloud Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-orange-700">
                    The cloud demo is perfect for:
                  </p>
                  <ul className="space-y-2 text-orange-700">
                    <li className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Showcasing functionality
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Quick testing without setup
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Educational demonstrations
                    </li>
                  </ul>
                  <div className="bg-orange-100 border border-orange-200 p-3 rounded">
                    <p className="text-orange-800 text-sm font-medium">
                      ⚠️ Not recommended for sensitive images - processing happens on external servers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t pt-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Link href="https://github.com/nicholaspatten/SVGit4Me-local-only">
              <Button variant="outline" className="gap-2">
                <Github className="h-4 w-4" />
                View on GitHub
              </Button>
            </Link>
            <Link href="/">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Try SVGit4Me
              </Button>
            </Link>
          </div>
          <p className="text-gray-600">
            Made with ❤️ for privacy-conscious users who demand quality results.
          </p>
        </div>
      </div>
    </div>
  )
}
