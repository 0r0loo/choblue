import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@choblue/ui/button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "danger"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon"],
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "버튼",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "버튼",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "버튼",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "버튼",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "버튼",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "버튼",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "버튼",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "버튼",
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
        계속하기
      </>
    ),
  },
};