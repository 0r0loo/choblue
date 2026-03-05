import type { Meta, StoryObj } from "@storybook/react-vite";

// ---------------------------------------------------------------------------
// Color Data (theme.css 에서 추출한 실제 hex 값)
// ---------------------------------------------------------------------------

const PALETTES = {
  primary: {
    name: "Primary",
    base: "#8333FF",
    scale: {
      100: "#ECD6FF", 200: "#D7ADFF", 300: "#BE84FF",
      400: "#A866FF", 500: "#8333FF", 600: "#6525DB",
      700: "#4B19B7", 800: "#341093", 900: "#23097A",
    },
  },
  success: {
    name: "Success",
    base: "#10E57A",
    scale: {
      100: "#F1FDF2", 200: "#CCFBD5", 300: "#BFF9D1",
      400: "#6BF3A1", 500: "#10E57A", 600: "#056F44",
      700: "#03583E", 800: "#024437", 900: "#023A35",
    },
  },
  info: {
    name: "Info",
    base: "#41CDFC",
    scale: {
      100: "#D9FEFD", 200: "#B3FBFE", 300: "#8CF1FE",
      400: "#70E3FD", 500: "#41CDFC", 600: "#2FA2D8",
      700: "#207BB5", 800: "#145892", 900: "#0C3F78",
    },
  },
  warning: {
    name: "Warning",
    base: "#FFA83F",
    scale: {
      100: "#FFF4D8", 200: "#FFE6B2", 300: "#FFD58B",
      400: "#FFC46F", 500: "#FFA83F", 600: "#DB842E",
      700: "#B7641F", 800: "#934814", 900: "#7A340C",
    },
  },
  danger: {
    name: "Danger",
    base: "#FF1B0E",
    scale: {
      100: "#FFF7F2", 200: "#FFDDCE", 300: "#FFD0C2",
      400: "#FF826E", 500: "#FF1B0E", 600: "#A01108",
      700: "#760F0A", 800: "#530D09", 900: "#360A08",
    },
  },
} as const;

const NEUTRAL = {
  50: "#F6F7F9", 100: "#ECEFF3", 200: "#DCE1EA",
  300: "#BFC8D9", 400: "#94A0B8", 500: "#6A7895",
  600: "#536079", 700: "#3C475D", 800: "#2B3445",
  900: "#1D2330", 950: "#121721",
} as const;

const STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const NEUTRAL_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const SEMANTIC_TOKENS = [
  { name: "background", desc: "전체 화면 배경" },
  { name: "foreground", desc: "기본 텍스트" },
  { name: "surface", desc: "카드/모달 위 표면" },
  { name: "muted", desc: "비활성 배경" },
  { name: "muted-foreground", desc: "보조 텍스트" },
  { name: "border", desc: "기본 테두리" },
  { name: "ring", desc: "포커스 링" },
  { name: "input", desc: "폼 컨트롤 테두리" },
  { name: "card", desc: "카드 배경" },
  { name: "primary", desc: "주요 액션" },
  { name: "secondary", desc: "보조 액션" },
  { name: "destructive", desc: "위험/삭제" },
  { name: "accent", desc: "강조 배경" },
  { name: "overlay", desc: "모달 딤 배경" },
  { name: "disabled", desc: "비활성 배경" },
  { name: "disabled-foreground", desc: "비활성 텍스트" },
  { name: "popover", desc: "팝오버 배경" },
  { name: "popover-foreground", desc: "팝오버 텍스트" },
] as const;

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

function BrandColorsPage() {
  return (
    <div className="p-8 max-w-5xl">
      <h2 className="text-lg font-semibold mb-1">Brand Colors</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Primary ~ Danger 5개 팔레트, 각 100-900 스케일
      </p>
      <div className="grid grid-cols-5 gap-6">
        {Object.values(PALETTES).map((palette) => (
          <div key={palette.name} className="flex flex-col gap-1.5 min-w-[140px]">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {palette.name}
            </p>
            <div className="flex items-center gap-2 mb-3 rounded-lg border border-border px-3 py-2">
              <div
                className="h-8 w-8 shrink-0 rounded-md"
                style={{ backgroundColor: palette.base }}
              />
              <span className="text-sm font-mono">{palette.base}</span>
            </div>
            <div className="flex flex-col gap-1">
              {STEPS.map((step) => (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className="h-10 w-full rounded-md"
                    style={{
                      backgroundColor: palette.scale[step],
                      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
                    }}
                  />
                  <span className="w-16 shrink-0 text-xs text-muted-foreground tabular-nums">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NeutralPage() {
  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-lg font-semibold mb-1">Neutral</h2>
      <p className="text-sm text-muted-foreground mb-6">
        텍스트, 배경, 보더에 사용되는 그레이스케일 (50-950)
      </p>
      <div className="flex flex-col gap-1">
        {NEUTRAL_STEPS.map((step) => (
          <div key={step} className="flex items-center gap-3">
            <div
              className="h-12 w-full rounded-md"
              style={{
                backgroundColor: NEUTRAL[step],
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
              }}
            />
            <span className="w-16 shrink-0 text-xs text-muted-foreground tabular-nums">
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SemanticPage() {
  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-lg font-semibold mb-1">Semantic Tokens</h2>
      <p className="text-sm text-muted-foreground mb-6">
        라이트/다크 테마에 따라 자동 전환. Storybook 테마 토글로 확인.
      </p>
      <div className="flex flex-col gap-2">
        {SEMANTIC_TOKENS.map((t) => (
          <div key={t.name} className="flex items-center gap-4">
            <div
              className="h-12 w-48 shrink-0 rounded-md"
              style={{
                backgroundColor: `var(--color-${t.name})`,
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
              }}
            />
            <div>
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Foundation/Colors",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const BrandColors: Story = {
  render: () => <BrandColorsPage />,
};

export const Neutral: Story = {
  render: () => <NeutralPage />,
};

export const SemanticTokens: Story = {
  render: () => <SemanticPage />,
};
