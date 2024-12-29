"use server";

import { plans } from "~/config/plans";
import { ActionError, authenticatedAction } from "..";

export const getUserAction = authenticatedAction.action(
  async ({ ctx: { user } }) => {
    const planId = user.planId;
    const plan = plans.find((p) => p.id === planId);
    if (plan === undefined) {
      throw new ActionError("User plan not found");
    }
    return {
      ...user,
      plan,
    };
  },
);
