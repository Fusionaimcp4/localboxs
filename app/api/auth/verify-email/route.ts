import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { consumeVerificationToken } from '@/lib/tokens';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const userId = searchParams.get('uid');

  if (!token || !userId) {
    return NextResponse.redirect(new URL('/auth/signin?error=Invalid verification link', request.url));
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.redirect(new URL('/auth/signin?error=User not found', request.url));
    }

    const isTokenValid = await consumeVerificationToken(userId, token, 'email_verify');

    if (isTokenValid) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
      return NextResponse.redirect(new URL('/auth/signin?message=Email successfully verified. You can now sign in.', request.url));
    } else {
      return NextResponse.redirect(new URL('/auth/signin?error=Invalid or expired verification token', request.url));
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/auth/signin?error=An unexpected error occurred during verification', request.url));
  }
}
