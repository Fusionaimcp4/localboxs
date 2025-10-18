"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthModal } from "@/components/auth/auth-modal";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    const error = searchParams.get('error');
    
    // Handle messages/errors here if needed
  }, [searchParams]);

  return (
    <AuthModal 
      isOpen={true} 
      onClose={() => router.push('/')} 
      defaultTab="signin" 
    />
  );
}