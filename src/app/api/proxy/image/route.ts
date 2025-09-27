import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ error: 'Image key is required' }, { status: 400 });
    }

    // Get the API base URL, prioritizing production URL
    const apiBaseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://lionsinternationalco.com'
      : (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lionsinternationalco.com');

    // Construct the image URL
    const imageUrl = `${apiBaseUrl}/express/images/serve/${key}`;
    
    console.log('Proxying image request:', {
      key,
      imageUrl,
      apiBaseUrl,
      environment: process.env.NODE_ENV,
      hasCookies: !!request.headers.get('cookie')
    });
    
    // Forward all cookies and headers from the original request
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
        'User-Agent': request.headers.get('user-agent') || '',
        'Referer': request.headers.get('referer') || '',
      },
      credentials: 'include',
    });

    console.log('Image response status:', imageResponse.status, imageResponse.statusText);

    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', {
        status: imageResponse.status,
        statusText: imageResponse.statusText,
        url: imageUrl
      });
      return NextResponse.json({ 
        error: 'Failed to fetch image', 
        status: imageResponse.status,
        url: imageUrl 
      }, { status: imageResponse.status });
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
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}