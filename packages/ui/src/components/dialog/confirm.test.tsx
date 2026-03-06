import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { ConfirmProvider, useConfirm } from "./confirm-context";

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

// Test helper that renders a button to trigger confirm
function TestConsumer({
  options,
  onResult,
}: {
  options?: Parameters<ReturnType<typeof useConfirm>>[0];
  onResult?: (value: boolean) => void;
}) {
  const confirm = useConfirm();

  const handleClick = async () => {
    const result = await confirm(
      options ?? { title: "Are you sure?" },
    );
    onResult?.(result);
  };

  return (
    <button type="button" onClick={handleClick}>
      Trigger
    </button>
  );
}

describe("useConfirm", () => {
  it("throws error when used outside ConfirmProvider", () => {
    // Suppress React error boundary console.error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      "useConfirm must be used within <ConfirmProvider>",
    );

    spy.mockRestore();
  });

  it("renders dialog when confirm() is called", async () => {
    const user = userEvent.setup();

    render(
      <ConfirmProvider>
        <TestConsumer options={{ title: "Delete item?" }} />
      </ConfirmProvider>,
    );

    // Dialog should not be visible initially
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Trigger" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Delete item?" }),
    ).toBeInTheDocument();
  });

  it("resolves true when confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();

    render(
      <ConfirmProvider>
        <TestConsumer
          options={{ title: "Confirm?" }}
          onResult={onResult}
        />
      </ConfirmProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Trigger" }));
    await user.click(screen.getByRole("button", { name: "확인" }));

    expect(onResult).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("resolves false when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();

    render(
      <ConfirmProvider>
        <TestConsumer
          options={{ title: "Confirm?" }}
          onResult={onResult}
        />
      </ConfirmProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Trigger" }));
    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(onResult).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders custom confirmText and cancelText", async () => {
    const user = userEvent.setup();

    render(
      <ConfirmProvider>
        <TestConsumer
          options={{
            title: "Remove?",
            confirmText: "Yes, remove",
            cancelText: "No, keep",
          }}
        />
      </ConfirmProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Trigger" }));

    expect(
      screen.getByRole("button", { name: "Yes, remove" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "No, keep" }),
    ).toBeInTheDocument();
  });

  it("applies danger variant to confirm button", async () => {
    const user = userEvent.setup();

    render(
      <ConfirmProvider>
        <TestConsumer
          options={{
            title: "Delete?",
            confirmText: "Delete",
            variant: "danger",
          }}
        />
      </ConfirmProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Trigger" }));

    const confirmButton = screen.getByRole("button", { name: "Delete" });
    expect(confirmButton.className).toContain("bg-danger");
  });

  it("renders description when provided", async () => {
    const user = userEvent.setup();

    render(
      <ConfirmProvider>
        <TestConsumer
          options={{
            title: "Delete?",
            description: "This cannot be undone",
          }}
        />
      </ConfirmProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Trigger" }));

    expect(screen.getByText("This cannot be undone")).toBeInTheDocument();
  });
});