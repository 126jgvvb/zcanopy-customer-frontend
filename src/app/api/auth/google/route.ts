import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;
  const scope = 'openid email profile';

  if (!googleClientId) {
    return NextResponse.json({ error: 'Google OAuth is not configured' }, { status: 500 });
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(googleAuthUrl);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return NextResponse.json({ error: 'Google OAuth is not configured' }, { status: 500 });
    }

    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const tokenInfo = await response.json();

    if (tokenInfo.error) {
      return NextResponse.json({ error: 'Invalid ID token' }, { status: 400 });
    }

    if (tokenInfo.aud !== googleClientId) {
      return NextResponse.json({ error: 'Invalid audience' }, { status: 400 });
    }

    return NextResponse.json({
      googleId: tokenInfo.sub,
      email: tokenInfo.email,
      firstName: tokenInfo.given_name || '',
      lastName: tokenInfo.family_name || '',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to verify Google token' }, { status: 500 });
  }
}
