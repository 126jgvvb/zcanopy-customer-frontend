import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const redirectUri = request.nextUrl.searchParams.get('redirect_uri') || '/customer';

  if (!code) {
    return NextResponse.redirect(new URL('/customer?error=google_auth_failed', request.url));
  }

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

  if (!googleClientId || !googleClientSecret) {
    return NextResponse.redirect(new URL('/customer?error=google_not_configured', request.url));
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return NextResponse.redirect(new URL('/customer?error=google_token_failed', request.url));
    }

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userInfoRes.json();

    const loginRes = await fetch(`${apiBase}/web/customer/login/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        googleId: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.given_name || '',
        lastName: userInfo.family_name || '',
      }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.success) {
      return NextResponse.redirect(new URL('/customer?error=google_login_failed', request.url));
    }

    const session = loginData.session || {};
    const sessionId = session.sessionToken || session.sessionId || loginData.token;
    const token = loginData.token;

    const response = NextResponse.redirect(new URL(redirectUri || '/customer', request.url));
    response.cookies.set('zcanopy_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    if (token) {
      response.cookies.set('zcanopy_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }
    return response;
  } catch {
    return NextResponse.redirect(new URL('/customer?error=google_auth_exception', request.url));
  }
}
