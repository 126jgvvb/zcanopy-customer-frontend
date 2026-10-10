export type GuidedStepId = "location" | "type" | "budget" | "review";

export interface GuidedDraft {
  location: string;
  propertyType: string;
  minPrice: number | null;
  maxPrice: number | null;
}

export const emptyGuidedDraft: GuidedDraft = {
  location: "",
  propertyType: "",
  minPrice: null,
  maxPrice: null,
};

export const guidedSteps: { id: GuidedStepId; short: string; title: string; helper: string }[] = [
  {
    id: "location",
    short: "Where",
    title: "Let's select your new place...",
    helper: "we are always updating our locations to walk with you",
  },
  {
    id: "type",
    short: "Type",
    title: "What kind of property are you after?",
    helper: "We’ll use this to focus the results.",
  },
  {
    id: "budget",
    short: "Budget",
    title: "What price feels right?",
    helper: "We only show properties inside your range.",
  },
  {
    id: "review",
    short: "Review",
    title: "Here’s what we heard",
    helper: "Tweak anything before we show your properties.",
  },
];

export interface PriceBand {
  label: string;
  minPrice: number | null;
  maxPrice: number | null;
}

export const priceBands: PriceBand[] = [
  { label: "Under UGX 50M", minPrice: null, maxPrice: 50_000_000 },
  { label: "UGX 50M – 150M", minPrice: 50_000_000, maxPrice: 150_000_000 },
  { label: "UGX 150M – 500M", minPrice: 150_000_000, maxPrice: 500_000_000 },
  { label: "UGX 500M – 1B", minPrice: 500_000_000, maxPrice: 1_000_000_000 },
  { label: "Over UGX 1B", minPrice: 1_000_000_000, maxPrice: null },
];

export const noLimitBand: PriceBand = { label: "No limit", minPrice: null, maxPrice: null };

export function matchesBand(
  draft: GuidedDraft,
  band: PriceBand,
): boolean {
  return draft.minPrice === band.minPrice && draft.maxPrice === band.maxPrice;
}