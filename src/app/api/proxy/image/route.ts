import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ error: 'Image key is required' }, { status: 400 });
    }

    // Construct the image URL
    const imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lionsinternationalco.com'}/express/images/serve/${key}`;
    
    // Forward all cookies and headers from the original request
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
        'User-Agent': request.headers.get('user-agent') || '',
        'Referer': request.headers.get('referer') || '',
      },
      credentials: 'include',
    });

    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: imageResponse.status });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}