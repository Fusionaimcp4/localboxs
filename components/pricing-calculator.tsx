"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, TrendingDown, Users, MessageSquare, Check, Star } from "lucide-react"
import { ContactModal } from "./contact-modal"

export function PricingCalculator() {
  const [agents, setAgents] = useState(5)
  const [conversations, setConversations] = useState(1000)
  const [currentProvider, setCurrentProvider] = useState("intercom")

  const calculateSavings = () => {
    let currentCost = 0
    let localboxsCost = 0

    // Current provider costs (monthly)
    switch (currentProvider) {
      case "intercom":
        currentCost = agents * 50 + conversations * 0.5 // $50/agent + $0.50/conversation
        break
      case "zendesk":
        currentCost = agents * 45 + conversations * 0.3 // $45/agent + $0.30/conversation
        break
      case "freshdesk":
        currentCost = agents * 35 + conversations * 0.2 // $35/agent + $0.20/conversation
        break
      default:
        currentCost = agents * 40 + conversations * 0.4
    }

    // LocalBoxs cost (estimated monthly)
    localboxsCost = 50 // Fixed monthly fee for managed hosting

    const savings = currentCost - localboxsCost
    const savingsPercentage = ((savings / currentCost) * 100).toFixed(0)

    return {
      currentCost: Math.round(currentCost),
      localboxsCost: Math.round(localboxsCost),
      savings: Math.round(savings),
      savingsPercentage
    }
  }

  const results = calculateSavings()

  return (
    <section className="w-full px-5 py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
            Calculate Your Savings
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            See how much you could save by switching from per-agent or per-resolution providers. 
            Most businesses save 60-80% on support costs.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Your Current Setup
              </CardTitle>
              <CardDescription>
                Enter your current support team size and conversation volume
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="agents">Number of Support Agents</Label>
                <Input
                  id="agents"
                  type="number"
                  value={agents}
                  onChange={(e) => setAgents(parseInt(e.target.value) || 0)}
                  min="1"
                  max="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conversations">Monthly Conversations</Label>
                <Input
                  id="conversations"
                  type="number"
                  value={conversations}
                  onChange={(e) => setConversations(parseInt(e.target.value) || 0)}
                  min="100"
                  step="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="provider">Current Provider</Label>
                <Select value={currentProvider} onValueChange={setCurrentProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intercom">Intercom</SelectItem>
                    <SelectItem value="zendesk">Zendesk</SelectItem>
                    <SelectItem value="freshdesk">Freshdesk</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-primary" />
                Your Savings
              </CardTitle>
              <CardDescription>
                Monthly cost comparison with LocalBoxs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Cost */}
              <div className="bg-destructive/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Provider</p>
                    <p className="text-2xl font-bold text-destructive">${results.currentCost}</p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{agents} agents</p>
                    <p className="text-sm text-muted-foreground">{conversations} conversations</p>
                  </div>
                </div>
              </div>

              {/* LocalBoxs Cost */}
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">With LocalBoxs</p>
                    <p className="text-2xl font-bold text-primary">${results.localboxsCost}</p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Unlimited agents</p>
                    <p className="text-sm text-muted-foreground">Unlimited conversations</p>
                  </div>
                </div>
              </div>

              {/* Savings */}
              <div className="bg-primary/10 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  ${results.savings}
                </div>
                <p className="text-lg font-semibold text-foreground mb-1">
                  Monthly Savings
                </p>
                <p className="text-sm text-muted-foreground">
                  {results.savingsPercentage}% cost reduction
                </p>
              </div>

              {/* Annual Savings */}
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  ${results.savings * 12}
                </div>
                <p className="text-sm text-muted-foreground">
                  Annual savings
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Summary */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-muted/30 rounded-xl">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Unlimited Agents</h3>
            <p className="text-sm text-muted-foreground">
              Add team members without increasing costs. Scale your support team freely.
            </p>
          </div>
          <div className="text-center p-6 bg-muted/30 rounded-xl">
            <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Unlimited Conversations</h3>
            <p className="text-sm text-muted-foreground">
              Handle as many customer conversations as you need. No per-message fees.
            </p>
          </div>
          <div className="text-center p-6 bg-muted/30 rounded-xl">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Predictable Costs</h3>
            <p className="text-sm text-muted-foreground">
              Fixed monthly fee. No surprises. Budget with confidence.
            </p>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mt-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
              Clear & Simple Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              All plans include unlimited agents and predictable costs. No per-seat or per-resolution fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                Unlimited agents
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                Unlimited AI responses
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                No per-resolution fees
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: "Managed (Site License)",
                description: "Fixed setup + monthly fee",
                price: "Contact for pricing",
                features: [
                  "Unlimited agents & AI responses",
                  "WhatsApp, chat, SMS included",
                  "Basic reports and dashboards",
                  "Email support",
                  "Standard integrations"
                ],
                popular: false
              },
              {
                name: "Managed + LLM",
                description: "Adds voice capabilities",
                price: "Contact for pricing",
                features: [
                  "Everything in Managed",
                  "CRM integrations",
                  "Outbound campaigns",
                  "SLA monitoring",
                  "AI orchestration",
                  "Priority support"
                ],
                popular: true
              },
              {
                name: "Self-Hosted",
                description: "One-time onboarding + optional support",
                price: "Contact for pricing",
                features: [
                  "Deploy on your infrastructure",
                  "Full data control",
                  "Optional support plans",
                  "Custom integrations",
                  "BYO LLM keys",
                  "Complete ownership"
                ],
                popular: false
              }
            ].map((tier, index) => (
              <Card 
                key={index} 
                className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : 'border-border'}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-semibold">{tier.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {tier.description}
                  </CardDescription>
                  <div className="text-3xl font-bold text-foreground mt-4">
                    {tier.price}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4">
                    <ContactModal>
                      <Button 
                        className={`w-full ${tier.popular ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/90'}`}
                      >
                        Request Quote
                      </Button>
                    </ContactModal>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-muted/30 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Ready to Start Saving?
            </h3>
            <p className="text-muted-foreground mb-6">
              Book a demo to see how LocalBoxs can transform your customer support while reducing costs.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Book a Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
