import { Button } from "@/components/ui/button"
import Link from "next/link"

export function PricingSection() {

  return (
    <section className="w-full px-5 py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* ROI Calculator */}
        <div className="bg-muted/30 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-semibold text-foreground mb-4">
            Calculate Your Savings
          </h3>
          <p className="text-muted-foreground mb-6">
            See how much you could save by switching from per-agent or per-resolution providers. 
            Most businesses save 60-80% on support costs.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">60-80%</div>
              <div className="text-sm text-muted-foreground">Cost Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-foreground mb-1">∞</div>
              <div className="text-sm text-muted-foreground">Agents & AI Usage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground mb-1">0</div>
              <div className="text-sm text-muted-foreground">Per-Seat Fees</div>
            </div>
          </div>
          <Link href="/cost-savings">
            <Button variant="outline" size="lg">
              Calculate Savings
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
