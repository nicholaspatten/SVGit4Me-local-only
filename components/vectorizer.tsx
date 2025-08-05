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

// Deployment Banner Component
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
      <div className="text-center mb-4">
        <div className="inline-block bg-green-50 border border-green-200 px-3 py-1.5 rounded text-xs">
          <span className="text-green-700">🔒 Local Processing</span>
        </div>
      </div>
    )
  } else {
    return (
      <div className="text-center mb-4">
        <div className="inline-block bg-orange-50 border border-orange-200 px-3 py-1.5 rounded text-xs">
          <span className="text-orange-700">🌐 Temporary Cloud Processing - Get local version on GitHub</span>
        </div>
      </div>
    )
  }
}

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
  const [isMobileDevice, setIsMobileDevice] = useState(false)
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

  // Detect mobile device and enable optimizations
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(userAgent);
    setIsMobileDevice(isMobile);
    
    if (isMobile) {
      console.log("📱 Mobile device detected - optimizations enabled");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // More specific file type validation for Safari
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError("Please upload a valid image file (PNG, JPG, GIF, WebP, BMP)")
      return
    }

    // Check file size (limit to 10MB for mobile compatibility)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file too large. Please use an image smaller than 10MB")
      return
    }

    setError(null)
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string
        if (result) {
          setPngImage(result)
          setSvgImage(null)
          // Clear the input to allow re-selecting the same file
          e.target.value = ''
        }
      } catch (err) {
        setError("Failed to read image file")
      }
    }
    
    reader.onerror = () => {
      setError("Failed to read image file")
    }
    
    reader.readAsDataURL(file)
  }

  // Test function for debugging mobile issues
  const testUpload = async () => {
    if (!pngImage) return;
    
    console.log("Testing upload on mobile browser");
    setError(null);
    
    try {
      // Convert base64 data URL to Blob
      let blob: Blob;
      const base64Data = pngImage.split(',')[1];
      const mimeType = pngImage.split(',')[0].split(':')[1].split(';')[0];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: mimeType });
      
      const formData = new FormData();
      formData.append("image", blob, "test.png");
      
      const response = await fetch("/api/test-upload", {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      console.log("Test upload result:", result);
      
      if (response.ok) {
        setError(`Test SUCCESS: ${JSON.stringify(result, null, 2)}`);
      } else {
        setError(`Test FAILED: ${result.error} - ${result.details}`);
      }
    } catch (err) {
      console.error("Test upload error:", err);
      setError(`Test ERROR: ${err}`);
    }
  };

  // Mobile image preprocessing function
  const preprocessImageForMobile = async (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Mobile-specific size limits
        const MAX_MOBILE_WIDTH = 800;
        const MAX_MOBILE_HEIGHT = 800;
        const MAX_MOBILE_PIXELS = 400000; // 400K pixels max
        
        let { width, height } = img;
        const totalPixels = width * height;
        
        // Resize if too large for mobile
        if (width > MAX_MOBILE_WIDTH || height > MAX_MOBILE_HEIGHT || totalPixels > MAX_MOBILE_PIXELS) {
          const widthRatio = MAX_MOBILE_WIDTH / width;
          const heightRatio = MAX_MOBILE_HEIGHT / height;
          const pixelRatio = Math.sqrt(MAX_MOBILE_PIXELS / totalPixels);
          const ratio = Math.min(widthRatio, heightRatio, pixelRatio);
          
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
          
          console.log(`Mobile resize: ${img.width}x${img.height} → ${width}x${height}`);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Use lower quality for mobile to reduce file size
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Export with mobile-optimized quality (0.8 instead of default 0.92)
        const mobileDataUrl = canvas.toDataURL('image/png', 0.8);
        console.log(`Mobile optimization: ${dataUrl.length} → ${mobileDataUrl.length} bytes`);
        resolve(mobileDataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image for mobile preprocessing'));
      img.src = dataUrl;
    });
  };

  const processImage = async () => {
    if (!pngImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Detect mobile and preprocess image if needed
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(userAgent);
      
      console.log("=== MOBILE PREPROCESSING ===");
      console.log("Is mobile device:", isMobile);
      console.log("Original image size:", pngImage.length, "bytes");
      
      // Use mobile-optimized image if on mobile device
      let processedImage = pngImage;
      if (isMobile) {
        try {
          processedImage = await preprocessImageForMobile(pngImage);
          console.log("Mobile preprocessing successful");
        } catch (mobileError) {
          console.warn("Mobile preprocessing failed, using original:", mobileError);
          // Continue with original image if preprocessing fails
        }
      }
      
      // Validate image data URL
      console.log("=== IMAGE DATA VALIDATION ===");
      console.log("Final image data length:", processedImage.length);
      console.log("Data URL format valid:", processedImage.startsWith('data:image/'));
      console.log("Has base64 marker:", processedImage.includes(';base64,'));
      
      if (!processedImage.startsWith('data:image/')) {
        throw new Error("Invalid image data format - not a data URL");
      }
      
      if (!processedImage.includes(';base64,')) {
        throw new Error("Invalid image data format - not base64 encoded");
      }
      
      // Convert base64 data URL to Blob with better Safari/Firefox compatibility
      let blob: Blob;
      try {
        // Try fetch method first
        const res = await fetch(processedImage);
        if (!res.ok) {
          throw new Error(`Fetch failed: ${res.status}`);
        }
        blob = await res.blob();
        console.log("Successfully created blob via fetch, size:", blob.size, "type:", blob.type);
      } catch (fetchError) {
        console.log("Fetch method failed, trying manual conversion:", fetchError);
        try {
          // Fallback for Safari/Firefox: manual base64 to blob conversion
          const base64Data = processedImage.split(',')[1];
          const mimeType = processedImage.split(',')[0].split(':')[1].split(';')[0];
          
          if (!base64Data || !mimeType) {
            throw new Error("Invalid data URL format");
          }
          
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: mimeType });
          console.log("Successfully created blob via manual conversion, size:", blob.size, "type:", blob.type);
        } catch (manualError) {
          console.error("=== BLOB CONVERSION FAILED ===");
          console.error("Fetch error:", fetchError);
          console.error("Manual conversion error:", manualError);
          console.error("Original data URL length:", processedImage.length);
          console.error("Data URL prefix:", processedImage.substring(0, 50));
          console.error("User agent:", navigator.userAgent);
          throw new Error(`Failed to convert image data - Fetch: ${fetchError?.message}, Manual: ${manualError?.message}`);
        }
      }

      // Prepare FormData with better Safari compatibility
      const formData = new FormData();
      
      // Safari requires specific filename and MIME type handling
      const fileName = `upload_${Date.now()}.png`;
      const blobWithType = new Blob([blob], { type: blob.type || 'image/png' });
      formData.append("image", blobWithType, fileName);
      
      // Mobile-optimized settings
      let mobileSettings = { ...settings };
      let mobilePreset = preset;
      
      if (isMobile) {
        // Use mobile-friendly settings for better success rate
        mobileSettings = {
          mode: "spline",
          colorMode: preset === "bw" ? "binary" : "color",
          colorPrecision: Math.min(4, Number(settings.colorPrecision) || 4), // Lower precision for mobile
          cornerThreshold: Math.max(90, Number(settings.cornerThreshold) || 90), // Higher threshold = simpler
          filterSpeckle: Math.max(4, Number(settings.filterSpeckle) || 4), // More aggressive filtering
          spliceThreshold: Math.max(45, Number(settings.spliceThreshold) || 45), // Higher threshold
        };
        
        console.log("Mobile-optimized settings:", mobileSettings);
      }
      
      // Add settings to FormData
      Object.entries(mobileSettings).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      formData.append("preset", mobilePreset);
      
      // Debug FormData
      console.log("FormData entries:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, typeof value === 'object' ? `File(${value.constructor.name}, ${value.size} bytes)` : value);
      }

      // Call backend API with extended timeout for mobile devices  
      const controller = new AbortController();
      const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
      const timeoutMs = (isMobile || isSafari) ? 120000 : 60000; // 2 min for mobile/Safari, 1 min for others
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      console.log(`Processing on ${isMobile ? 'mobile' : 'desktop'} device${isSafari ? ' (Safari)' : ''} with ${timeoutMs/1000}s timeout`);
      console.log("User Agent:", userAgent);
      
      // Safari-compatible fetch request with explicit headers
      const fetchOptions: RequestInit = {
        method: "POST",
        body: formData,
        signal: controller.signal,
      };
      
      // Don't set Content-Type header - let browser set it for FormData
      // Safari can be sensitive to manually set Content-Type headers with FormData
      
      console.log("Making fetch request to /api/vectorize");
      const apiRes = await fetch("/api/vectorize", fetchOptions);
      
      clearTimeout(timeoutId);

      if (!apiRes.ok) {
        console.error("API request failed:", {
          status: apiRes.status,
          statusText: apiRes.statusText,
          headers: Object.fromEntries(apiRes.headers.entries()),
          userAgent: navigator.userAgent
        });
        
        const contentType = apiRes.headers.get("content-type");
        let errorMessage = `Failed to convert image (${apiRes.status}: ${apiRes.statusText})`;
        
        try {
          if (contentType && contentType.includes("application/json")) {
            const err = await apiRes.json();
            errorMessage = err.error || errorMessage;
          } else {
            const text = await apiRes.text();
            errorMessage = text || errorMessage;
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
        }
        
        setError(errorMessage);
        setIsProcessing(false);
        return;
      }

      const svgText = await apiRes.text();
      setSvgImage(`data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`);
      
      // Mark mobile optimization task as completed
      if (isMobile) {
        console.log("✅ Mobile conversion successful!");
      }
      
    } catch (err: any) {
      console.error("=== PROCESSING ERROR DETAILS ===");
      console.error("Error object:", err);
      console.error("Error name:", err.name);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      console.error("User agent:", navigator.userAgent);
      console.error("Network info:", navigator.connection || "Not available");
      
      // Mobile retry logic with progressive fallbacks
      if (isMobile && !err.isRetry) {
        console.log("🔄 Mobile conversion failed, trying with simpler settings...");
        
        try {
          // Retry with ultra-simple mobile settings
          const ultraSimpleSettings = {
            mode: "spline",
            colorMode: "binary", // Force black & white for reliability
            colorPrecision: 2, // Minimum precision
            cornerThreshold: 120, // Very high threshold
            filterSpeckle: 8, // Aggressive filtering
            spliceThreshold: 60,
          };
          
          // Create new FormData with ultra-simple settings
          const retryFormData = new FormData();
          const retryFileName = `mobile_retry_${Date.now()}.png`;
          const retryBlobWithType = new Blob([blob], { type: blob.type || 'image/png' });
          retryFormData.append("image", retryBlobWithType, retryFileName);
          
          Object.entries(ultraSimpleSettings).forEach(([key, value]) => {
            retryFormData.append(key, String(value));
          });
          retryFormData.append("preset", "bw"); // Force B&W preset for reliability
          
          console.log("Mobile retry with ultra-simple settings");
          
          const retryController = new AbortController();
          const retryTimeoutId = setTimeout(() => retryController.abort(), 180000); // 3 minutes for retry
          
          const retryApiRes = await fetch("/api/vectorize", {
            method: "POST",
            body: retryFormData,
            signal: retryController.signal,
          });
          
          clearTimeout(retryTimeoutId);
          
          if (retryApiRes.ok) {
            const retrySvgText = await retryApiRes.text();
            setSvgImage(`data:image/svg+xml;utf8,${encodeURIComponent(retrySvgText)}`);
            console.log("✅ Mobile retry conversion successful!");
            setIsProcessing(false);
            return; // Success! Exit early
          }
        } catch (retryErr) {
          console.error("Mobile retry also failed:", retryErr);
          // Continue to show original error
        }
      }
      
      let errorMessage = "Failed to process image";
      
      if (err.name === 'AbortError') {
        errorMessage = isMobile 
          ? "Request timed out on mobile. Try a smaller image or check your connection."
          : "Request timed out. Please try again.";
      } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        errorMessage = isMobile 
          ? "Network error on mobile. Check your connection and try again."
          : "Network error. Please check your connection.";
      } else if (err.message) {
        errorMessage = `${err.message} (${err.name || 'Unknown error'})`;
      } else {
        errorMessage = `Unknown error occurred (${err.name || typeof err})`;
      }
      
      // Add helpful mobile tip
      if (isMobile) {
        errorMessage += " [Mobile Tip: Try a smaller image or switch to 'Black & White' preset]";
      }
      
      setError(errorMessage);
    }

    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Use same validation as file input
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError("Please upload a valid image file (PNG, JPG, GIF, WebP, BMP)")
      return
    }

    // Check file size (limit to 10MB for mobile compatibility)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file too large. Please use an image smaller than 10MB")
      return
    }

    setError(null)
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string
        if (result) {
          setPngImage(result)
          setSvgImage(null)
        }
      } catch (err) {
        setError("Failed to read image file")
      }
    }
    
    reader.onerror = () => {
      setError("Failed to read image file")
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

  // SVG pan/zoom state - use scale like the left side
  const [svgScale, setSvgScale] = useState(1);
  const [svgOffset, setSvgOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{x: number, y: number} | null>(null);
  const offsetStart = useRef<{x: number, y: number} | null>(null);

  // Helper to parse and stringify viewBox
  function parseViewBox(vb: string) {
    const [x, y, w, h] = vb.split(' ').map(Number);
    return {x, y, w, h};
  }
  function stringifyViewBox({x, y, w, h}: {x: number, y: number, w: number, h: number}) {
    return `${x} ${y} ${w} ${h}`;
  }



  // Mouse events for panning
  const handleSVGMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStart.current = {x: e.clientX, y: e.clientY};
    offsetStart.current = { ...svgOffset };
  };
  const handleSVGMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart.current || !offsetStart.current) return;
    let newX = offsetStart.current.x + (e.clientX - dragStart.current.x);
    let newY = offsetStart.current.y + (e.clientY - dragStart.current.y);
    setSvgOffset({ x: newX, y: newY });
  };
  const handleSVGMouseUp = () => setIsDragging(false);
  // Zoom with Ctrl+Scroll
  const handleSVGWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setSvgScale((s) => clamp(s * (e.deltaY < 0 ? 1.1 : 0.9), 0.1, 10));
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
      {/* Steps 1-4 - Mobile: above images, Desktop: below images */}
      <div className="block md:hidden">
        <div className="w-full max-w-[400px] mx-auto">
          <div className="flex flex-col gap-2 mb-4 px-4 items-center">
            {/* Step 1: Upload */}
            <div className="flex items-center">
              <span className="font-semibold text-base mr-2 whitespace-nowrap w-16">Step 1:</span>
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
              {isMobileDevice && (
                <div className="ml-2 text-xs bg-blue-50 border border-blue-200 px-2 py-1 rounded">
                  📱 Mobile optimizations enabled: Auto-resize, simplified settings & retry logic
                </div>
              )}
              {error && <p className="text-red-500 ml-2 text-sm">{error}</p>}
            </div>
            {/* Step 2: Presets */}
            <div className="flex items-center">
              <span className="font-semibold text-base mr-2 whitespace-nowrap w-16">Step 2:</span>
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
            </div>
            {/* Step 3: Convert */}
            <div className="flex items-center">
              <span className="font-semibold text-base mr-2 whitespace-nowrap w-16">Step 3:</span>
              <div className="flex gap-2">
                <Button
                  onClick={processImage}
                  disabled={!pngImage || isProcessing}
                  className="h-9 px-3 text-sm bg-black text-white hover:bg-gray-900 focus:ring-black"
                >
                  {isProcessing ? "Converting..." : "Convert to SVG"}
                </Button>
                {/* Temporary debug button for mobile testing */}
                <Button
                  onClick={testUpload}
                  disabled={!pngImage}
                  className="h-9 px-3 text-sm bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                >
                  Test
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Images section */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-4 px-4 md:px-0">
        <div className="flex flex-col items-center w-full">
          <h2 className="text-base font-semibold mb-2 mt-2 text-center w-full">Original Image</h2>
          <Card className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] w-full border-dashed relative overflow-hidden">
            {pngImage ? (
              <>
                <div className="absolute top-3 right-4 flex gap-1 bg-white/80 rounded-full shadow p-0.5 z-10">
                  <button onClick={() => setImgScale((s) => Math.min(10, s * 1.1))} className="rounded-full p-0.5 hover:bg-gray-100"><ZoomIn className="w-4 h-4" /></button>
                  <button onClick={() => setImgScale((s) => Math.max(0.1, s * 0.9))} className="rounded-full p-0.5 hover:bg-gray-100"><ZoomOut className="w-4 h-4" /></button>
                  <button onClick={resetImgView} className="rounded-full p-0.5 hover:bg-gray-100"><RotateCcw className="w-4 h-4" /></button>
                </div>
                <div
                  ref={imgContainerRef}
                  className="relative w-full h-[250px] md:h-[300px] flex items-center justify-center cursor-grab"
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
                    className="max-w-full max-h-[250px] md:max-h-[300px] object-contain"
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
          <Card className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] w-full relative overflow-hidden">
                            {(svgImage || isProcessing) ? (
              <>
                <div className="absolute top-3 right-4 flex gap-1 bg-white/80 rounded-full shadow p-0.5 z-10">
                  <button onClick={() => setSvgScale(s => clamp(s * 1.1, 0.1, 10))} className="rounded-full p-0.5 hover:bg-gray-100"><ZoomIn className="w-4 h-4" /></button>
                  <button onClick={() => setSvgScale(s => clamp(s * 0.9, 0.1, 10))} className="rounded-full p-0.5 hover:bg-gray-100"><ZoomOut className="w-4 h-4" /></button>
                  <button onClick={() => {
                    setSvgScale(1);
                    setSvgOffset({ x: 0, y: 0 });
                  }} className="rounded-full p-0.5 hover:bg-gray-100"><RotateCcw className="w-4 h-4" /></button>
                </div>
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-t-gray-600 border-gray-200 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Converting to SVG...</p>
                  </div>
                ) : svgImage ? (
                  <div
                    ref={svgContainerRef}
                    className="relative w-full h-[250px] md:h-[300px] flex items-center justify-center cursor-grab"
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
                      className="max-w-full max-h-[250px] md:max-h-[300px] object-contain"
                      draggable={false}
                      style={{ 
                        pointerEvents: 'none',
                        transform: `translate(${svgOffset.x}px, ${svgOffset.y}px) scale(${svgScale})`,
                        transformOrigin: 'center',
                        display: 'block',
                        margin: '0 auto'
                      }}
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-500 text-lg">Download or copy the SVG paths</div>
            )}
          </Card>
          {/* Step 4: Download/Copy - Mobile only, below SVG output */}
          <div className="block md:hidden mt-4 w-full max-w-[400px] mx-auto">
            <div className="flex items-center gap-2 px-4 justify-center">
              <span className="font-semibold text-base mr-2 whitespace-nowrap w-16">Step 4:</span>
              <Button
                onClick={handleDownload}
                disabled={!svgImage}
                className={`h-9 flex items-center gap-2 px-3 text-sm bg-black text-white hover:bg-gray-900 focus:ring-black ${!svgImage ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed hover:bg-gray-200 hover:text-gray-400' : ''}`}
                aria-label="Download SVG"
              >
                <FileDown className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => {
                  if (!svgImage) return;
                  const svgTextRaw = decodeURIComponent(svgImage.replace(/^data:image\/svg\+xml;utf8,/, ""));
                  let svgOnly = svgTextRaw.match(/<svg[\s\S]*?<\/svg>/i)?.[0] || svgTextRaw;
                  svgOnly = svgOnly.replace(/<metadata[\s\S]*?<\/metadata>/i, "");
                  navigator.clipboard.writeText(svgOnly);
                }}
                disabled={!svgImage}
                className={`h-9 flex items-center gap-2 px-3 text-sm bg-black text-white hover:bg-gray-900 focus:ring-black ${!svgImage ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed hover:bg-gray-200 hover:text-gray-400' : ''}`}
                aria-label="Copy SVG"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Steps 1-4 in a row, now below the image/result cards, with wider container - Desktop only */}
      <div className="hidden md:block w-[710px] mx-auto">
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

      {/* Deployment Banner */}
      <DeploymentBanner />

      {/* How It Works and GitHub Buttons */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <a href="/info">
          <Button variant="outline" className="gap-2 text-sm">
            📚 How Does This Work?
          </Button>
        </a>
        <a href="https://github.com/nicholaspatten/SVGit4Me-local-only" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="gap-2 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub
          </Button>
        </a>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  )
}

// Helper to clamp a value between min and max
function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}
