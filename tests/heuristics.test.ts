import { describe, it, expect } from "vitest";
import { analyzePostHeuristically } from "../src/lib/heuristics";
import testDataset from "./test-dataset.json";

describe("Heuristics & Rule-Based Classifier Engine", () => {
  it("should correctly identify high-intent paid web development gigs", () => {
    const paidPosts = testDataset.filter((d) => d.expectedIntent === "PAID");

    for (const post of paidPosts) {
      const result = analyzePostHeuristically(post.title, post.body);
      expect(result.isOpportunity).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(post.expectedMinScore);
      expect(result.commercialIntent).toBe("PAID");
      expect(result.budgetDetected).not.toBeNull();
      expect(result.outreachPitch.length).toBeGreaterThan(10);
    }
  });

  it("should correctly identify free / portfolio projects", () => {
    const freePost = testDataset.find((d) => d.id === "t3_free_001")!;
    const result = analyzePostHeuristically(freePost.title, freePost.body);
    expect(result.isOpportunity).toBe(true);
    expect(result.commercialIntent).toBe("FREE");
  });

  it("should correctly identify equity / co-founder opportunities", () => {
    const equityPost = testDataset.find((d) => d.id === "t3_equity_001")!;
    const result = analyzePostHeuristically(equityPost.title, equityPost.body);
    expect(result.isOpportunity).toBe(true);
    expect(result.commercialIntent).toBe("EQUITY");
  });

  it("should strictly reject job-seekers / [For Hire] posts", () => {
    const forHirePost = testDataset.find((d) => d.id === "t3_neg_forhire_001")!;
    const result = analyzePostHeuristically(forHirePost.title, forHirePost.body);
    expect(result.isOpportunity).toBe(false);
    expect(result.score).toBeLessThan(50);
  });

  it("should strictly reject beginner questions / tutorials / homework", () => {
    const tutorialPost = testDataset.find((d) => d.id === "t3_neg_tutorial_002")!;
    const result = analyzePostHeuristically(tutorialPost.title, tutorialPost.body);
    expect(result.isOpportunity).toBe(false);

    const homeworkPost = testDataset.find((d) => d.id === "t3_neg_homework_003")!;
    const result2 = analyzePostHeuristically(homeworkPost.title, homeworkPost.body);
    expect(result2.isOpportunity).toBe(false);
  });

  it("should detect technologies accurately", () => {
    const result = analyzePostHeuristically(
      "Need a React and Tailwind CSS developer for Stripe checkout store",
      "We are building a Shopify and Next.js backend with Supabase database."
    );
    expect(result.technologies).toContain("React");
    expect(result.technologies).toContain("Tailwind CSS");
    expect(result.technologies).toContain("Shopify");
    expect(result.technologies).toContain("Next.js");
    expect(result.technologies).toContain("Stripe");
    expect(result.technologies).toContain("Supabase");
  });
});
