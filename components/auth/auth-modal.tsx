"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultTab = "signin" }: AuthModalProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-zinc-900 border border-zinc-800">
        <DialogTitle asChild>
          <VisuallyHidden>Authentication</VisuallyHidden>
        </DialogTitle>
        
        <div className="relative overflow-hidden rounded-lg">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent dark:from-primary/5" />
          
          <div className="relative p-6 pt-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2">
                <Image
                  src="/logos/boxlogo512x512.png"
                  alt="LocalBoxs Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-2xl font-semibold text-zinc-100">
                  LocalBoxs
                </span>
              </div>
            </div>

            <Tabs
              defaultValue={defaultTab}
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "signin" | "signup")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-800/50">
                <TabsTrigger 
                  value="signin"
                  className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 text-zinc-400"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 text-zinc-400"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="signin" className="mt-0">
                    <SignInForm onSuccess={onClose} />
                  </TabsContent>

                  <TabsContent value="signup" className="mt-0">
                    <SignUpForm onSuccess={onClose} />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}