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
    placeholder: "Enter text...",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    placeholder: "Enter text...",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    placeholder: "Enter text...",
  },
};

export const Error: Story = {
  args: {
    "aria-invalid": true,
    placeholder: "Enter text...",
    defaultValue: "Invalid input",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled input...",
  },
};

export const WithType: Story = {
  args: {
    type: "password",
    placeholder: "Enter password...",
  },
};
