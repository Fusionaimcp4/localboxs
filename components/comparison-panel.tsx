import React from "react"
import { Check, X } from "lucide-react"
import Image from "next/image"

export function ComparisonPanel() {
  const comparisonData = [
    {
      feature: "Pricing Model",
      localboxs: "Fixed setup + LLM",
      perAgent: "Per agent monthly",
      perResolution: "Per conversation"
    },
    {
      feature: "Channels",
      localboxs: "All included",
      perAgent: "Limited",
      perResolution: "Limited"
    },
    {
      feature: "AI Automation",
      localboxs: "Unlimited usage",
      perAgent: "Limited responses",
      perResolution: "Pay per use"
    },
    {
      feature: "Follow-up Automation",
      localboxs: "Built-in",
      perAgent: "Extra cost",
      perResolution: "Not available"
    },
    {
      feature: "CRM Approach",
      localboxs: "Flexible integration",
      perAgent: "Proprietary",
      perResolution: "Limited"
    },
    {
      feature: "Ownership",
      localboxs: "Your data, your choice",
      perAgent: "Vendor locked",
      perResolution: "Vendor locked"
    },
    {
      feature: "Scaling Cost",
      localboxs: "Predictable",
      perAgent: "Grows with team",
      perResolution: "Grows with volume"
    },
    {
      feature: "Lock-in",
      localboxs: "None",
      perAgent: "High",
      perResolution: "High"
    }
  ]

  return (
    <section className="w-full px-5 py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
            LocalBoxs vs. Traditional Providers
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            See how our model differs from per-agent and per-resolution providers. 
            Focus on outcomes, not just features.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="bg-muted/50 grid grid-cols-4 gap-4 p-6 font-semibold text-foreground">
            <div className="text-left">Feature</div>
            <div className="text-center bg-primary/10 rounded-lg py-2">LocalBoxs</div>
            <div className="text-center">Per-Agent Providers</div>
            <div className="text-center">Per-Resolution Providers</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-border">
            {comparisonData.map((row, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-6 hover:bg-muted/20 transition-colors">
                <div className="text-left font-medium text-foreground">
                  {row.feature}
                </div>
                <div className="text-center bg-primary/5 rounded-lg py-2 px-4">
                  <span className="text-primary font-medium">{row.localboxs}</span>
                </div>
                <div className="text-center text-muted-foreground">
                  {row.perAgent}
                </div>
                <div className="text-center text-muted-foreground">
                  {row.perResolution}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Summary */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-primary/5 rounded-xl">
          <div className="relative w-80 h-60 rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/images/localboxs3.png"
                alt="LocalBoxs platform - Multi-channel customer support interface"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Predictable Costs</h3>
            <p className="text-sm text-muted-foreground">
              Fixed monthly fee. No surprises. Scale your team without scaling your costs.
            </p>
          </div>
          <div className="text-center p-6 bg-secondary/10 rounded-xl">
          <div className="relative w-80 h-60 rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/images/localboxs1.png"
                alt="LocalBoxs platform - Multi-channel customer support interface"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">All Channels Included</h3>
            <p className="text-sm text-muted-foreground">
              Phone, WhatsApp, email, chat. Everything you need, nothing you don't.
            </p>
          </div>
          <div className="text-center p-6 bg-muted/20 rounded-xl">
          <div className="relative w-80 h-60 rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/images/localboxs2.png"
                alt="LocalBoxs platform - Multi-channel customer support interface"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Vendor Lock-in</h3>
            <p className="text-sm text-muted-foreground">
              Export your data anytime. Host on your infrastructure. Own your customer relationships.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
