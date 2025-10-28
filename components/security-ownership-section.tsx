"use client"

import React from "react"
import Image from "next/image"
import { Zap, MessageSquare, Users, Plug, ArrowRight } from "lucide-react"

export function SecurityOwnershipSection() {
  return (
    <section className="w-full px-5 py-20 md:py-32 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* 2x2 Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Card 1: Automate your work */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Automate your work in a snap
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6">
                Cut out repetitive, manual customer service tasks. Get a real boost with intuitive, easy-to-configure automation features available in the online ticketing software.
              </p>
              <a href="#" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 group">
                View automation features
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            
            {/* Chat UI Demo */}
            <div className="space-y-4 mt-8">
              {/* User message */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image src="/agent1.png" alt="Agent 1" width={32} height={32} className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3 max-w-[80%]">
                  <p className="text-sm text-slate-900 dark:text-white">Hi, I'd like to return my product.</p>
                </div>
              </div>
              
              {/* Automation buttons */}
              <div className="flex gap-3 px-11">
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">Auto reply</span>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">Status: Closed</span>
                </div>
              </div>
              
              {/* Bot response */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image src="/agent2.png" alt="Agent 2" width={32} height={32} className="w-full h-full object-cover" />
                </div>
                <div className="bg-blue-500 dark:bg-blue-600 rounded-2xl px-4 py-3 max-w-[80%]">
                  <p className="text-sm text-white">Hello! Here's a return form.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Manage all messages */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Manage all your customer messages
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6">
                Use robust messaging and ticket update features to stay in touch with your customers. Always give them the top-notch support they need and deserve.
              </p>
              <a href="#" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 group">
                View management features
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            
            {/* Channels & Tickets Demo */}
            <div className="mt-8 space-y-4">
              {/* Channels list */}
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                  <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Email</span>
                  <span className="text-xs bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center">2</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                  <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">Chat</span>
                  <span className="text-xs bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center">5</span>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-2">
                  <MessageSquare className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">SMS</span>
                  <span className="text-xs bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center">1</span>
                </div>
              </div>
              
              {/* Ticket list */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">All Tickets</p>
                <div className="space-y-2">
                  {["John monark", "Mark larceny", "Jane robertson"].map((name, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Pending</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Collaborate */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Collaborate with your teammates
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6">
                Create dedicated teams for a specific language, location, or skill set. Solve customer cases together and stay on top of things, no matter the time or distance.
              </p>
              <a href="#" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 group">
                View collaboration features
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            
            {/* Collaboration chat demo */}
            <div className="mt-8 space-y-4">
              {/* User query */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image src="/agent3.png" alt="Agent 3" width={32} height={32} className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3 max-w-[85%]">
                  <p className="text-sm text-slate-900 dark:text-white">Do you offer a discount for bulk orders?</p>
                </div>
              </div>
              
              {/* Team tagging */}
              <div className="flex items-center gap-2 px-11">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <Users className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">@Mark can you help?</span>
                </div>
              </div>
              
              {/* Team suggestion */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image src="/agent4.png" alt="Agent 4" width={32} height={32} className="w-full h-full object-cover" />
                </div>
                <div className="bg-indigo-500 dark:bg-indigo-600 rounded-2xl px-4 py-3 max-w-[85%]">
                  <p className="text-sm text-white">You can offer 20%.</p>
                </div>
              </div>
              
              {/* Final response */}
              <div className="bg-green-500 dark:bg-green-600 rounded-2xl px-4 py-3">
                <p className="text-sm text-white font-medium">Of course! It's 20% off for orders over $500.</p>
              </div>
            </div>
          </div>

          {/* Card 4: Integrate */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Integrate with everyday tools
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6">
                Discover your perfect apps, plugins, and integrations in the Marketplace to amplify LocalBoxs functionality and raise your team's productivity to new heights.
              </p>
              <a href="#" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 group">
                View marketplace
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            
            {/* Integration hub */}
            <div className="mt-8 relative h-80">
              {/* Central LocalBoxs logo - larger */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border-2 border-blue-500">
                  <Image
                    src="/localboxs_logo.png"
                    alt="LocalBoxs"
                    width={96}
                    height={96}
                    className="w-24 h-24 object-contain"
                  />
                </div>
              </div>
              
              {/* WordPress overlapping the top */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-16 h-16 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 shadow-lg z-20">
                <Image src="/wordpress.svg" alt="WordPress" width={32} height={32} className="w-8 h-8" />
              </div>
              
              {/* Left column - larger icons with proper spacing */}
              <div className="absolute top-16 left-6 w-14 h-14 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 shadow-lg z-10">
                <Image src="/slack.svg" alt="Slack" width={28} height={28} className="w-7 h-7" />
              </div>
              <div className="absolute top-40 left-8 w-14 h-14 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 shadow-lg z-0">
                <Image src="/zapier.svg" alt="Zapier" width={28} height={28} className="w-7 h-7" />
              </div>
              <div className="absolute bottom-24 left-6 w-14 h-14 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 shadow-lg z-10">
                <Image src="/email.svg" alt="Email" width={28} height={28} className="w-7 h-7" />
              </div>
              
              {/* Right column - larger icons, symmetrical with layered effect */}
              <div className="absolute top-16 right-6 w-14 h-14 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 shadow-lg z-10">
                <Image src="/messenger.svg" alt="Messenger" width={28} height={28} className="w-7 h-7" />
              </div>
              <div className="absolute top-40 right-8 w-14 h-14 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 shadow-lg z-0">
                <Image src="/wechat.svg" alt="WeChat" width={28} height={28} className="w-7 h-7" />
              </div>
              <div className="absolute bottom-24 right-6 w-14 h-14 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 shadow-lg z-10">
                <Image src="/whatsapp.svg" alt="WhatsApp" width={28} height={28} className="w-7 h-7" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
