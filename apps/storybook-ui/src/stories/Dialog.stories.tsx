import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  ConfirmProvider,
  useConfirm,
} from "@choblue/ui/dialog";
import { Button } from "@choblue/ui/button";
import { Input } from "@choblue/ui/input";
import { Textarea } from "@choblue/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@choblue/ui/select";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>다이얼로그 열기</Button>
      </DialogTrigger>
      <DialogContent className="w-[450px]">
        <DialogHeader>
          <DialogTitle>다이얼로그 제목</DialogTitle>
          <DialogDescription>
            다이얼로그 설명입니다. 여기에 원하는 내용을 넣을 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-0">
          <p className="text-sm">
            다이얼로그 본문 영역입니다. 폼, 텍스트 등 자유롭게 구성할 수 있습니다.
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const DeleteConfirmation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="danger">상품 삭제</Button>
      </DialogTrigger>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle>상품 삭제</DialogTitle>
          <DialogDescription>
            이 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-0">
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-semibold">상품: 아메리카노</p>
            <p className="text-sm text-muted-foreground">카테고리: 커피</p>
            <p className="text-sm text-muted-foreground">가격: ₩3,500</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button variant="danger">삭제</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const PaymentConfirmation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>₩24,500 결제</Button>
      </DialogTrigger>
      <DialogContent className="w-[500px]">
        <DialogHeader>
          <DialogTitle>결제 확인</DialogTitle>
          <DialogDescription>
            결제 전 주문 내역을 확인해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-6 pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>아메리카노 x 2</span>
              <span>₩7,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>카페라떼 x 1</span>
              <span>₩4,500</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>크루아상 x 3</span>
              <span>₩9,000</span>
            </div>
          </div>
          <div className="border-t border-border pt-2">
            <div className="flex justify-between text-sm">
              <span>소계</span>
              <span>₩20,500</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>부가세 (10%)</span>
              <span>₩2,050</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>서비스 수수료</span>
              <span>₩1,950</span>
            </div>
          </div>
          <div className="border-t border-border pt-2">
            <div className="flex justify-between font-semibold">
              <span>합계</span>
              <span>₩24,500</span>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-sm font-medium">결제 수단</p>
            <p className="text-sm text-muted-foreground">신용카드</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button>결제 확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const FormDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>상품 추가</Button>
      </DialogTrigger>
      <DialogContent className="w-[500px]">
        <DialogHeader>
          <DialogTitle>새 상품 추가</DialogTitle>
          <DialogDescription>
            아래 상품 정보를 입력해주세요. 모든 항목은 필수입니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-6 pt-0">
          <div className="space-y-2">
            <label htmlFor="product-name" className="text-sm font-medium">
              상품명
            </label>
            <Input
              id="product-name"
              type="text"
              placeholder="예: 카페라떼"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              카테고리
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coffee">커피</SelectItem>
                <SelectItem value="beverage">음료</SelectItem>
                <SelectItem value="dessert">디저트</SelectItem>
                <SelectItem value="food">식사</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">
              가격
            </label>
            <Input
              id="price"
              type="number"
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              설명
            </label>
            <Textarea
              id="description"
              placeholder="상품 설명..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button>상품 추가</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// -- useConfirm (imperative) stories --

function ConfirmBasicExample() {
  const confirm = useConfirm();
  const [result, setResult] = useState<string>("");

  const handleClick = async () => {
    const ok = await confirm({
      title: "계속하시겠습니까?",
      description: "이 작업은 되돌릴 수 없습니다.",
    });
    setResult(ok ? "확인됨" : "취소됨");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={handleClick}>확인 열기</Button>
      {result && (
        <p className="text-sm text-muted-foreground">결과: {result}</p>
      )}
    </div>
  );
}

export const ConfirmBasic: Story = {
  render: () => (
    <ConfirmProvider>
      <ConfirmBasicExample />
    </ConfirmProvider>
  ),
};

function ConfirmDangerExample() {
  const confirm = useConfirm();
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    const ok = await confirm({
      title: "상품 삭제",
      description: "이 상품이 카탈로그에서 영구적으로 삭제됩니다.",
      confirmText: "삭제",
      cancelText: "유지",
      variant: "danger",
    });
    if (ok) setDeleted(true);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button variant="danger" onClick={handleDelete}>
        상품 삭제
      </Button>
      {deleted && (
        <p className="text-sm text-danger-600">상품이 삭제되었습니다.</p>
      )}
    </div>
  );
}

