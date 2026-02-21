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
    placeholder: "Enter your message...",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    placeholder: "Small textarea",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    placeholder: "Large textarea",
  },
};

export const Error: Story = {
  args: {
    placeholder: "This field has an error",
    "aria-invalid": true,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled textarea",
    disabled: true,
  },
};

export const WithRows: Story = {
  args: {
    placeholder: "Textarea with 6 rows",
    rows: 6,
  },
};
