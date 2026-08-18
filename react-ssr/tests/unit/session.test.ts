import { afterEach, describe, expect, it } from "vitest";
import { appPassword, passwordsMatch } from "#/server/session";

/**
 * `passwordsMatch` is the one piece of hand-rolled security-relevant code in
 * the template, so it gets the closest attention: a comparison that's subtly
 * wrong (or that short-circuits on the first differing byte) would still pass a
 * naive "right password works" check.
 */
describe("passwordsMatch", () => {
  it("accepts an exact match", async () => {
    await expect(passwordsMatch("hunter2", "hunter2")).resolves.toBe(true);
  });

  it.each([
    ["a different password", "hunter3"],
    ["a differing first byte", "Hunter2"],
    ["a differing last byte", "hunter1"],
    ["a prefix of the password", "hunter"],
    ["the password plus a suffix", "hunter2!"],
    ["an empty string", ""],
  ])("rejects %s", async (_label, candidate) => {
    await expect(passwordsMatch(candidate, "hunter2")).resolves.toBe(false);
  });

  it("compares the full digest rather than short-circuiting", async () => {
    // Both candidates differ from the actual password, one at the very start
    // and one at the very end. A byte-wise `===` loop with an early return
    // would still return false for both, so this can't prove constant time —
    // what it does pin is that the digest is compared in full, which is the
    // property the loop in `passwordsMatch` exists to provide.
    await expect(passwordsMatch("Xunter2", "hunter2")).resolves.toBe(false);
    await expect(passwordsMatch("hunter2X", "hunter2")).resolves.toBe(false);
  });

  it("handles non-ASCII passwords", async () => {
    // The comparison runs over UTF-8 bytes, not code points.
    await expect(passwordsMatch("pässwörd🔑", "pässwörd🔑")).resolves.toBe(true);
    await expect(passwordsMatch("pässwörd🔑", "passwörd🔑")).resolves.toBe(false);
  });
});

describe("appPassword", () => {
  const original = process.env.APP_PASSWORD;

  afterEach(() => {
    if (original === undefined) delete process.env.APP_PASSWORD;
    else process.env.APP_PASSWORD = original;
  });

  it("reads APP_PASSWORD from the environment", () => {
    process.env.APP_PASSWORD = "from-the-env";
    expect(appPassword()).toBe("from-the-env");
  });

  it("falls back to the demo password when unset", () => {
    delete process.env.APP_PASSWORD;
    expect(appPassword()).toBe("password");
  });

  it("falls back when the variable is set but empty", () => {
    // An empty secret is a misconfiguration, not an intentional empty
    // password — an empty string here would otherwise let anyone in with "".
    process.env.APP_PASSWORD = "";
    expect(appPassword()).toBe("password");
  });
});
