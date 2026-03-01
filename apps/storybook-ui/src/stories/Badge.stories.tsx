import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@choblue/ui/badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "success", "info", "warning", "danger", "outline", "destructive"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "New",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Active",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: "Success",
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    children: "Info",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "Warning",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Danger",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Pending",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Error",
  },
};

export const WithCustomClass: Story = {
  args: {
    className: "text-sm px-3 py-1",
    children: "Custom",
  },
};
