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
        <CardTitle>카드 제목</CardTitle>
        <CardDescription>카드 설명</CardDescription>
      </CardHeader>
      <CardContent>
        <p>카드 본문 내용입니다.</p>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">카드 하단</p>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>기본 카드</CardTitle>
      </CardHeader>
      <CardContent>
        <p>헤더와 본문만 있는 기본 카드입니다.</p>
      </CardContent>
    </Card>
  ),
};

export const WithButton: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>작업 확인</CardTitle>
        <CardDescription>계속 진행하시겠습니까?</CardDescription>
      </CardHeader>
      <CardContent>
        <p>이 작업은 되돌릴 수 없습니다. 계속하려면 확인을 눌러주세요.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" className="flex-1">
          취소
        </Button>
        <Button className="flex-1">확인</Button>
      </CardFooter>
    </Card>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>프리미엄 블렌드 원두</CardTitle>
        <CardDescription>장인이 로스팅한 원두</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          엄선된 아라비카 원두를 장인의 기술로 로스팅한 프리미엄 블렌드입니다.
        </p>
        <p className="mt-4 text-2xl font-bold">₩12,000</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">장바구니 담기</Button>
      </CardFooter>
    </Card>
  ),
};

export const DashboardWidget: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader>
        <CardDescription>총 매출</CardDescription>
        <CardTitle className="text-3xl">₩2,450,000</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-success-600">
          <span className="font-semibold">+12.5%</span> 지난달 대비
        </p>
      </CardContent>
    </Card>
  ),
};
