"use client"

import type React from "react"

import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { ImageIcon, FileUp, FileDown, Copy, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

// This would be imported from the vtracer WASM package in a real implementation
declare global {
  interface Window {
    vtracer: {
      loadWasm: () => Promise<void>
      processImage: (
        imageData: ImageData,
        options: {
          mode: string
          colorMode: string
          colorNumber: number
          cornerThreshold: number
          spliceThreshold: number
          filterSpeckle: number
          pathPrecision: number
        },
      ) => Promise<string>
    }
  }
}

const PRESETS = {
  photo: {
    mode: "spline",
    colorMode: "color",
    colorNumber: 16,
    cornerThreshold: 60,
    spliceThreshold: 45,
    filterSpeckle: 2,
    pathPrecision: 4,
  },
  logo: {
    mode: "polygon",
    colorMode: "color",
    colorNumber: 8,
    cornerThreshold: 80,
    spliceThreshold: 60,
    filterSpeckle: 4,
    pathPrecision: 6,
  },
  lineart: {
    mode: "spline",
    colorMode: "grayscale",
    colorNumber: 2,
    cornerThreshold: 40,
    spliceThreshold: 30,
    filterSpeckle: 1,
    pathPrecision: 4,
  },
  bw: {
    mode: "polygon",
    colorMode: "grayscale",
    colorNumber: 2,
    cornerThreshold: 90,
    spliceThreshold: 80,
    filterSpeckle: 2,
    pathPrecision: 2,
  },
  poster: {
    mode: "polygon",
    colorMode: "color",
    colorNumber: 4,
    cornerThreshold: 70,
    spliceThreshold: 50,
    filterSpeckle: 3,
    pathPrecision: 3,
  },
  detailed: {
    mode: "spline",
    colorMode: "color",
    colorNumber: 32,
    cornerThreshold: 30,
    spliceThreshold: 20,
    filterSpeckle: 1,
    pathPrecision: 8,
  },
  custom: null, // Will use current settings
};

export function Vectorizer() {
  const [pngImage, setPngImage] = useState<string | null>(null)
  const [svgImage, setSvgImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wasmLoaded, setWasmLoaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // State to track which tooltip is currently visible
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  // Add a delay timer ref to prevent flashing
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null)

  // VTracer settings
  const [settings, setSettings] = useState({
    mode: "spline", // spline is default for both color and B&W
    colorMode: "color", // color or grayscale
    colorNumber: 16, // number of colors
    cornerThreshold: 60, // corner detection threshold (0-180)
    spliceThreshold: 45, // curve splice threshold (0-180)
    filterSpeckle: 4, // filter speckle size
    pathPrecision: 8, // SVG path precision (0-10)
    alphamax: 1, // alphamax slider (0-1)
    gradientStep: 16, // gradient step for color mode
    segmentLength: 4, // segment length for both modes
    cutoutMode: 'stacked', // 'stacked' or 'cutout', default to stacked
  })

  const [preset, setPreset] = useState<keyof typeof PRESETS>("logo");

  // When preset changes, update settings unless 'custom'
  useEffect(() => {
    if (preset !== "custom" && PRESETS[preset]) {
      setSettings(prev => ({
        ...PRESETS[preset]!,
        alphamax: typeof prev.alphamax === 'number' ? prev.alphamax : 1,
        gradientStep: typeof prev.gradientStep === 'number' ? prev.gradientStep : 16,
        segmentLength: typeof prev.segmentLength === 'number' ? prev.segmentLength : 4,
        cutoutMode: 'stacked', // Always reset to stacked on preset change
      }));
    } else if (preset === "custom") {
      setSettings(prev => ({
        ...prev,
        mode: 'spline',
      }));
    }
  }, [preset]);

  // Load WASM on component mount
  useEffect(() => {
    // In a real implementation, we would load the vtracer WASM module here
    // For this demo, we'll simulate the loading
    const loadWasm = async () => {
      try {
        // Simulate WASM loading
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setWasmLoaded(true)
        console.log("VTracer WASM loaded")
      } catch (err) {
        console.error("Failed to load VTracer WASM:", err)
        setError("Failed to load VTracer library")
      }
    }

    loadWasm()

    // Add event listener to close tooltips when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".tooltip-trigger") && !target.closest(".tooltip-content")) {
        setActiveTooltip(null)
      }
    }

    document.addEventListener("click", handleClickOutside)

    return () => {
      document.removeEventListener("click", handleClickOutside)
      // Clear any pending timers on unmount
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current)
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes("image/")) {
      setError("Please upload an image file")
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      setPngImage(event.target?.result as string)
      setSvgImage(null)
    }
    reader.readAsDataURL(file)
  }

  const processImage = async () => {
    if (!pngImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Convert base64 data URL to Blob
      const res = await fetch(pngImage);
      const blob = await res.blob();

      // Prepare FormData
      const formData = new FormData();
      formData.append("image", blob, "upload.png");
      // Add all settings to FormData
      Object.entries(settings).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      formData.append("preset", preset); // Send the current preset

      // Call backend API
      const apiRes = await fetch("/api/vectorize", {
        method: "POST",
        body: formData,
      });

      if (!apiRes.ok) {
        const err = await apiRes.json();
        setError(err.error || "Failed to convert image");
        setIsProcessing(false);
        return;
      }

      const svgText = await apiRes.text();
      setSvgImage(`data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`);
    } catch (err) {
      setError("Failed to process image");
    }

    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!file.type.includes("image/")) {
      setError("Please upload an image file")
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      setPngImage(event.target?.result as string)
      setSvgImage(null)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDownload = () => {
    if (!svgImage) return

    const link = document.createElement("a")
    link.href = svgImage
    link.download = "vectorized.svg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Update settings
  const updateSettings = (key: keyof typeof settings, value: any) => {
    setPreset("custom");
    setSettings((prev) => {
      if (key === 'colorMode') {
        // When switching colorMode, always reset mode to 'spline'
        return { ...prev, [key]: value, cutoutMode: 'stacked', mode: 'spline' };
      }
      return {
        ...prev,
        [key]: value,
      };
    })
  }

  // Show tooltip with delay to prevent flashing
  const showTooltip = (id: string) => {
    // Clear any existing timer
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current)
    }

    // Set a small delay before showing tooltip to prevent flashing
    tooltipTimerRef.current = setTimeout(() => {
      setActiveTooltip(id)
    }, 100)
  }

  // Hide tooltip with delay to prevent flashing
  const hideTooltip = () => {
    // Clear any existing timer
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current)
    }

    // Set a small delay before hiding tooltip to prevent flashing
    tooltipTimerRef.current = setTimeout(() => {
      setActiveTooltip(null)
    }, 300)
  }

  // Toggle tooltip visibility on click
  const toggleTooltip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent event bubbling
    setActiveTooltip(activeTooltip === id ? null : id)
  }

  // Helper component for option descriptions with custom tooltip
  const OptionLabel = ({
    id,
    children,
    description,
  }: { id: string; children: React.ReactNode; description: string }) => {
    return (
      <div className="flex items-center gap-1 relative">
        <span>{children}</span>
        <button
          type="button"
          onClick={(e) => toggleTooltip(e, id)}
          className="tooltip-trigger inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 focus:outline-none"
          aria-label={`Help for ${children}`}
          onMouseEnter={() => showTooltip(id)}
          onMouseLeave={hideTooltip}
        >
          ?
        </button>
        {activeTooltip === id && (
          <div
            className="tooltip-content absolute z-50 left-0 top-6 w-64 p-2 bg-white border rounded shadow-lg text-sm text-gray-700"
            onMouseEnter={() => showTooltip(id)}
            onMouseLeave={hideTooltip}
          >
            {description}
          </div>
        )}
      </div>
    )
  }

  // SVG pan/zoom state
  const [svgViewBox, setSvgViewBox] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{x: number, y: number} | null>(null);
  const viewBoxStart = useRef<{x: number, y: number, w: number, h: number} | null>(null);

  // Helper to parse and stringify viewBox
  function parseViewBox(vb: string) {
    const [x, y, w, h] = vb.split(' ').map(Number);
    return {x, y, w, h};
  }
  function stringifyViewBox({x, y, w, h}: {x: number, y: number, w: number, h: number}) {
    return `${x} ${y} ${w} ${h}`;
  }

  // Set initial viewBox on SVG load
  const handleSVGLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const svg = e.currentTarget;
    if (svgImage) {
      const decoded = decodeURIComponent(svgImage);
      const match = decoded.match(/viewBox="([0-9.\- ]+)"/);
      if (match) {
        setSvgViewBox(match[1]);
      } else {
        // Try to extract width and height
        const widthMatch = decoded.match(/width="([0-9.]+)"/);
        const heightMatch = decoded.match(/height="([0-9.]+)"/);
        if (widthMatch && heightMatch) {
          setSvgViewBox(`0 0 ${widthMatch[1]} ${heightMatch[1]}`);
        }
      }
    }
  };

  // Mouse events for panning
  const handleSVGMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!svgViewBox) return;
    setIsDragging(true);
    dragStart.current = {x: e.clientX, y: e.clientY};
    viewBoxStart.current = parseViewBox(svgViewBox);
  };
  const handleSVGMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !svgViewBox || !dragStart.current || !viewBoxStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const scale = viewBoxStart.current.w / 400; // 400px preview width
    let newX = viewBoxStart.current.x - dx * scale;
    let newY = viewBoxStart.current.y - dy * scale;
    let w = viewBoxStart.current.w;
    let h = viewBoxStart.current.h;
    // Clamp so viewBox never leaves SVG bounds (assume min 0,0 and max width,height)
    const [vb0, vb1, vbW, vbH] = svgViewBox.split(' ').map(Number);
    newX = Math.max(0, Math.min(newX, vbW - w));
    newY = Math.max(0, Math.min(newY, vbH - h));
    setSvgViewBox(stringifyViewBox({ x: newX, y: newY, w, h }));
  };
  const handleSVGMouseUp = () => setIsDragging(false);
  // Zoom with Ctrl+Scroll
  const handleSVGWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!svgViewBox || (!e.ctrlKey && !e.metaKey)) return;
    e.preventDefault();
    const vb = parseViewBox(svgViewBox);
    const zoom = e.deltaY < 0 ? 0.9 : 1.1;
    let newW = clamp(vb.w * zoom, 50, vb.w); // Don't zoom in past 50x50, or out past original size
    let newH = clamp(vb.h * zoom, 50, vb.h);
    let newX = vb.x + (vb.w - newW) / 2;
    let newY = vb.y + (vb.h - newH) / 2;
    // Clamp so viewBox never leaves SVG bounds
    newX = Math.max(0, Math.min(newX, vb.w - newW));
    newY = Math.max(0, Math.min(newY, vb.h - newH));
    setSvgViewBox(stringifyViewBox({ x: newX, y: newY, w: newW, h: newH }));
  };

  // Add state for original image pan/zoom
  const [imgScale, setImgScale] = useState(1);
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
  const [imgIsDragging, setImgIsDragging] = useState(false);
  const imgDragStart = useRef<{ x: number; y: number } | null>(null);
  const imgOffsetStart = useRef<{ x: number; y: number } | null>(null);

  // Refs for measuring container and header
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const imgHeaderRef = useRef<HTMLHeadingElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgHeaderRef = useRef<HTMLDivElement>(null);
  const [imgBounds, setImgBounds] = useState({ width: 300, height: 300 });
  const [svgBounds, setSvgBounds] = useState({ width: 300, height: 300 });

  // Measure visible area for image and SVG after render
  useLayoutEffect(() => {
    if (imgContainerRef.current && imgHeaderRef.current) {
      const cRect = imgContainerRef.current.getBoundingClientRect();
      const hRect = imgHeaderRef.current.getBoundingClientRect();
      setImgBounds({
        width: cRect.width,
        height: cRect.height - (hRect.bottom - cRect.top) - 16, // 16px gap below header
      });
    }
    if (svgContainerRef.current && svgHeaderRef.current) {
      const cRect = svgContainerRef.current.getBoundingClientRect();
      const hRect = svgHeaderRef.current.getBoundingClientRect();
      setSvgBounds({
        width: cRect.width,
        height: cRect.height - (hRect.bottom - cRect.top) - 16,
      });
    }
  }, [pngImage, svgImage, imgScale]);

  // Pan/zoom handlers for original image
  const handleImgMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setImgIsDragging(true);
    imgDragStart.current = { x: e.clientX, y: e.clientY };
    imgOffsetStart.current = { ...imgOffset };
  };
  const handleImgMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgIsDragging || !imgDragStart.current || !imgOffsetStart.current) return;
    let newX = imgOffsetStart.current.x + (e.clientX - imgDragStart.current.x);
    let newY = imgOffsetStart.current.y + (e.clientY - imgDragStart.current.y);
    const img = document.querySelector('img[alt="Original"]') as HTMLImageElement | null;
    if (img) {
      const scale = imgScale;
      const imgW = img.naturalWidth * scale;
      const imgH = img.naturalHeight * scale;
      const boxW = imgBounds.width, boxH = imgBounds.height;
      const minX = imgW < boxW ? (boxW - imgW) / 2 : boxW - imgW;
      const maxX = imgW < boxW ? (boxW - imgW) / 2 : 0;
      const minY = imgH < boxH ? (boxH - imgH) / 2 : boxH - imgH;
      const maxY = imgH < boxH ? (boxH - imgH) / 2 : 0;
      newX = clamp(newX, minX, maxX);
      newY = clamp(newY, minY, maxY);
    }
    setImgOffset({ x: newX, y: newY });
  };
  const handleImgMouseUp = () => setImgIsDragging(false);
  const handleImgWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setImgScale((s) => {
      let newScale = clamp(s * (e.deltaY < 0 ? 1.1 : 0.9), 0.1, 10);
      setTimeout(() => {
        const img = document.querySelector('img[alt="Original"]') as HTMLImageElement | null;
        if (img) {
          const imgW = img.naturalWidth * newScale;
          const imgH = img.naturalHeight * newScale;
          const boxW = imgBounds.width, boxH = imgBounds.height;
          const minX = imgW < boxW ? (boxW - imgW) / 2 : boxW - imgW;
          const maxX = imgW < boxW ? (boxW - imgW) / 2 : 0;
          const minY = imgH < boxH ? (boxH - imgH) / 2 : boxH - imgH;
          const maxY = imgH < boxH ? (boxH - imgH) / 2 : 0;
          setImgOffset((offset) => ({
            x: clamp(offset.x, minX, maxX),
            y: clamp(offset.y, minY, maxY),
          }));
        }
      }, 0);
      return newScale;
    });
  };
  const resetImgView = () => {
    setImgScale(1);
    setTimeout(() => {
      const img = document.querySelector('img[alt="Original"]') as HTMLImageElement | null;
      if (img) {
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        const boxW = imgBounds.width, boxH = imgBounds.height;
        const x = imgW < boxW ? (boxW - imgW) / 2 : 0;
        const y = imgH < boxH ? (boxH - imgH) / 2 : 0;
        setImgOffset({ x, y });
      } else {
        setImgOffset({ x: 0, y: 0 });
      }
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Step 4: SVG Output and Original Image at the top */}
      <div className="grid md:grid-cols-2 gap-6 mb-4">
        <div className="flex flex-col items-center w-full">
          <h2 className="text-base font-semibold mb-2 mt-2 text-center w-full">Original Image</h2>
          <Card className="p-6 flex flex-col items-center justify-center min-h-[400px] w-full border-dashed relative overflow-hidden">
            {pngImage ? (
              <>
                <div className="absolute top-3 right-4 flex gap-1 bg-white/80 rounded-full shadow p-0.5 z-10">
                  <button onClick={() => setImgScale((s) => Math.min(10, s * 1.1))} className="rounded-full p-0.5 hover:bg-gray-100"><ZoomIn className="w-4 h-4" /></button>
                  <button onClick={() => setImgScale((s) => Math.max(0.1, s * 0.9))} className="rounded-full p-0.5 hover:bg-gray-100"><ZoomOut className="w-4 h-4" /></button>
                  <button onClick={resetImgView} className="rounded-full p-0.5 hover:bg-gray-100"><RotateCcw className="w-4 h-4" /></button>
                </div>
                <div
                  ref={imgContainerRef}
                  className="relative w-full h-[300px] flex items-center justify-center cursor-grab"
                  onMouseDown={handleImgMouseDown}
                  onMouseMove={handleImgMouseMove}
                  onMouseUp={handleImgMouseUp}
                  onMouseLeave={handleImgMouseUp}
                  onWheel={handleImgWheel}
                  style={{ userSelect: imgIsDragging ? 'none' : undefined }}
                >
                  <img
                    src={pngImage}
                    alt="Original"
                    className="max-w-full max-h-[300px] object-contain"
                    draggable={false}
                    style={{
                      transform: `translate(${imgOffset.x}px, ${imgOffset.y}px) scale(${imgScale})`,
                      transition: imgIsDragging ? 'none' : 'transform 0.1s',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-500 text-lg">Please Select an image</div>
            )}
          </Card>
        </div>
        <div className="flex flex-col items-center w-full">
          <div className="text-base font-semibold mb-2 mt-2 text-center w-full">SVG Output</div>
          <Card className="p-6 flex flex-col items-center justify-center min-h-[400px] w-full relative overflow-hidden">
            {(svgImage || isProcessing) ? (
              <>
                <div className="absolute top-3 right-4 flex gap-1 bg-white/80 rounded-full shadow p-0.5 z-10">
                  <button onClick={() => setSvgViewBox(vb => {
                    if (!vb) return vb;
                    const { x, y, w, h } = parseViewBox(vb);
                    const zoom = 0.9;
                    const newW = w * zoom;
                    const newH = h * zoom;
                    return stringifyViewBox({
                      x: x + (w - newW) / 2,
                      y: y + (h - newH) / 2,
                      w: newW,
                      h: newH,
                    });
                  })} className="rounded-full p-0.5 hover:bg-gray-100"><ZoomIn className="w-4 h-4" /></button>
                  <button onClick={() => setSvgViewBox(vb => {
                    if (!vb) return vb;
                    const { x, y, w, h } = parseViewBox(vb);
                    const zoom = 1.1;
                    const newW = w * zoom;
                    const newH = h * zoom;
                    return stringifyViewBox({
                      x: x + (w - newW) / 2,
                      y: y + (h - newH) / 2,
                      w: newW,
                      h: newH,
                    });
                  })} className="rounded-full p-0.5 hover:bg-gray-100"><ZoomOut className="w-4 h-4" /></button>
                  <button onClick={() => setSvgViewBox(null)} className="rounded-full p-0.5 hover:bg-gray-100"><RotateCcw className="w-4 h-4" /></button>
                </div>
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-t-gray-600 border-gray-200 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Converting to SVG...</p>
                  </div>
                ) : svgImage ? (
                  <div
                    ref={svgContainerRef}
                    className="relative w-full h-[300px] flex items-center justify-center cursor-grab"
                    onMouseDown={handleSVGMouseDown}
                    onMouseMove={handleSVGMouseMove}
                    onMouseUp={handleSVGMouseUp}
                    onMouseLeave={handleSVGMouseUp}
                    onWheel={handleSVGWheel}
                    style={{ userSelect: isDragging ? 'none' : undefined }}
                  >
                    <img
                      src={svgImage}
                      alt="SVG Output"
                      className="max-w-full max-h-[300px] object-contain"
                      onLoad={handleSVGLoad}
                      draggable={false}
                      style={{ pointerEvents: 'none' }}
                    />
                    {svgViewBox && (
                      <svg
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        viewBox={svgViewBox}
                        style={{ zIndex: 1 }}
                        dangerouslySetInnerHTML={{ __html: decodeURIComponent(svgImage).replace(/^data:image\/svg\+xml;utf8,/, '').replace(/<\/?svg[^>]*>/g, '') }}
                      />
                    )}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-500 text-lg">Download or copy the SVG paths</div>
            )}
          </Card>
        </div>
      </div>
      {/* Steps 1-4 in a row, now below the image/result cards, with wider container */}
      <div className="w-[710px] mx-auto">
        <div className="flex gap-1 mb-2 justify-center">
          {/* Step 1: Upload */}
          <Card className="inline-flex items-center justify-center px-1 py-1 border-0 shadow-none">
            <span className="font-semibold text-base mr-2 whitespace-nowrap">Step 1:</span>
                      <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-3 text-sm bg-black text-white hover:bg-gray-900 focus:ring-black"
            >
              Select
            </Button>
            {error && <p className="text-red-500 ml-2 text-sm">{error}</p>}
          </Card>
          {/* Step 2: Presets as dropdown */}
          <Card className="inline-flex items-center justify-center px-1 py-1 border-0 shadow-none">
            <span className="font-semibold text-base mr-2 whitespace-nowrap">Step 2:</span>
            <Select value={preset} onValueChange={v => setPreset(v as keyof typeof PRESETS)}>
              <SelectTrigger className="h-9 border border-black bg-black text-white rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:bg-gray-900 hover:text-white w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border-black">
                {Object.keys(PRESETS).map((key) => (
                  <SelectItem key={key} value={key} className="bg-black text-white data-[state=checked]:bg-gray-900 data-[state=checked]:text-white focus:bg-gray-900 focus:text-white">
                    {key === 'bw' ? 'Black & White' : key.charAt(0).toUpperCase() + key.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {preset === "custom" && (
              <>
                {/* Existing advanced settings UI here */}
              </>
            )}
          </Card>
          {/* Step 3: Convert to SVG */}
          <Card className="inline-flex items-center justify-center px-1 py-1 border-0 shadow-none">
            <span className="font-semibold text-base mr-2 whitespace-nowrap">Step 3:</span>
            <Button
              onClick={processImage}
              disabled={!pngImage || isProcessing}
              className="h-9 px-3 text-sm bg-black text-white hover:bg-gray-900 focus:ring-black"
            >
              {isProcessing ? "Converting..." : "Convert to SVG"}
            </Button>
          </Card>
          {/* Step 4: Download/Copy SVG (always shown, all on one line) */}
          <Card className="inline-flex items-center justify-center px-1 py-1 border-0 shadow-none">
            <span className="font-semibold text-base mr-2 whitespace-nowrap">Step 4:</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleDownload}
                  disabled={!svgImage}
                  className={`h-9 flex items-center gap-2 px-3 text-sm bg-black text-white hover:bg-gray-900 focus:ring-black mr-2 ${!svgImage ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed hover:bg-gray-200 hover:text-gray-400' : ''}`}
                  aria-label="Download SVG"
                >
                  <FileDown className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download SVG</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    if (!svgImage) return;
                    // Copy only the SVG markup (from <svg ...> to </svg>), removing <metadata>...</metadata>
                    const svgTextRaw = decodeURIComponent(svgImage.replace(/^data:image\/svg\+xml;utf8,/, ""));
                    let svgOnly = svgTextRaw.match(/<svg[\s\S]*?<\/svg>/i)?.[0] || svgTextRaw;
                    // Remove <metadata>...</metadata>
                    svgOnly = svgOnly.replace(/<metadata[\s\S]*?<\/metadata>/i, "");
                    navigator.clipboard.writeText(svgOnly);
                  }}
                  disabled={!svgImage}
                  className={`h-9 flex items-center gap-2 px-3 text-sm bg-black text-white hover:bg-gray-900 focus:ring-black ${!svgImage ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed hover:bg-gray-200 hover:text-gray-400' : ''}`}
                  aria-label="Copy SVG"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy SVG Paths to Clipboard</TooltipContent>
            </Tooltip>
          </Card>
                    </div>
                  </div>
      {/* Custom options UI below step cards if preset is custom */}
      {preset === "custom" && (
        <Card className="p-4 mb-4 w-[710px] mx-auto">
          <div className="font-semibold mb-1">Custom options</div>
          {/* Color / Black & White toggle */}
          <div className="flex gap-2 mb-2">
            <button
              className={`h-9 flex-1 px-3 py-1 rounded border text-xs font-semibold ${settings.colorMode === 'color' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
              onClick={() => updateSettings('colorMode', 'color')}
              type="button"
            >
              Color
            </button>
            <button
              className={`h-9 flex-1 px-3 py-1 rounded border text-xs font-semibold ${settings.colorMode === 'grayscale' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
              onClick={() => updateSettings('colorMode', 'grayscale')}
              type="button"
            >
              Black & White
            </button>
          </div>
          {/* Color options */}
          {settings.colorMode === 'color' ? (
            <div className="space-y-2">
              {/* Stacked/Cutout segmented control */}
              <div className="flex gap-2 mb-2">
                <button
                  className={`h-9 flex-1 px-3 py-1 rounded border text-xs font-semibold ${settings.cutoutMode !== 'cutout' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
                  onClick={() => updateSettings('cutoutMode', 'stacked')}
                  type="button"
                >
                  Stacked
                </button>
                <button
                  className={`h-9 flex-1 px-3 py-1 rounded border text-xs font-semibold ${settings.cutoutMode === 'cutout' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
                  onClick={() => updateSettings('cutoutMode', 'cutout')}
                  type="button"
                >
                  Cutout
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="block text-xs font-medium whitespace-nowrap">Filter Speckle <span className="text-gray-400">(Cleaner)</span></label>
                <input type="range" min={0} max={10} step={1} className="flex-1 accent-black bg-gray-200" value={settings.filterSpeckle} onChange={e => updateSettings("filterSpeckle", Number(e.target.value))} />
                <span className="text-xs w-6 text-right">{settings.filterSpeckle}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="block text-xs font-medium whitespace-nowrap">Color Precision <span className="text-gray-400">(More accurate)</span></label>
                <input type="range" min={1} max={8} step={1} className="flex-1 accent-black bg-gray-200" value={settings.colorNumber} onChange={e => updateSettings("colorNumber", Math.max(1, Math.min(8, Number(e.target.value))))} />
                <span className="text-xs w-6 text-right">{settings.colorNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="block text-xs font-medium whitespace-nowrap">Gradient Step <span className="text-gray-400">(Less layers)</span></label>
                <input type="range" min={1} max={32} step={1} className="flex-1 accent-black bg-gray-200" value={settings.gradientStep} onChange={e => updateSettings("gradientStep", Number(e.target.value))} />
                <span className="text-xs w-8 text-right">{settings.gradientStep}</span>
              </div>
              {/* Curve Fitting segmented control */}
              <div className="mt-2">
                <div className="font-bold text-xs mb-1">Curve fitting</div>
                <div className="flex gap-2">
                  <button className={`h-9 flex-1 px-3 py-1 rounded border text-xs font-semibold ${settings.mode === 'spline' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`} onClick={() => updateSettings('mode', 'spline')} type="button">Spline</button>
                  <button className={`h-9 flex-1 px-3 py-1 rounded border text-xs font-semibold ${settings.mode === 'pixel' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`} onClick={() => updateSettings('mode', 'pixel')} type="button">Pixel</button>
                  <button className={`h-9 flex-1 px-3 py-1 rounded border text-xs font-semibold ${settings.mode === 'polygon' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`} onClick={() => updateSettings('mode', 'polygon')} type="button">Polygon</button>
                </div>
              </div>
              {settings.mode === 'spline' && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-medium whitespace-nowrap">Corner Threshold <span className="text-gray-400">(Smoother)</span></label>
                    <input type="range" min={0} max={180} step={1} className="flex-1 accent-black bg-gray-200" value={settings.cornerThreshold} onChange={e => updateSettings("cornerThreshold", Number(e.target.value))} />
                    <span className="text-xs w-8 text-right">{settings.cornerThreshold}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-medium whitespace-nowrap">Segment Length <span className="text-gray-400">(More coarse)</span></label>
                    <input type="range" min={1} max={32} step={1} className="flex-1 accent-black bg-gray-200" value={settings.segmentLength} onChange={e => updateSettings("segmentLength", Number(e.target.value))} />
                    <span className="text-xs w-6 text-right">{settings.segmentLength}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-medium whitespace-nowrap">Splice Threshold <span className="text-gray-400">(Less accurate)</span></label>
                    <input type="range" min={0} max={180} step={1} className="flex-1 accent-black bg-gray-200" value={settings.spliceThreshold} onChange={e => updateSettings("spliceThreshold", Number(e.target.value))} />
                    <span className="text-xs w-8 text-right">{settings.spliceThreshold}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Black & White options
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-xs font-medium whitespace-nowrap">Filter Speckle <span className="text-gray-400">(Cleaner)</span></label>
                <input type="range" min={0} max={10} step={1} className="flex-1 accent-black bg-gray-200" value={settings.filterSpeckle} onChange={e => updateSettings("filterSpeckle", Number(e.target.value))} />
                <span className="text-xs w-6 text-right">{settings.filterSpeckle}</span>
              </div>
              {/* Curve Fitting segmented control */}
              <div className="mt-2">
                <div className="font-bold text-xs mb-1">Curve fitting</div>
                <div className="flex gap-2">
                  <button className={`h-9 flex-1 px-3 py-1 rounded border text-xs font-semibold ${settings.mode === 'spline' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`} onClick={() => updateSettings('mode', 'spline')} type="button">Spline</button>
                  <button className={`h-9 flex-1 px-3 py-1 rounded border text-xs font-semibold ${settings.mode === 'pixel' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`} onClick={() => updateSettings('mode', 'pixel')} type="button">Pixel</button>
                  <button className={`h-9 flex-1 px-3 py-1 rounded border text-xs font-semibold ${settings.mode === 'polygon' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`} onClick={() => updateSettings('mode', 'polygon')} type="button">Polygon</button>
                </div>
              </div>
              {settings.mode === 'spline' && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-medium whitespace-nowrap">Corner Threshold <span className="text-gray-400">(Smoother)</span></label>
                    <input type="range" min={0} max={180} step={1} className="flex-1 accent-black bg-gray-200" value={settings.cornerThreshold} onChange={e => updateSettings("cornerThreshold", Number(e.target.value))} />
                    <span className="text-xs w-8 text-right">{settings.cornerThreshold}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-medium whitespace-nowrap">Segment Length <span className="text-gray-400">(More coarse)</span></label>
                    <input type="range" min={1} max={32} step={1} className="flex-1 accent-black bg-gray-200" value={settings.segmentLength} onChange={e => updateSettings("segmentLength", Number(e.target.value))} />
                    <span className="text-xs w-6 text-right">{settings.segmentLength}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-medium whitespace-nowrap">Splice Threshold <span className="text-gray-400">(Less accurate)</span></label>
                    <input type="range" min={0} max={180} step={1} className="flex-1 accent-black bg-gray-200" value={settings.spliceThreshold} onChange={e => updateSettings("spliceThreshold", Number(e.target.value))} />
                    <span className="text-xs w-8 text-right">{settings.spliceThreshold}</span>
                  </div>
                </>
              )}
            </div>
          )}
            </Card>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  )
}

// Helper to clamp a value between min and max
function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}
