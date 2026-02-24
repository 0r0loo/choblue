import { render, screen, act, renderHook, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  useToast,
} from "./toast";

// -- Test Helper --

function ToastWrapper({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
  );
}

function ToastHarnessWithButton() {
  const { toast } = useToast();
  return (
    <button
      type="button"
      onClick={() => toast({ title: "알림", description: "저장되었습니다" })}
    >
      토스트 추가
    </button>
  );
}

function MultiToastHarnessWithButton() {
  const { toast } = useToast();
  return (
    <>
      <button
        type="button"
        onClick={() => toast({ title: "첫 번째" })}
      >
        첫 번째 추가
      </button>
      <button
        type="button"
        onClick={() => toast({ title: "두 번째" })}
      >
        두 번째 추가
      </button>
    </>
  );
}

function DismissHarnessWithButton() {
  const { toast, dismiss } = useToast();
  let lastId: string;
  return (
    <>
      <button
        type="button"
        onClick={() => {
          const result = toast({ title: "제거 대상" });
          lastId = result.id;
        }}
      >
        추가
      </button>
      <button
        type="button"
        onClick={() => dismiss(lastId)}
      >
        제거
      </button>
    </>
  );
}

function DestructiveHarnessWithButton() {
  const { toast } = useToast();
  return (
    <button
      type="button"
      onClick={() =>
        toast({ title: "에러 발생", variant: "destructive" })
      }
    >
      에러 토스트
    </button>
  );
}

function AutoDismissHarnessWithButton({ duration }: { duration?: number }) {
  const { toast } = useToast();
  return (
    <button
      type="button"
      onClick={() =>
        toast({ title: "자동 제거", ...(duration !== undefined && { duration }) })
      }
    >
      자동 제거 추가
    </button>
  );
}

// -- Tests --

describe("ToastProvider + useToast", () => {
  it("should throw error when useToast is called outside ToastProvider", () => {
    // Arrange - suppress console.error from expected React error boundary
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Act & Assert
    expect(() => {
      renderHook(() => useToast());
    }).toThrow();

    consoleSpy.mockRestore();
  });

  it("should display toast when toast() is called", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <ToastWrapper>
        <ToastHarnessWithButton />
      </ToastWrapper>,
    );

    // Act
    await user.click(screen.getByRole("button", { name: "토스트 추가" }));

    // Assert
    expect(screen.getByText("알림")).toBeInTheDocument();
    expect(screen.getByText("저장되었습니다")).toBeInTheDocument();
  });

  it("should display multiple toasts simultaneously", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <ToastWrapper>
        <MultiToastHarnessWithButton />
      </ToastWrapper>,
    );

    // Act
    await user.click(screen.getByRole("button", { name: "첫 번째 추가" }));
    await user.click(screen.getByRole("button", { name: "두 번째 추가" }));

    // Assert
    expect(screen.getByText("첫 번째")).toBeInTheDocument();
    expect(screen.getByText("두 번째")).toBeInTheDocument();
  });

  it("should remove specific toast when dismiss() is called", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <ToastWrapper>
        <DismissHarnessWithButton />
      </ToastWrapper>,
    );

    // Act - add then dismiss
    await user.click(screen.getByRole("button", { name: "추가" }));
    expect(screen.getByText("제거 대상")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "제거" }));

    // Assert
    await waitFor(() => {
      expect(screen.queryByText("제거 대상")).not.toBeInTheDocument();
    });
  });
});

describe("Toast", () => {
  it("should render with default variant", () => {
    // Arrange & Act
    render(
      <ToastWrapper>
        <Toast>Default toast</Toast>
      </ToastWrapper>,
    );

    // Assert
    const toast = screen.getByText("Default toast");
    expect(toast).toBeInTheDocument();
  });

  it("should render with destructive variant", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <ToastWrapper>
        <DestructiveHarnessWithButton />
      </ToastWrapper>,
    );

    // Act
    await user.click(screen.getByRole("button", { name: "에러 토스트" }));

    // Assert
    const toastElement = screen.getByText("에러 발생").closest("[data-variant]");
    expect(toastElement).toHaveAttribute("data-variant", "destructive");
  });

  it("should display title text", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <ToastWrapper>
        <ToastHarnessWithButton />
      </ToastWrapper>,
    );

    // Act
    await user.click(screen.getByRole("button", { name: "토스트 추가" }));

    // Assert
    expect(screen.getByText("알림")).toBeInTheDocument();
  });

  it("should display description text", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <ToastWrapper>
        <ToastHarnessWithButton />
      </ToastWrapper>,
    );

    // Act
    await user.click(screen.getByRole("button", { name: "토스트 추가" }));

    // Assert
    expect(screen.getByText("저장되었습니다")).toBeInTheDocument();
  });

  it("should merge custom className", () => {
    // Arrange & Act
    render(
      <ToastWrapper>
        <Toast className="custom-toast">Styled toast</Toast>
      </ToastWrapper>,
    );

    // Assert
    const toast = screen.getByText("Styled toast");
    expect(toast.closest("[class*='custom-toast']")).not.toBeNull();
  });
});

