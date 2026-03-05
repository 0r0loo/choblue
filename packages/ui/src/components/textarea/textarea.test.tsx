import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Textarea, textareaVariants } from "./textarea";

describe("Textarea", () => {
  it("renders a textarea element", () => {
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.className).toContain("border");
    expect(textarea.className).toContain("bg-background");
  });

  it("renders placeholder text", () => {
    render(<Textarea placeholder="Enter description..." />);
    expect(
      screen.getByPlaceholderText("Enter description..."),
    ).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");

    await user.type(textarea, "hello world");

    expect(textarea).toHaveValue("hello world");
  });

  it("triggers onChange handler", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Textarea onChange={handleChange} />);

    await user.type(screen.getByRole("textbox"), "a");

    expect(handleChange).toHaveBeenCalledOnce();
  });

  describe("sizes", () => {
    it("applies sm size", () => {
      render(<Textarea size="sm" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea.className).toContain("text-xs");
    });

    it("applies md size by default", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea.className).toContain("text-sm");
    });

    it("applies lg size", () => {
      render(<Textarea size="lg" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea.className).toContain("text-base");
    });
  });

  describe("aria-invalid", () => {
    it("should render aria-invalid attribute when aria-invalid is true", () => {
      render(<Textarea aria-invalid />);

      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    it("should include aria-invalid:border-danger in base classes", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");

      expect(textarea.className).toContain(
        "aria-invalid:border-danger",
      );
      expect(textarea.className).toContain("aria-invalid:ring-danger/20");
      expect(textarea.className).toContain("aria-invalid:text-danger");
    });

    it("should not have aria-invalid attribute by default", () => {
      render(<Textarea />);

      expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
    });
  });

  it("handles disabled state", () => {
    render(<Textarea disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("does not allow input when disabled", async () => {
    const user = userEvent.setup();
    render(<Textarea disabled />);
    const textarea = screen.getByRole("textbox");

    await user.type(textarea, "hello");

    expect(textarea).toHaveValue("");
  });

  it("forwards ref to textarea element", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("merges custom className with default classes", () => {
    render(<Textarea className="custom-class" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea.className).toContain("custom-class");
    expect(textarea.className).toContain("bg-background");
  });

  it("passes additional HTML attributes", () => {
    render(
      <Textarea data-testid="my-textarea" rows={5} cols={40} name="comment" />,
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("data-testid", "my-textarea");
    expect(textarea).toHaveAttribute("rows", "5");
    expect(textarea).toHaveAttribute("cols", "40");
    expect(textarea).toHaveAttribute("name", "comment");
  });

  it("has correct displayName", () => {
    expect(Textarea.displayName).toBe("Textarea");
  });

  it("exports textareaVariants", () => {
    expect(textareaVariants).toBeDefined();
    expect(typeof textareaVariants).toBe("function");
  });
});
