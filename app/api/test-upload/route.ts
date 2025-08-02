import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  console.log("Test upload endpoint called");
  
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;
    
    if (!file) {
      return NextResponse.json({ 
        error: "No file provided",
        received: Array.from(formData.keys())
      }, { status: 400 });
    }
    
    // Just return file info without processing
    return NextResponse.json({
      success: true,
      fileInfo: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
      userAgent: request.headers.get('user-agent'),
      formDataKeys: Array.from(formData.keys())
    });
  } catch (error) {
    console.error("Test upload error:", error);
    return NextResponse.json({ 
      error: "Test upload failed", 
      details: String(error)
    }, { status: 500 });
  }
}