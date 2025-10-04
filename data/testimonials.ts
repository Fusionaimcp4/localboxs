export const SECTION_HEADING = "Proven Outcomes";
export const SECTION_SUBHEAD =
  "95%+ customer questions answered automatically. Reduce SaaS spend by up to 80% vs Intercom/Zendesk.";

export type Testimonial = {
  quote: string;
  name: string;
  company: string;
  title?: string;
  avatar?: string; // local path in /public/avatars
  alt?: string;
};

export const NEW_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We reduced response time from 4 hours to 2 minutes. Customer satisfaction jumped 40%. Our team can finally focus on complex issues instead of answering the same questions repeatedly.",
    name: "Sarah M.",
    company: "Addis Ababa Tech",
    title: "Operations Manager",
    avatar: "/avatars/sarah-m.jpg",
    alt: "Portrait of Sarah M.",
  },
  {
    quote:
      "Finally stopped paying per agent. Added 5 team members without increasing costs. The WhatsApp integration alone increased our sales by 25%. Customers love the instant responses.",
    name: "Ahmed K.",
    company: "Ethiopian Logistics",
    title: "Support Director",
    avatar: "/avatars/ahmed-k.jpg",
    alt: "Portrait of Ahmed K.",
  },
  {
    quote:
      "WhatsApp integration alone increased our sales by 25%. Customers love the instant responses. We're handling 3x more conversations with the same team size.",
    name: "Meseret T.",
    company: "East Africa Commerce",
    title: "Sales Manager",
    avatar: "/avatars/meseret-t.jpg",
    alt: "Portrait of Meseret T.",
  },
  {
    quote:
      "The AI handles 90% of our customer questions instantly. Our team only deals with complex issues now. Response time went from hours to seconds.",
    name: "Dawit A.",
    company: "Nile Bank",
    title: "Customer Service Head",
    avatar: "/avatars/dawit-a.jpg",
    alt: "Portrait of Dawit A.",
  },
  {
    quote:
      "We were skeptical about a one-time setup fee, but it's paid for itself ten times over. Predictable costs and unlimited agents are exactly what a scaling startup needs.",
    name: "Priya Narayan",
    company: "Nimbus Commerce",
    title: "Engineering Manager",
    avatar: "/avatars/priya-narayan.jpg",
    alt: "Portrait of Priya Narayan",
  },
  {
    quote:
      "The seamless escalation from AI to a human agent is incredibly smooth. Our team can jump into conversations with full context, leading to faster, more effective resolutions.",
    name: "Marco Santoro",
    company: "Lumen Health",
    title: "Senior Developer",
    avatar: "/avatars/marco-santoro.jpg",
    alt: "Portrait of Marco Santoro",
  },
  {
    quote:
      "Our customer satisfaction scores have jumped 20 points since we implemented LocalBoxs. The AI is fast, accurate, and lets our human agents focus on the really tough problems.",
    name: "Vera Kowalski",
    company: "Bluepeak Logistics",
    title: "SRE Lead",
    avatar: "/avatars/vera-kowalski.jpg",
    alt: "Portrait of Vera Kowalski",
  },
  
]
