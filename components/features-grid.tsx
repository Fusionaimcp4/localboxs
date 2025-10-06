import React from "react"
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  Bot, 
  Database, 
  BarChart3, 
  Zap, 
  Search, 
  Shield, 
  Users 
} from "lucide-react"

export function FeaturesGrid() {
  const features = [
    {
      icon: Mail,
      title: "Web Chat",
      description: "Live chat widget",
      benefits: ["Pre-chat forms", "Chat history and transcripts", "File sharing"]
    },
    {
      icon: MessageSquare,
      title: "WhatsApp,Telegram,SMS",
      description: "Business WhatsApp,Telegram,SMS integration",
      benefits: ["SMS campaigns and responses", "Two-way messaging", "Media sharing"]
    },
    
    {
      icon: Mail,
      title: "Email Integration",
      description: "Unified inbox",
      benefits: ["Email templates", "Auto-responses", "Thread management"]
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description: "Instant responses to common questions",
      benefits: ["Smart routing to human agents", "Learning from team responses", "Multi-language support"]
    },
    {
      icon: Database,
      title: "CRM Connection",
      description: "Sync with your existing CRM",
      benefits: ["Customer history and notes", "Lead tracking and scoring", "Contact synchronization"]
    },
    {
      icon: BarChart3,
      title: "Dashboards & Reports",
      description: "Real-time conversation metrics",
      benefits: ["Agent performance tracking", "Customer satisfaction scores", "Custom analytics"]
    },
    {
      icon: Zap,
      title: "Automation",
      description: "Workflow automation",
      benefits: ["SLA alerts and escalations", "Scheduled follow-ups", "Custom triggers"]
    },
    {
      icon: Search,
      title: "Knowledge Base",
      description: "Centralized information hub",
      benefits: ["AI-powered search", "Self-service options", "Content management"]
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Data encryption and audit logs",
      benefits: ["Export capabilities", "Role-based access", "Compliance reporting"]
    }
  ]

  return (
    <section className="w-full px-5 py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
            What You Get
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Everything you need to handle customer conversations professionally. 
            All channels, all features, unlimited usage.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/20"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-1">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-muted/30 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              All Features Included
            </h3>
            <p className="text-muted-foreground mb-6">
              No add-ons. No hidden fees. No per-feature charges. Everything you need to run professional customer support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                Unlimited agents
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bot className="w-4 h-4" />
                Unlimited AI responses
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                Full data ownership
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
