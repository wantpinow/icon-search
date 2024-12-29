"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { plans, type Plan } from "~/config/plans";
import { toast } from "sonner";
import { useState } from "react";

export function PlansCard({ plan }: { plan: Plan }) {
  const formatPrice = (
    requests: number | undefined,
    pricePerRequest: number | undefined,
  ) => {
    if (!requests && !pricePerRequest) return "Custom";
    if (!pricePerRequest) return "Free";
    if (!requests) return `$${pricePerRequest.toFixed(3)}/request`;
    const total = requests * pricePerRequest;
    return `$${total.toFixed(2)}/month ($${pricePerRequest.toFixed(3)}/request)`;
  };
  const [selectedPlan, setSelectedPlan] = useState(plan.id);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available plans</CardTitle>
        <CardDescription>Select a plan to get started.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedPlan}
          onValueChange={(value) => setSelectedPlan(value as Plan["id"])}
          className="space-y-3"
        >
          {plans.map((p) => {
            return (
              <div key={p.id}>
                <RadioGroupItem
                  value={p.id}
                  id={p.id}
                  className="peer sr-only"
                  checked={p.id === selectedPlan}
                />
                <label
                  htmlFor={p.id}
                  className="flex cursor-pointer items-start space-x-4 rounded-lg border-2 p-4 hover:bg-accent peer-data-[state=checked]:border-primary"
                >
                  <Icon name={p.icon} className="mt-1 h-6 w-6 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <p className="font-medium leading-none">{p.name}</p>
                      <p className="text-sm font-medium text-primary">
                        {plan.isUnlimited
                          ? "Contact sales"
                          : formatPrice(p.monthlyRequests, p.pricePerRequest)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {p.description}
                    </p>
                    <p className="text-sm font-medium">
                      {p.isUnlimited
                        ? "Unlimited requests"
                        : p.monthlyRequests
                          ? `${p.monthlyRequests.toLocaleString()} requests/month`
                          : "Pay per request"}
                    </p>
                  </div>
                </label>
              </div>
            );
          })}
        </RadioGroup>

        <div className="flex justify-end">
          <Button
            onClick={() =>
              toast.error(
                "We haven't implemented this yet, please file an issue on GitHub if you're interested in this feature.",
              )
            }
          >
            Save Changes
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Your selected plan determines your monthly API request limits and
          features.
        </p>
      </CardContent>
    </Card>
  );
}
