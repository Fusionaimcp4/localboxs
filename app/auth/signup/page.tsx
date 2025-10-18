"use client";

import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth/auth-modal";

export default function SignUpPage() {
  const router = useRouter();

  return (
    <AuthModal 
      isOpen={true} 
      onClose={() => router.push('/')} 
      defaultTab="signup" 
    />
  );
}