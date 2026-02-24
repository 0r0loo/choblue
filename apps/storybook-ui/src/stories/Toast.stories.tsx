import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ToastProvider,
  ToastViewport,
  useToast,
} from "@choblue/ui/toast";
import { Button } from "@choblue/ui/button";

const meta = {
  title: "UI/Toast",
  component: ToastProvider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

// -- Demo Components --

function DefaultDemo() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() =>
        toast({
          title: "저장 완료",
          description: "상품 정보가 저장되었습니다.",
        })
      }
    >
      Show Toast
    </Button>
  );
}

function DestructiveDemo() {
  const { toast } = useToast();

  return (
    <Button
      variant="destructive"
      onClick={() =>
        toast({
          variant: "destructive",
          title: "결제 실패",
          description: "카드 결제 처리 중 오류가 발생했습니다.",
        })
      }
    >
      Show Error Toast
    </Button>
  );
}

function TitleOnlyDemo() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() =>
        toast({
          title: "알림",
        })
      }
    >
      Show Title Only
    </Button>
  );
}

function MultipleDemo() {
  const { toast } = useToast();

  const showMultiple = () => {
    toast({
      title: "첫 번째 알림",
      description: "첫 번째 토스트입니다.",
    });
    toast({
      variant: "destructive",
      title: "두 번째 알림",
      description: "두 번째 토스트입니다.",
    });
    toast({
      title: "세 번째 알림",
      description: "세 번째 토스트입니다.",
    });
  };

  return <Button onClick={showMultiple}>Show Multiple Toasts</Button>;
}

function CustomDurationDemo() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() =>
        toast({
          title: "짧은 알림",
          description: "2초 후 자동으로 사라집니다.",
          duration: 2000,
        })
      }
    >
      Show Short Duration Toast
    </Button>
  );
}

// -- Stories --

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <DefaultDemo />
      <ToastViewport />
    </ToastProvider>
  ),
};

export const Destructive: Story = {
  render: () => (
    <ToastProvider>
      <DestructiveDemo />
      <ToastViewport />
    </ToastProvider>
  ),
};

export const TitleOnly: Story = {
  render: () => (
    <ToastProvider>
      <TitleOnlyDemo />
      <ToastViewport />
    </ToastProvider>
  ),
};

export const Multiple: Story = {
  render: () => (
    <ToastProvider>
      <MultipleDemo />
      <ToastViewport />
    </ToastProvider>
  ),
};

export const CustomDuration: Story = {
  render: () => (
    <ToastProvider>
      <CustomDurationDemo />
      <ToastViewport />
    </ToastProvider>
  ),
};
