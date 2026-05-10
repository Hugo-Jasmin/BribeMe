import { describe, expect, it } from "vitest";
import { getDemoPublicPathForStoredMedia } from "@/lib/demo-scenarios";

describe("demo media paths", () => {
  it("maps seeded upload paths to public demo assets", () => {
    expect(getDemoPublicPathForStoredMedia("/demo/dessert-spoon.png")).toBe(
      "/demo/dessert-spoon.png",
    );
    expect(getDemoPublicPathForStoredMedia("image/dessert-spoon.png")).toBe(
      "/demo/dessert-spoon.png",
    );
    expect(getDemoPublicPathForStoredMedia("image/friends-drinks.png")).toBe(
      "/demo/friend-group-drinks-realistic.png",
    );
    expect(getDemoPublicPathForStoredMedia("image/bar-espresso-martinis.png")).toBe(
      "/demo/bar-espresso-martinis.png",
    );
  });
});
