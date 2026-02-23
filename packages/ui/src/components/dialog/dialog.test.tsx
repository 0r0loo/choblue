import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./dialog";

// jsdom does not implement showModal/close on HTMLDialogElement
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.removeAttribute("open");
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DialogTrigger", () => {
  it("renders as a button element", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
      </Dialog>,
    );

    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
  });

  it("should open DialogContent when clicked", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>Content</DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should not show DialogContent in initial state", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>Content</DialogContent>
      </Dialog>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("DialogContent", () => {
  it("should render content when open is true", () => {
    render(
      <Dialog open>
        <DialogContent>Visible content</DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Visible content")).toBeInTheDocument();
  });

  it("should merge custom className with default classes", () => {
    render(
      <Dialog open>
        <DialogContent className="custom-dialog">Content</DialogContent>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("custom-dialog");
  });

  it("should forward ref to HTMLDialogElement", () => {
    const ref = createRef<HTMLDialogElement>();
    render(
      <Dialog open>
        <DialogContent ref={ref}>Ref content</DialogContent>
      </Dialog>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDialogElement);
  });
});

describe("DialogClose", () => {
  it("should close DialogContent when clicked", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render custom children", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogClose>
            <span>Dismiss</span>
          </DialogClose>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });
});

describe("DialogHeader", () => {
  it("should render children with default classes", () => {
    render(<DialogHeader>Header content</DialogHeader>);
    const header = screen.getByText("Header content");

    expect(header).toBeInTheDocument();
    expect(header.className).toContain("flex");
    expect(header.className).toContain("flex-col");
    expect(header.className).toContain("space-y-1.5");
  });

  it("has correct displayName", () => {
    expect(DialogHeader.displayName).toBe("DialogHeader");
  });
});

describe("DialogTitle", () => {
  it("should render as an h2 heading element", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>My Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    const title = screen.getByRole("heading", { level: 2 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("My Title");
  });

  it("should merge custom className with default classes", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle className="custom-title">Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    const title = screen.getByRole("heading", { level: 2 });
    expect(title.className).toContain("custom-title");
    expect(title.className).toContain("font-semibold");
  });

  it("has correct displayName", () => {
    expect(DialogTitle.displayName).toBe("DialogTitle");
  });
});

describe("DialogDescription", () => {
  it("should render as a p element with text-muted-foreground class", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogDescription>Some description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    const description = screen.getByText("Some description");
    expect(description.tagName).toBe("P");
    expect(description.className).toContain("text-muted-foreground");
  });

  it("has correct displayName", () => {
    expect(DialogDescription.displayName).toBe("DialogDescription");
  });
});

describe("DialogFooter", () => {
  it("should render children with default classes", () => {
    render(<DialogFooter>Footer content</DialogFooter>);
    const footer = screen.getByText("Footer content");

    expect(footer).toBeInTheDocument();
    expect(footer.className).toContain("flex");
  });

  it("has correct displayName", () => {
    expect(DialogFooter.displayName).toBe("DialogFooter");
  });
});

describe("Dialog compound composition", () => {
  it("should render full dialog flow: Trigger -> open -> Close -> closed", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description text</DialogDescription>
          </DialogHeader>
          <p>Dialog body content</p>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    // Initially closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Open via trigger
    await user.click(screen.getByRole("button", { name: "Open Dialog" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Dialog Title" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Dialog description text")).toBeInTheDocument();
    expect(screen.getByText("Dialog body content")).toBeInTheDocument();

    // Close via DialogClose
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should call onOpenChange with true when opened and false when closed", async () => {
    const handleOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Dialog onOpenChange={handleOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(handleOpenChange).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("should support controlled mode with open prop", async () => {
    const handleOpenChange = vi.fn();

    const { rerender } = render(
      <Dialog open={false} onOpenChange={handleOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>Controlled content</DialogContent>
      </Dialog>,
    );

    // Content is not visible when open is false
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Rerender with open=true to simulate external state change
    rerender(
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>Controlled content</DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Controlled content")).toBeInTheDocument();

    // Rerender with open=false
    rerender(
      <Dialog open={false} onOpenChange={handleOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>Controlled content</DialogContent>
      </Dialog>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
