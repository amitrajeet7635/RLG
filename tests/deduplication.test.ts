import { describe, it, expect } from "vitest";
import { generateContentHash } from "../src/lib/deduplication";

describe("Deduplication Engine", () => {
  it("should generate deterministic SHA-256 hash for identical titles and bodies", () => {
    const hash1 = generateContentHash("Need a website", "Budget is $500");
    const hash2 = generateContentHash("need a website", "budget is $500");
    const hash3 = generateContentHash("  Need A Website  ", "  Budget is $500  ");

    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
    expect(hash1).toHaveLength(64); // SHA-256 hex string length
  });

  it("should generate distinct hashes for different posts", () => {
    const hash1 = generateContentHash("Need a Shopify store", "Budget $1000");
    const hash2 = generateContentHash("Need a WordPress site", "Budget $1000");

    expect(hash1).not.toBe(hash2);
  });
});
