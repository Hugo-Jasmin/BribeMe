import { describe, expect, it } from "vitest";
import { verifyImageSubmission } from "@/lib/openrouter";
import type { Campaign, Venue } from "@/lib/types";

const venue: Venue = {
  id: "ven_test",
  name: "Demo Cafe",
  slug: "demo-cafe",
  createdAt: new Date().toISOString(),
};

const campaign: Campaign = {
  id: "camp_test",
  venueId: venue.id,
  title: "Coffee with friends",
  challengePrompt: "Take a photo of your friend group with drinks.",
  rewardLabel: "Next round on us",
  budgetCents: null,
  maxRedemptions: null,
  validationThreshold: 80,
  startsAt: null,
  endsAt: null,
  status: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("verifyImageSubmission", () => {
  it("normalizes approval against the configured threshold", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";

    const result = await verifyImageSubmission({
      venue,
      campaign,
      imageDataUrl: "data:image/png;base64,abc",
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    approved: true,
                    qualityScore: 79,
                    taskMatchScore: 95,
                    safetyScore: 100,
                    decisionReason: "Good, but just below quality threshold.",
                    observations: ["People and drinks are visible."],
                    description: "A group of friends sitting together with drinks on the table.",
                    caption: "Round two at Demo Cafe.",
                    hashtags: ["#DemoCafe"],
                  }),
                },
              },
            ],
          }),
          { status: 200 },
        ),
    });

    expect(result.approved).toBe(false);
    expect(result.qualityScore).toBe(79);
  });
});
