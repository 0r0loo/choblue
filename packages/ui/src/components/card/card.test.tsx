import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";

describe("Card", () => {
  it("renders children correctly", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("merges custom className with default classes", () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByText("Content");
    expect(card.className).toContain("custom-class");
    expect(card.className).toContain("rounded-xl");
    expect(card.className).toContain("border");
  });

  it("forwards ref to HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref}>Ref Card</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("passes additional HTML attributes", () => {
    render(
      <Card data-testid="my-card" aria-label="main card">
        Content
      </Card>,
    );
    const card = screen.getByTestId("my-card");
    expect(card).toHaveAttribute("aria-label", "main card");
  });

  it("has correct displayName", () => {
    expect(Card.displayName).toBe("Card");
  });
});

describe("CardHeader", () => {
  it("renders children with default classes", () => {
    render(<CardHeader>Header content</CardHeader>);
    const header = screen.getByText("Header content");
    expect(header).toBeInTheDocument();
    expect(header.className).toContain("flex");
    expect(header.className).toContain("flex-col");
    expect(header.className).toContain("space-y-1.5");
    expect(header.className).toContain("p-6");
  });

  it("merges custom className with default classes", () => {
    render(<CardHeader className="custom-header">Header</CardHeader>);
    const header = screen.getByText("Header");
    expect(header.className).toContain("custom-header");
    expect(header.className).toContain("flex");
    expect(header.className).toContain("p-6");
  });

  it("has correct displayName", () => {
    expect(CardHeader.displayName).toBe("CardHeader");
  });
});

describe("CardTitle", () => {
  it("renders as an h3 heading element", () => {
    render(<CardTitle>Title text</CardTitle>);
    const title = screen.getByRole("heading", { level: 3 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("Title text");
  });

  it("merges custom className with default classes", () => {
    render(<CardTitle className="custom-title">Title</CardTitle>);
    const title = screen.getByRole("heading", { level: 3 });
    expect(title.className).toContain("custom-title");
    expect(title.className).toContain("font-semibold");
  });

  it("has correct displayName", () => {
    expect(CardTitle.displayName).toBe("CardTitle");
  });
});

describe("CardDescription", () => {
  it("renders as a p element with default classes", () => {
    render(<CardDescription>Description text</CardDescription>);
    const description = screen.getByText("Description text");
    expect(description.tagName).toBe("P");
    expect(description.className).toContain("text-sm");
    expect(description.className).toContain("text-muted-foreground");
  });

  it("has correct displayName", () => {
    expect(CardDescription.displayName).toBe("CardDescription");
  });
});

describe("CardContent", () => {
  it("renders children with default classes", () => {
    render(<CardContent>Main content</CardContent>);
    const content = screen.getByText("Main content");
    expect(content).toBeInTheDocument();
    expect(content.className).toContain("p-6");
    expect(content.className).toContain("pt-0");
  });

  it("has correct displayName", () => {
    expect(CardContent.displayName).toBe("CardContent");
  });
});

describe("CardFooter", () => {
  it("renders children with default classes", () => {
    render(<CardFooter>Footer content</CardFooter>);
    const footer = screen.getByText("Footer content");
    expect(footer).toBeInTheDocument();
    expect(footer.className).toContain("flex");
    expect(footer.className).toContain("items-center");
    expect(footer.className).toContain("p-6");
    expect(footer.className).toContain("pt-0");
  });

  it("has correct displayName", () => {
    expect(CardFooter.displayName).toBe("CardFooter");
  });
});

describe("Card compound composition", () => {
  it("renders full card composition with all sub-components", () => {
    render(
      <Card data-testid="compound-card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card body content</CardContent>
        <CardFooter>Card footer content</CardFooter>
      </Card>,
    );

    const card = screen.getByTestId("compound-card");
    expect(card).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Card Title" })).toBeInTheDocument();
    expect(screen.getByText("Card Description")).toBeInTheDocument();
    expect(screen.getByText("Card body content")).toBeInTheDocument();
    expect(screen.getByText("Card footer content")).toBeInTheDocument();
  });
});