export const ConfirmDanger: Story = {
  render: () => (
    <ConfirmProvider>
      <ConfirmDangerExample />
    </ConfirmProvider>
  ),
};

function ConfirmCustomRenderExample() {
  const confirm = useConfirm();
  const [result, setResult] = useState<string>("");

  const handleDelete = async () => {
    const ok = await confirm({
      render: ({ confirm: onConfirm, cancel }) => (
        <>
          <DialogHeader>
            <DialogTitle>상품 삭제</DialogTitle>
            <DialogDescription>
              다음 상품이 영구적으로 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-0">
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm font-semibold">아메리카노</p>
              <p className="text-sm text-muted-foreground">카테고리: 커피</p>
              <p className="text-sm text-muted-foreground">가격: ₩3,500</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancel}>
              취소
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              삭제
            </Button>
          </DialogFooter>
        </>
      ),
    });
    setResult(ok ? "삭제됨" : "취소됨");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button variant="danger" onClick={handleDelete}>
        상품 삭제 (커스텀)
      </Button>
      {result && (
        <p className="text-sm text-muted-foreground">결과: {result}</p>
      )}
    </div>
  );
}

export const ConfirmCustomRender: Story = {
  render: () => (
    <ConfirmProvider>
      <ConfirmCustomRenderExample />
    </ConfirmProvider>
  ),
};

export const WithLongContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>약관 보기</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] w-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>서비스 이용약관</DialogTitle>
          <DialogDescription>
            아래 이용약관을 주의 깊게 읽어주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-6 pt-0 text-sm">
          <section>
            <h3 className="mb-2 font-semibold">1. 소개</h3>
            <p className="text-muted-foreground">
              본 POS 시스템에 오신 것을 환영합니다. 본 서비스를 이용함으로써
              귀하는 다음 이용약관에 동의하게 됩니다. 본 약관은 개인정보
              처리방침과 함께 본 애플리케이션과 관련된 귀하와의 관계를
              규율합니다.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">2. 서비스 이용</h3>
            <p className="text-muted-foreground">
              본 애플리케이션의 콘텐츠는 일반적인 정보 제공 및 이용 목적으로만
              제공됩니다. 콘텐츠는 사전 통지 없이 변경될 수 있습니다. 당사 및
              제3자는 본 애플리케이션에서 제공되는 정보와 자료의 정확성, 적시성,
              성능, 완전성 또는 특정 목적에 대한 적합성에 대해 어떠한 보증도
              하지 않습니다.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">3. 데이터 처리</h3>
            <p className="text-muted-foreground">
              본 애플리케이션의 이용 및 이와 관련된 분쟁은 해당 관할권의 법률에
              따릅니다. 당사는 개인정보 보호법 등 관련 데이터 보호 규정에 따라
              모든 거래 데이터를 처리합니다.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">4. 결제 조건</h3>
            <p className="text-muted-foreground">
              본 시스템을 통해 처리되는 모든 결제는 확인 및 승인 절차를
              거칩니다. 당사는 상품 또는 서비스 가용성, 상품 또는 가격 정보
              오류, 신용 및 사기 방지 부서에서 확인한 문제 등을 포함하되
              이에 국한되지 않는 사유로 거래를 거부하거나 취소할 권리를
              보유합니다.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">5. 책임 제한</h3>
            <p className="text-muted-foreground">
              어떠한 경우에도 당사는 서비스의 이용 또는 이용 불능으로 인한
              직접적, 간접적, 부수적, 특별, 결과적 또는 징벌적 손해에 대해
              책임을 지지 않습니다. 여기에는 이익, 영업권, 사용, 데이터 또는
              기타 무형 손실에 대한 손해가 포함되나 이에 국한되지 않습니다.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">6. 변경 사항</h3>
            <p className="text-muted-foreground">
              당사는 본 약관을 언제든지 수정할 권리를 보유합니다. 변경 사항은
              귀하에게 구속력이 있으므로 정기적으로 이 페이지를 확인하시기
              바랍니다. 본 약관에 포함된 일부 조항은 애플리케이션의 다른
              곳에 게시된 조항이나 공지에 의해 대체될 수 있습니다.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">7. 연락처</h3>
            <p className="text-muted-foreground">
              본 약관에 대한 문의 사항이 있으시면 support@example.com으로
              연락해주세요. 영업일 기준 2일 이내에 답변드리도록 최선을
              다하겠습니다.
            </p>
          </section>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">닫기</Button>
          </DialogClose>
          <Button>동의</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};