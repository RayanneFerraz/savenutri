import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_ANALYTICS_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { error: 'Analytics API URL not configured' },
      { status: 500 }
    );
  }

  const body = await req.text();

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  const data = await response.text();
  return new NextResponse(data, { status: response.status });
}
