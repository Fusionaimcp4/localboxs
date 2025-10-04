import React from "react"
import { ArrowRight, Bot, Network, Shield } from "lucide-react"
import Image from "next/image"

export function ValuePropositionSection() {
  return (
    <section className="w-full px-5 py-16 md:py-24 relative overflow-hidden -mt-20 md:-mt-32">
      {/* Subtle Backgrounds for continuity */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12">
        
        {/* Text Content (Left on large screens) */}
        <div className="lg:w-1/2 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary">Next-Generation Customer Experience</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            The AI-First Revolution Starts Here
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl lg:max-w-none mx-auto">
            Transform scattered communications into a unified intelligence platform. Where every conversation becomes data, every response becomes learning, and every customer becomes a champion.
          </p>
        </div>

        {/* Dashboard Screenshot (Right on large screens) */}
        <div className="lg:w-1/2 relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-xl border border-border/50 backdrop-blur-sm">
          <Image
            src="/images/nbgh.png"
            alt="LocalBoxs AI-first unified dashboard preview"
            fill
            className="object-cover object-top"
          />
          {/* Floating status indicators */}
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-xs text-foreground shadow-md border border-border/50">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span>AI Active: 95% Resolution</span>
          </div>
          <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-xs text-foreground shadow-md border border-border/50">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span>Human Handoff: Seamless</span>
          </div>
        </div>
      </div>

      {/* Transformation Section - kept below the split layout, adjusted margin */}
      <div className="max-w-7xl mx-auto relative z-10 mt-20 md:mt-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
            From Chaos to Intelligent Order
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            LocalBoxs transforms your scattered customer interactions into a streamlined, AI-powered workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Chaos Column */}
          <div className="bg-muted/20 p-8 rounded-2xl border border-border shadow-lg">
            <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <Network className="w-7 h-7 text-destructive" /> Scattered Communications
            </h3>
            <ul className="space-y-5 text-muted-foreground">
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Missed Opportunities</h4>
                  <p className="text-sm">Calls go unanswered, emails get lost, WhatsApp messages pile up. Every missed interaction is a lost customer.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Inconsistent Service</h4>
                  <p className="text-sm">Different agents, different answers. Customers get frustrated by repetitive questions and varying quality of support.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">High Operational Costs</h4>
                  <p className="text-sm">Paying per agent or per resolution leads to unpredictable, escalating expenses as your business grows.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Order Column */}
          <div className="bg-muted/20 p-8 rounded-2xl border border-border shadow-lg">
            <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <Bot className="w-7 h-7 text-primary" /> Unified Intelligence
            </h3>
            <ul className="space-y-5 text-muted-foreground">
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Instant, Consistent Replies</h4>
                  <p className="text-sm">AI handles 95% resolu common queries instantly, ensuring every customer gets a fast, accurate response.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">All Channels, One View</h4>
                  <p className="text-sm">Phone, SMS, WhatsApp, email, web chat—all conversations in a single, intuitive dashboard.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Predictable, Scalable Costs</h4>
                  <p className="text-sm">Fixed monthly fee, unlimited agents and AI. Grow your business without fear of escalating support costs.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}