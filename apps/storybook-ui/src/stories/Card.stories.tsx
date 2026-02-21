import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@choblue/ui/card";
import { Button } from "@choblue/ui/button";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. This is a default card with all available subcomponents.</p>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">Card Footer</p>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a simple card with only header and content sections.</p>
      </CardContent>
    </Card>
  ),
};

export const WithButton: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Confirm Action</CardTitle>
        <CardDescription>Are you sure you want to proceed?</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This action cannot be undone. Please confirm to continue.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button className="flex-1">Confirm</Button>
      </CardFooter>
    </Card>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>Premium Coffee Blend</CardTitle>
        <CardDescription>Artisan roasted beans</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          A carefully selected blend of premium Arabica beans, expertly roasted to perfection.
        </p>
        <p className="mt-4 text-2xl font-bold">₩12,000</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Add to Cart</Button>
      </CardFooter>
    </Card>
  ),
};

export const DashboardWidget: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader>
        <CardDescription>Total Revenue</CardDescription>
        <CardTitle className="text-3xl">₩2,450,000</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-success-600">
          <span className="font-semibold">+12.5%</span> from last month
        </p>
      </CardContent>
    </Card>
  ),
};
