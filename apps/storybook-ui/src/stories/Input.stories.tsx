import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@choblue/ui/input";

const meta = {
  title: "UI/Input",
  component: Input,
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
    type: {
      control: "select",
      options: ["text", "password", "email", "number"],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "텍스트를 입력하세요...",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    placeholder: "텍스트를 입력하세요...",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    placeholder: "텍스트를 입력하세요...",
  },
};

export const Error: Story = {
  args: {
    "aria-invalid": true,
    placeholder: "텍스트를 입력하세요...",
    defaultValue: "잘못된 입력",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "비활성화된 입력...",
  },
};

export const WithType: Story = {
  args: {
    type: "password",
    placeholder: "비밀번호를 입력하세요...",
  },
};
