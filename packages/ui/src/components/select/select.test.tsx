import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderSelect(
  props: Partial<React.ComponentProps<typeof Select>> = {},
) {
  return render(
    <Select {...props}>
      <SelectTrigger>
        <SelectValue placeholder="선택하세요" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="coffee">커피</SelectItem>
        <SelectItem value="tea">차</SelectItem>
        <SelectItem value="juice">주스</SelectItem>
      </SelectContent>
    </Select>,
  );
}

// ---------------------------------------------------------------------------
// 렌더링
// ---------------------------------------------------------------------------

describe("Select", () => {
  describe("렌더링", () => {
    it("should render SelectTrigger as a button element", () => {
      renderSelect();

      const trigger = screen.getByRole("button");

      expect(trigger).toBeInTheDocument();
    });

    it("should not display SelectContent in initial state", () => {
      renderSelect();

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should display placeholder in SelectValue when no value is selected", () => {
      renderSelect();

      const trigger = screen.getByRole("button");

      expect(trigger).toHaveTextContent("선택하세요");
    });

    it("should display the matching SelectItem text in SelectValue when defaultValue is set", () => {
      renderSelect({ defaultValue: "coffee" });

      const trigger = screen.getByRole("button");

      expect(trigger).toHaveTextContent("커피");
    });
  });

  // ---------------------------------------------------------------------------
  // 드롭다운 열기/닫기
  // ---------------------------------------------------------------------------

  describe("드롭다운 열기/닫기", () => {
    it("should show SelectContent with listbox role when SelectTrigger is clicked", async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("should render SelectItems with option role", async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole("button"));
      const options = screen.getAllByRole("option");

      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent("커피");
      expect(options[1]).toHaveTextContent("차");
      expect(options[2]).toHaveTextContent("주스");
    });

    it("should close SelectContent when SelectTrigger is clicked again while open", async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByRole("button");

      await user.click(trigger);
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      await user.click(trigger);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should close SelectContent when a SelectItem is clicked", async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("option", { name: "차" }));

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should close SelectContent when Escape key is pressed", async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole("button"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      await user.keyboard("{Escape}");

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 값 선택
  // ---------------------------------------------------------------------------

  describe("값 선택", () => {
    it("should update SelectValue when a SelectItem is clicked", async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("option", { name: "차" }));

      expect(screen.getByRole("button")).toHaveTextContent("차");
    });

    it("should call onValueChange callback when a SelectItem is clicked", async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();
      renderSelect({ onValueChange: handleValueChange });

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("option", { name: "주스" }));

      expect(handleValueChange).toHaveBeenCalledOnce();
      expect(handleValueChange).toHaveBeenCalledWith("juice");
    });

    it("should change value when selecting a different item after initial selection", async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();
      renderSelect({ onValueChange: handleValueChange });

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("option", { name: "커피" }));
      expect(screen.getByRole("button")).toHaveTextContent("커피");

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("option", { name: "주스" }));
      expect(screen.getByRole("button")).toHaveTextContent("주스");

      expect(handleValueChange).toHaveBeenCalledTimes(2);
      expect(handleValueChange).toHaveBeenLastCalledWith("juice");
    });
  });

  // ---------------------------------------------------------------------------
  // 제어/비제어 모드
  // ---------------------------------------------------------------------------

  describe("제어/비제어 모드", () => {
    it("should use defaultValue as initial value and manage state internally in uncontrolled mode", async () => {
      const user = userEvent.setup();
      renderSelect({ defaultValue: "tea" });

      expect(screen.getByRole("button")).toHaveTextContent("차");

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("option", { name: "커피" }));

      expect(screen.getByRole("button")).toHaveTextContent("커피");
    });

    it("should reflect external value prop in controlled mode", () => {
      const { rerender } = render(
        <Select value="coffee">
          <SelectTrigger>
            <SelectValue placeholder="선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="coffee">커피</SelectItem>
            <SelectItem value="tea">차</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByRole("button")).toHaveTextContent("커피");

      rerender(
        <Select value="tea">
          <SelectTrigger>
            <SelectValue placeholder="선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="coffee">커피</SelectItem>
            <SelectItem value="tea">차</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByRole("button")).toHaveTextContent("차");
    });

    it("should call onValueChange in controlled mode when an item is selected", async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Select value="coffee" onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="coffee">커피</SelectItem>
            <SelectItem value="tea">차</SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("option", { name: "차" }));

      expect(handleValueChange).toHaveBeenCalledOnce();
      expect(handleValueChange).toHaveBeenCalledWith("tea");
    });
  });

  // ---------------------------------------------------------------------------
  // 접근성
  // ---------------------------------------------------------------------------

  describe("접근성", () => {
    it("should set aria-expanded to false on SelectTrigger when closed", () => {
      renderSelect();

      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });

    it("should set aria-expanded to true on SelectTrigger when open", async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });

    it("should have aria-haspopup='listbox' on SelectTrigger", () => {
      renderSelect();

      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-haspopup",
        "listbox",
      );
    });

    it("should have role='listbox' on SelectContent", async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("should have role='option' on each SelectItem", async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole("button"));

      const listbox = screen.getByRole("listbox");
      const options = within(listbox).getAllByRole("option");

      expect(options).toHaveLength(3);
    });

    it("should set aria-selected='true' on the selected SelectItem", async () => {
      const user = userEvent.setup();
      renderSelect({ defaultValue: "tea" });

      await user.click(screen.getByRole("button"));
      const selectedOption = screen.getByRole("option", { name: "차" });

      expect(selectedOption).toHaveAttribute("aria-selected", "true");
    });
  });

  // ---------------------------------------------------------------------------
  // 기타
  // ---------------------------------------------------------------------------

  describe("기타", () => {
    it("should not open dropdown when disabled", async () => {
      const user = userEvent.setup();
      renderSelect({ disabled: true });

      await user.click(screen.getByRole("button"));

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should render a hidden input with the name prop for form integration", () => {
      const { container } = renderSelect({ name: "beverage" });

      const hiddenInput = container.querySelector(
        'input[type="hidden"]',
      ) as HTMLInputElement;

      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute("name", "beverage");
    });

    it("should merge custom className on SelectTrigger", () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger">
            <SelectValue placeholder="선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByRole("button").className).toContain("custom-trigger");
    });

    it("should merge custom className on SelectContent", async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="선택하세요" />
          </SelectTrigger>
          <SelectContent className="custom-content">
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("listbox").className).toContain("custom-content");
    });

    it("should have correct displayName on all sub-components", () => {
      expect(Select.displayName).toBe("Select");
      expect(SelectTrigger.displayName).toBe("SelectTrigger");
      expect(SelectContent.displayName).toBe("SelectContent");
      expect(SelectItem.displayName).toBe("SelectItem");
      expect(SelectValue.displayName).toBe("SelectValue");
    });
  });

  // ---------------------------------------------------------------------------
  // 키보드 네비게이션
  // ---------------------------------------------------------------------------

  describe("키보드 네비게이션", () => {
    it("should move focus to the next item when ArrowDown is pressed", async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole("button"));
      const options = screen.getAllByRole("option");

      await user.keyboard("{ArrowDown}");

      expect(options[0]).toHaveFocus();

      await user.keyboard("{ArrowDown}");

      expect(options[1]).toHaveFocus();
    });

    it("should move focus to the previous item when ArrowUp is pressed", async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole("button"));
      const options = screen.getAllByRole("option");

      // ArrowDown twice to reach second option
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");
      expect(options[1]).toHaveFocus();

      await user.keyboard("{ArrowUp}");

      expect(options[0]).toHaveFocus();
    });

    it("should select the focused item when Enter is pressed", async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();
      renderSelect({ onValueChange: handleValueChange });

      await user.click(screen.getByRole("button"));
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(handleValueChange).toHaveBeenCalledWith("coffee");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });
});
