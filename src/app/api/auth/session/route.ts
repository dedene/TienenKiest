import { NextResponse } from 'next/server';

// This is a minimal implementation to prevent JSON parsing errors
// Return an empty session object that follows NextAuth's expected structure
export async function GET() {
  return NextResponse.json({
    user: null,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
}
