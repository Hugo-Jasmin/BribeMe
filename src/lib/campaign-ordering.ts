import type { Campaign } from "@/lib/types";

const PRIMARY_PATRON_CHALLENGE =
  "Take a clear photo of your group at the table with drinks visible.";

export function orderPatronCampaigns(campaigns: Campaign[]) {
  return [...campaigns].sort((first, second) => {
    const firstIsPrimary = first.challengePrompt === PRIMARY_PATRON_CHALLENGE;
    const secondIsPrimary = second.challengePrompt === PRIMARY_PATRON_CHALLENGE;

    if (firstIsPrimary === secondIsPrimary) return 0;
    return firstIsPrimary ? -1 : 1;
  });
}
