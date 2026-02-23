import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@choblue/ui/select";

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="카테고리 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="beverage">음료</SelectItem>
        <SelectItem value="food">식사</SelectItem>
        <SelectItem value="dessert">디저트</SelectItem>
        <SelectItem value="side">사이드</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <Select defaultValue="food">
      <SelectTrigger>
        <SelectValue placeholder="카테고리 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="beverage">음료</SelectItem>
        <SelectItem value="food">식사</SelectItem>
        <SelectItem value="dessert">디저트</SelectItem>
        <SelectItem value="side">사이드</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger>
        <SelectValue placeholder="카테고리 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="beverage">음료</SelectItem>
        <SelectItem value="food">식사</SelectItem>
        <SelectItem value="dessert">디저트</SelectItem>
        <SelectItem value="side">사이드</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Error: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-invalid>
        <SelectValue placeholder="카테고리 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="beverage">음료</SelectItem>
        <SelectItem value="food">식사</SelectItem>
        <SelectItem value="dessert">디저트</SelectItem>
        <SelectItem value="side">사이드</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string>("beverage");

    return (
      <div className="flex flex-col gap-4">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beverage">음료</SelectItem>
            <SelectItem value="food">식사</SelectItem>
            <SelectItem value="dessert">디저트</SelectItem>
            <SelectItem value="side">사이드</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          현재 선택: <span className="font-medium">{value}</span>
        </p>
      </div>
    );
  },
};

export const StoreSelect: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <label htmlFor="store-select" className="text-sm font-medium">
        매장 선택
      </label>
      <Select defaultValue="store1" name="store">
        <SelectTrigger id="store-select">
          <SelectValue placeholder="매장을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="store1">강남점</SelectItem>
          <SelectItem value="store2">홍대점</SelectItem>
          <SelectItem value="store3">신촌점</SelectItem>
          <SelectItem value="store4">잠실점</SelectItem>
          <SelectItem value="store5">판교점</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        현재 근무 중인 매장을 선택하세요
      </p>
    </div>
  ),
};
