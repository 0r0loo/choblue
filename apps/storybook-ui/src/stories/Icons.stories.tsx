import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDoubleLeft,
  ChevronDoubleRight,
  SortAsc,
  SortDesc,
  SortDefault,
} from "@choblue/ui/icons";

const meta = {
  title: "Foundation/Icons",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ICONS = [
  { name: "X", Component: X },
  { name: "Check", Component: Check },
  { name: "ChevronLeft", Component: ChevronLeft },
  { name: "ChevronRight", Component: ChevronRight },
  { name: "ChevronDoubleLeft", Component: ChevronDoubleLeft },
  { name: "ChevronDoubleRight", Component: ChevronDoubleRight },
  { name: "SortAsc", Component: SortAsc },
  { name: "SortDesc", Component: SortDesc },
  { name: "SortDefault", Component: SortDefault },
] as const;

export const AllIcons: Story = {
  name: "전체 아이콘",
  render: () => (
    <div className="grid grid-cols-3 gap-6">
      {ICONS.map(({ name, Component }) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2 rounded-lg border border-border p-4"
        >
          <Component />
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  name: "크기 비교",
  render: () => (
    <div className="flex items-end gap-4">
      {[16, 24, 32, 48].map((s) => (
        <div key={s} className="flex flex-col items-center gap-2">
          <Check size={s} />
          <span className="text-xs text-muted-foreground">{s}px</span>
        </div>
      ))}
    </div>
  ),
};

export const CustomColor: Story = {
  name: "색상 커스터마이징",
  render: () => (
    <div className="flex items-center gap-4">
      <Check className="text-primary" />
      <Check className="text-success-500" />
      <Check className="text-danger-500" />
      <Check className="text-muted-foreground" />
    </div>
  ),
};