describe("ToastTitle", () => {
  it("should render title text", () => {
    // Arrange & Act
    render(<ToastTitle>제목입니다</ToastTitle>);

    // Assert
    expect(screen.getByText("제목입니다")).toBeInTheDocument();
  });

  it("has correct displayName", () => {
    expect(ToastTitle.displayName).toBe("ToastTitle");
  });
});

describe("ToastDescription", () => {
  it("should render description text", () => {
    // Arrange & Act
    render(<ToastDescription>설명입니다</ToastDescription>);

    // Assert
    expect(screen.getByText("설명입니다")).toBeInTheDocument();
  });

  it("has correct displayName", () => {
    expect(ToastDescription.displayName).toBe("ToastDescription");
  });
});

describe("ToastClose", () => {
  it("should remove toast when clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <ToastWrapper>
        <ToastHarnessWithButton />
      </ToastWrapper>,
    );

    await user.click(screen.getByRole("button", { name: "토스트 추가" }));
    expect(screen.getByText("알림")).toBeInTheDocument();

    // Act - click the close button inside the toast
    const closeButton = screen.getByRole("button", { name: /닫기|close/i });
    await user.click(closeButton);

    // Assert
    await waitFor(() => {
      expect(screen.queryByText("알림")).not.toBeInTheDocument();
    });
  });

  it("has correct displayName", () => {
    expect(ToastClose.displayName).toBe("ToastClose");
  });
});

describe("ToastViewport", () => {
  it("should render with positioning classes", () => {
    // Arrange & Act
    const { container } = render(
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>,
    );

    // Assert - viewport should have fixed positioning
    const viewport = container.firstElementChild as HTMLElement;
    expect(viewport).not.toBeNull();
    expect(viewport.className).toContain("fixed");
  });

  it("has correct displayName", () => {
    expect(ToastViewport.displayName).toBe("ToastViewport");
  });
});

describe("Toast auto-dismiss", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should auto-dismiss after default duration (5000ms)", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastWrapper>
        <AutoDismissHarnessWithButton />
      </ToastWrapper>,
    );

    // Act - add toast
    await user.click(screen.getByRole("button", { name: "자동 제거 추가" }));
    expect(screen.getByText("자동 제거")).toBeInTheDocument();

    // Act - advance time past default duration
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Assert
    await waitFor(() => {
      expect(screen.queryByText("자동 제거")).not.toBeInTheDocument();
    });
  });

  it("should auto-dismiss after custom duration", async () => {
    // Arrange
    const customDuration = 2000;
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastWrapper>
        <AutoDismissHarnessWithButton duration={customDuration} />
      </ToastWrapper>,
    );

    // Act - add toast
    await user.click(screen.getByRole("button", { name: "자동 제거 추가" }));
    expect(screen.getByText("자동 제거")).toBeInTheDocument();

    // Should still be visible before custom duration
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(screen.getByText("자동 제거")).toBeInTheDocument();

    // Act - advance past custom duration
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Assert
    await waitFor(() => {
      expect(screen.queryByText("자동 제거")).not.toBeInTheDocument();
    });
  });
});

describe("Toast integration", () => {
  it("should render full flow: Provider -> toast() -> display -> Close -> remove", async () => {
    // Arrange
    const user = userEvent.setup();

    function FullFlowHarness() {
      const { toast } = useToast();
      return (
        <button
          type="button"
          onClick={() =>
            toast({
              title: "통합 테스트",
              description: "전체 흐름을 확인합니다",
            })
          }
        >
          토스트 생성
        </button>
      );
    }

    render(
      <ToastWrapper>
        <FullFlowHarness />
      </ToastWrapper>,
    );

    // Initially no toast
    expect(screen.queryByText("통합 테스트")).not.toBeInTheDocument();
    expect(screen.queryByText("전체 흐름을 확인합니다")).not.toBeInTheDocument();

    // Act - trigger toast
    await user.click(screen.getByRole("button", { name: "토스트 생성" }));

    // Assert - toast is displayed with title and description
    expect(screen.getByText("통합 테스트")).toBeInTheDocument();
    expect(screen.getByText("전체 흐름을 확인합니다")).toBeInTheDocument();

    // Act - close toast via close button
    const closeButton = screen.getByRole("button", { name: /닫기|close/i });
    await user.click(closeButton);

    // Assert - toast is removed
    await waitFor(() => {
      expect(screen.queryByText("통합 테스트")).not.toBeInTheDocument();
      expect(
        screen.queryByText("전체 흐름을 확인합니다"),
      ).not.toBeInTheDocument();
    });
  });
});
