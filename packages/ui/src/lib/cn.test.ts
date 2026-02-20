import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  describe("basic merging", () => {
    it("should merge multiple class strings into one", () => {
      const result = cn("flex", "items-center", "gap-2");

      expect(result).toBe("flex items-center gap-2");
    });

    it("should return empty string when no arguments are given", () => {
      const result = cn();

      expect(result).toBe("");
    });

    it("should handle a single class string", () => {
      const result = cn("flex");

      expect(result).toBe("flex");
    });
  });

  describe("standard Tailwind conflict resolution", () => {
    it("should resolve padding conflict by keeping the last value", () => {
      const result = cn("p-4", "p-2");

      expect(result).toBe("p-2");
    });

    it("should resolve margin conflict by keeping the last value", () => {
      const result = cn("m-4", "m-1");

      expect(result).toBe("m-1");
    });

    it("should resolve text-size conflict by keeping the last value", () => {
      const result = cn("text-sm", "text-lg");

      expect(result).toBe("text-lg");
    });

    it("should resolve flex-direction conflict by keeping the last value", () => {
      const result = cn("flex-row", "flex-col");

      expect(result).toBe("flex-col");
    });
  });

  describe("custom border-color conflict resolution", () => {
    it("should resolve border-input vs border-danger-500 by keeping the last value", () => {
      const result = cn("border-input", "border-danger-500");

      expect(result).toBe("border-danger-500");
    });

    it("should resolve border-danger-500 vs border-input by keeping the last value", () => {
      const result = cn("border-danger-500", "border-input");

      expect(result).toBe("border-input");
    });

    it("should resolve border-input vs border-primary-500 by keeping the last value", () => {
      const result = cn("border-input", "border-primary-500");

      expect(result).toBe("border-primary-500");
    });
  });

  describe("custom text-color conflict resolution", () => {
    it("should resolve text-foreground vs text-danger-500 by keeping the last value", () => {
      const result = cn("text-foreground", "text-danger-500");

      expect(result).toBe("text-danger-500");
    });

    it("should resolve text-danger-500 vs text-foreground by keeping the last value", () => {
      const result = cn("text-danger-500", "text-foreground");

      expect(result).toBe("text-foreground");
    });

    it("should resolve text-muted vs text-primary-500 by keeping the last value", () => {
      const result = cn("text-muted", "text-primary-500");

      expect(result).toBe("text-primary-500");
    });
  });

  describe("custom bg-color conflict resolution", () => {
    it("should resolve bg-background vs bg-primary-500 by keeping the last value", () => {
      const result = cn("bg-background", "bg-primary-500");

      expect(result).toBe("bg-primary-500");
    });

    it("should resolve bg-primary-500 vs bg-background by keeping the last value", () => {
      const result = cn("bg-primary-500", "bg-background");

      expect(result).toBe("bg-background");
    });

    it("should resolve bg-surface vs bg-danger-500 by keeping the last value", () => {
      const result = cn("bg-surface", "bg-danger-500");

      expect(result).toBe("bg-danger-500");
    });
  });

  describe("custom ring-color conflict resolution", () => {
    it("should resolve ring-ring vs ring-danger-500 by keeping the last value", () => {
      const result = cn("ring-ring", "ring-danger-500");

      expect(result).toBe("ring-danger-500");
    });

    it("should resolve ring-danger-500 vs ring-ring by keeping the last value", () => {
      const result = cn("ring-danger-500", "ring-ring");

      expect(result).toBe("ring-ring");
    });

    it("should resolve ring-ring vs ring-primary-500 by keeping the last value", () => {
      const result = cn("ring-ring", "ring-primary-500");

      expect(result).toBe("ring-primary-500");
    });
  });

  describe("falsy value handling", () => {
    it("should ignore undefined values", () => {
      const result = cn("foo", undefined, "bar");

      expect(result).toBe("foo bar");
    });

    it("should ignore null values", () => {
      const result = cn("foo", null, "bar");

      expect(result).toBe("foo bar");
    });

    it("should ignore false values", () => {
      const result = cn("foo", false, "bar");

      expect(result).toBe("foo bar");
    });

    it("should ignore all falsy values in mixed input", () => {
      const result = cn("foo", undefined, null, false, "bar");

      expect(result).toBe("foo bar");
    });

    it("should handle conditional class pattern", () => {
      const isActive = false;
      const result = cn("base-class", isActive && "active-class");

      expect(result).toBe("base-class");
    });
  });
});