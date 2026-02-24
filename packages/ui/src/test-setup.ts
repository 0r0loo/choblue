import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Workaround: @testing-library/react checks globalThis.jest to detect
// fake timer environments. Without this, userEvent + vi.useFakeTimers() hangs.
// See: https://github.com/testing-library/user-event/issues/1115
(globalThis as Record<string, unknown>).jest = {
  ...((globalThis as Record<string, unknown>).jest as
    | Record<string, unknown>
    | undefined),
  advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
};
