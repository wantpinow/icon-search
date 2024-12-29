import type { IconName } from "~/components/ui/icon";

export const PLAN_IDS = ["free", "pro", "enterprise"] as const;

export interface Plan {
  id: (typeof PLAN_IDS)[number];
  name: string;
  monthlyRequests?: number;
  pricePerRequest?: number;
  description: string;
  isUnlimited: boolean;
  icon: IconName;
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free Tier",
    monthlyRequests: 100,
    description: "Perfect for testing and small projects.",
    isUnlimited: false,
    icon: "Zap",
  },
  {
    id: "pro",
    name: "Pro Plan",
    pricePerRequest: 0.001,
    description: "For growing applications and teams.",
    isUnlimited: false,
    icon: "Rocket",
  },
  {
    id: "enterprise",
    name: "Unlimited Plan",
    description: "For large enterprises and high-volume applications.",
    isUnlimited: true,
    icon: "DatabaseZap",
  },
] as const;
