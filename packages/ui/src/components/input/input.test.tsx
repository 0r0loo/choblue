import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("has type text by default", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
  });

  describe("variants", () => {
    it("applies outline variant by default", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input.className).toContain("border");
      expect(input.className).toContain("bg-background");
    });

    it("applies filled variant", () => {
      render(<Input variant="filled" />);
      const input = screen.getByRole("textbox");
      expect(input.className).toContain("bg-surface");
    });
  });

  describe("sizes", () => {
    it("applies sm size", () => {
      render(<Input size="sm" />);
      const input = screen.getByRole("textbox");
      expect(input.className).toContain("h-8");
    });

    it("applies md size by default", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input.className).toContain("h-9");
    });

    it("applies lg size", () => {
      render(<Input size="lg" />);
      const input = screen.getByRole("textbox");
      expect(input.className).toContain("h-10");
    });
  });

  describe("status", () => {
    it("applies success status", () => {
      render(<Input status="success" />);
      const input = screen.getByRole("textbox");
      expect(input.className).toContain("border-success");
    });

    it("applies warning status", () => {
      render(<Input status="warning" />);
      const input = screen.getByRole("textbox");
      expect(input.className).toContain("border-warning");
    });

    it("applies error status", () => {
      render(<Input status="error" />);
      const input = screen.getByRole("textbox");
      expect(input.className).toContain("border-error");
    });

    it("sets aria-invalid when status is error", () => {
      render(<Input status="error" />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });
  });

  it("handles disabled state", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("does not allow input when disabled", async () => {
    const user = userEvent.setup();
    render(<Input disabled />);
    const input = screen.getByRole("textbox");

    await user.type(input, "hello");

    expect(input).toHaveValue("");
  });

  it("forwards ref to input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("merges custom className with default classes", () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("custom-class");
    expect(input.className).toContain("bg-background");
  });

  it("renders placeholder text", () => {
    render(<Input placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText("Enter text...")).toBeInTheDocument();
  });

  it("triggers onChange handler", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Input onChange={handleChange} />);

    await user.type(screen.getByRole("textbox"), "a");

    expect(handleChange).toHaveBeenCalledOnce();
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Input />);
    const input = screen.getByRole("textbox");

    await user.type(input, "hello world");

    expect(input).toHaveValue("hello world");
  });

  it("has correct displayName", () => {
    expect(Input.displayName).toBe("Input");
  });

  it("passes additional HTML attributes", () => {
    render(<Input aria-label="Username" name="username" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-label", "Username");
    expect(input).toHaveAttribute("name", "username");
  });
});