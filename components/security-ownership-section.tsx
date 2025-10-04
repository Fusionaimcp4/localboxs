import React from "react"
import { Shield, Database, Download, Key, Globe, Lock } from "lucide-react"

export function SecurityOwnershipSection() {
  const securityFeatures = [
    {
      icon: Globe,
      title: "Data Residency",
      description: "Choose where your data lives. Host in Ethiopia, Kenya, or your preferred region.",
      benefits: ["Local data centers", "Compliance with local laws", "Reduced latency"]
    },
    {
      icon: Lock,
      title: "Access Control",
      description: "Least-privilege access. Role-based permissions. Audit logs for compliance.",
      benefits: ["Role-based permissions", "Multi-factor authentication", "Session management"]
    },
    {
      icon: Download,
      title: "Data Export",
      description: "Export conversations, contacts, and reports anytime. No vendor lock-in.",
      benefits: ["Full data portability", "Multiple export formats", "Automated backups"]
    },
    {
      icon: Key,
      title: "BYO LLM",
      description: "Optional - bring your own AI keys for maximum control.",
      benefits: ["Use your own AI models", "Custom AI configurations", "Enhanced privacy"]
    }
  ]

  return (
    <section className="w-full px-5 py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
            Security & Ownership
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Your data, your infrastructure, your control. Enterprise-grade security with complete transparency.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {securityFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
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

        {/* Compliance & Certifications */}
        <div className="bg-muted/30 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Enterprise Compliance
            </h3>
            <p className="text-muted-foreground">
              Built for enterprise requirements with industry-standard security practices.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Data Encryption</h4>
              <p className="text-sm text-muted-foreground">
                End-to-end encryption for all data in transit and at rest.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Audit Logs</h4>
              <p className="text-sm text-muted-foreground">
                Complete audit trail for compliance and security monitoring.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Access Management</h4>
              <p className="text-sm text-muted-foreground">
                Granular permissions and multi-factor authentication.
              </p>
            </div>
          </div>
        </div>

        {/* Data Ownership Promise */}
        <div className="mt-16 text-center">
          <div className="bg-primary/5 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Our Data Ownership Promise
            </h3>
            <p className="text-muted-foreground mb-6">
              You own your customer data. You control where it's stored. You can export it anytime. 
              No vendor lock-in, no hidden fees, no surprises.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-bold text-primary-foreground">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Your Infrastructure</h4>
                  <p className="text-sm text-muted-foreground">Deploy on your servers or choose our managed hosting.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-bold text-primary-foreground">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Your Data</h4>
                  <p className="text-sm text-muted-foreground">Complete control over customer conversations and data.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-bold text-primary-foreground">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Your Choice</h4>
                  <p className="text-sm text-muted-foreground">Export and leave anytime. No contracts, no penalties.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
