import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Badge, badgeVariants } from "./badge";

describe("Badge", () => {
  it("renders children text correctly", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  describe("variants", () => {
    it("applies primary variant", () => {
      render(<Badge variant="primary">Primary</Badge>);
      const badge = screen.getByText("Primary");
      expect(badge.className).toContain("bg-primary");
    });

    it("applies primary variant when variant prop is not specified", () => {
      render(<Badge>No Variant</Badge>);
      const badge = screen.getByText("No Variant");
      expect(badge.className).toContain("bg-primary");
    });

    it("applies secondary variant", () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      const badge = screen.getByText("Secondary");
      expect(badge.className).toContain("bg-secondary");
    });

    it("applies outline variant", () => {
      render(<Badge variant="outline">Outline</Badge>);
      const badge = screen.getByText("Outline");
      expect(badge.className).toContain("text-foreground");
      expect(badge.className).toContain("border-input");
    });

    it("applies destructive variant", () => {
      render(<Badge variant="destructive">Destructive</Badge>);
      const badge = screen.getByText("Destructive");
      expect(badge.className).toContain("bg-destructive");
    });
  });

  it("merges custom className with default classes", () => {
    render(<Badge className="custom-class">Custom</Badge>);
    const badge = screen.getByText("Custom");
    expect(badge.className).toContain("custom-class");
    expect(badge.className).toContain("inline-flex");
  });

  it("renders JSX children correctly", () => {
    render(
      <Badge>
        <span data-testid="icon">*</span>
        Status
      </Badge>,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("passes additional HTML attributes", () => {
    render(<Badge data-testid="my-badge" aria-label="notification badge">Info</Badge>);
    const badge = screen.getByTestId("my-badge");
    expect(badge).toHaveAttribute("aria-label", "notification badge");
  });

  it("has correct displayName", () => {
    expect(Badge.displayName).toBe("Badge");
  });

  it("forwards ref to the element", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>Ref Badge</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it("ensures custom className merges correctly with CVA base classes", () => {
    render(<Badge className="ml-2 text-lg">Merged</Badge>);
    const badge = screen.getByText("Merged");
    expect(badge.className).toContain("ml-2");
    expect(badge.className).toContain("text-lg");
    expect(badge.className).toContain("inline-flex");
    expect(badge.className).toContain("items-center");
  });

  it("exports badgeVariants function", () => {
    expect(typeof badgeVariants).toBe("function");
  });
});
