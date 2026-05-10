export type DemoScenario = {
  id: string;
  title: string;
  challenge: string;
  reward: string;
  image: string;
  patron: string;
  score: number;
  status: "Approved" | "Pending" | "Rejected";
  format: "Post" | "Story" | "Post + story";
  channels: string[];
  caption: string;
};

export const demoScenarios: DemoScenario[] = [
  {
    id: "friends-drinks",
    title: "Friends with drinks",
    challenge: "Take a clear photo of your group at the table with drinks visible.",
    reward: "Next round on us",
    image: "/demo/friend-group-drinks-realistic.png",
    patron: "Maya",
    score: 96,
    status: "Approved",
    format: "Post + story",
    channels: ["Instagram", "TikTok", "Facebook", "Google"],
    caption:
      "Good company, full glasses, and a table worth settling into at BribeMe Demo Cafe.",
  },
  {
    id: "coffee-croissant",
    title: "Coffee and croissant",
    challenge: "Take a photo of your coffee.",
    reward: "Free croissant",
    image: "/demo/takeaway-coffee.png",
    patron: "Leo",
    score: 91,
    status: "Approved",
    format: "Story",
    channels: ["Instagram", "Facebook", "Google"],
    caption:
      "Morning coffee, fresh pastry, and a reason to slow down before the day starts.",
  },
  {
    id: "cocktail-cheers",
    title: "Cocktail cheers",
    challenge: "Take a cheers photo with two drinks visible.",
    reward: "10% off your next visit",
    image: "/demo/cocktail-cheers.png",
    patron: "Nina",
    score: 94,
    status: "Approved",
    format: "Post",
    channels: ["Instagram", "TikTok", "Facebook", "Google"],
    caption:
      "A little cheers from the table. Drinks are poured and the evening is moving.",
  },
  {
    id: "brunch-spread",
    title: "Weekend brunch spread",
    challenge: "Photograph at least two brunch dishes and two drinks.",
    reward: "Free coffee next time",
    image: "/demo/brunch-spread.png",
    patron: "Ari",
    score: 89,
    status: "Approved",
    format: "Post + story",
    channels: ["Instagram", "Facebook", "Google"],
    caption:
      "Weekend brunch looks better when the table is full and nobody ordered the same thing.",
  },
  {
    id: "pizza-pull",
    title: "Pizza pull",
    challenge: "Capture a fresh pizza moment at the table.",
    reward: "Free garlic bread",
    image: "/demo/pizza-cheese-pull.png",
    patron: "Sam",
    score: 87,
    status: "Approved",
    format: "Story",
    channels: ["Instagram", "TikTok", "Facebook", "Google"],
    caption:
      "Fresh from the oven and already disappearing by the slice.",
  },
  {
    id: "birthday-dessert",
    title: "Birthday dessert",
    challenge: "Take a celebratory dessert photo with the table in frame.",
    reward: "Free dessert next visit",
    image: "/demo/birthday-dessert.png",
    patron: "Priya",
    score: 93,
    status: "Pending",
    format: "Post",
    channels: ["Instagram", "Facebook", "Google"],
    caption:
      "A small candle, a full table, and one more reason to celebrate here.",
  },
  {
    id: "pastry-counter",
    title: "Pastry pick",
    challenge: "Show your pastry choice with your coffee order.",
    reward: "Half-price pastry",
    image: "/demo/pastry-counter.png",
    patron: "Eli",
    score: 84,
    status: "Approved",
    format: "Story",
    channels: ["Instagram", "Facebook", "Google"],
    caption:
      "The pastry case made the decision difficult, so the table handled it properly.",
  },
  {
    id: "pasta-drop",
    title: "Pasta at the table",
    challenge: "Photograph a plated dish as it arrives at the table.",
    reward: "Free sparkling water",
    image: "/demo/pasta-table-service.png",
    patron: "Grace",
    score: 90,
    status: "Approved",
    format: "Post",
    channels: ["Instagram", "TikTok", "Facebook", "Google"],
    caption:
      "That first moment when the pasta lands and everyone pauses for a second.",
  },
  {
    id: "dessert-spoon",
    title: "Dessert first bite",
    challenge: "Capture the first bite of dessert with coffee nearby.",
    reward: "Free coffee next time",
    image: "/demo/dessert-spoon.png",
    patron: "Milo",
    score: 82,
    status: "Pending",
    format: "Story",
    channels: ["Instagram", "Facebook", "Google"],
    caption:
      "Dessert arrived, spoons appeared, and the table got very quiet.",
  },
  {
    id: "espresso-martinis",
    title: "Espresso martinis",
    challenge: "Take a bar photo with two espresso martinis visible.",
    reward: "Next round at happy hour",
    image: "/demo/bar-espresso-martinis.png",
    patron: "Tess",
    score: 78,
    status: "Rejected",
    format: "Post",
    channels: ["Instagram", "TikTok", "Facebook", "Google"],
    caption:
      "Evening service is on, and the espresso martinis are making their entrance.",
  },
];

export function getScenario(id: string) {
  return demoScenarios.find((scenario) => scenario.id === id) ?? demoScenarios[0];
}

const demoMediaPathMap = new Map(
  demoScenarios.flatMap((scenario) => {
    const extension = scenario.image.split(".").pop() ?? "png";
    const publicFilename = scenario.image.split("/").pop();
    const paths: Array<[string, string]> = [[`image/${scenario.id}.${extension}`, scenario.image]];

    if (publicFilename) {
      paths.push([`image/${publicFilename}`, scenario.image]);
    }

    return paths;
  }),
);

export function getDemoPublicPathForStoredMedia(mediaPath: string) {
  const normalized = mediaPath.replaceAll("\\", "/");
  if (normalized.startsWith("/demo/")) return normalized;

  return demoMediaPathMap.get(normalized) ?? null;
}
