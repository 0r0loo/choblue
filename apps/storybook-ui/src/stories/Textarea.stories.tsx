import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "@choblue/ui/textarea";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    "aria-invalid": {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "메시지를 입력하세요...",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    placeholder: "작은 텍스트 영역",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    placeholder: "큰 텍스트 영역",
  },
};

export const Error: Story = {
  args: {
    placeholder: "이 필드에 오류가 있습니다",
    "aria-invalid": true,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "비활성화된 텍스트 영역",
    disabled: true,
  },
};

export const WithRows: Story = {
  args: {
    placeholder: "6줄 텍스트 영역",
    rows: 6,
  },
};
