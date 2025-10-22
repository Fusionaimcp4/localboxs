import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { consumeVerificationToken } from '@/lib/tokens';
import { FusionSubAccountService } from '@/lib/fusion-sub-accounts';

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
      // Update user verification status
      await prisma.user.update({
        where: { id: userId },
        data: {
          isVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      // Create Fusion sub-account for verified user
      try {
        // First check if sub-account already exists
        const existingSubAccount = await FusionSubAccountService.findExistingSubAccount(user.email);
        
        if (existingSubAccount) {
          // Link to existing sub-account
          await prisma.user.update({
            where: { id: userId },
            data: {
              fusionSubAccountId: String(existingSubAccount.id)
            }
          });
          
          console.log(`✅ Linked to existing Fusion sub-account for verified user ${user.id}: ${existingSubAccount.id}`);
        } else {
          // Create new sub-account
          const fusionSubAccount = await FusionSubAccountService.createSubAccount({
            id: user.id,
            email: user.email
          });

          // Update user with Fusion sub-account ID
          await prisma.user.update({
            where: { id: userId },
            data: {
              fusionSubAccountId: String(fusionSubAccount.id)
            }
          });

          console.log(`✅ Created Fusion sub-account for verified user ${user.id}: ${fusionSubAccount.id}`);
        }
      } catch (fusionError) {
        console.error('Failed to create/link Fusion sub-account for verified user:', fusionError);
        // Don't fail verification if Fusion sub-account creation fails
        // User is still verified, sub-account can be created later
      }

      return NextResponse.redirect(new URL('/auth/signin?message=Email successfully verified. You can now sign in.', request.url));
    } else {
      return NextResponse.redirect(new URL('/auth/signin?error=Invalid or expired verification token', request.url));
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/auth/signin?error=An unexpected error occurred during verification', request.url));
  }
}
