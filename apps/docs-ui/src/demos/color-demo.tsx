'use client'

function Swatch({ color, label, hex }: { color: string; label: string; hex: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`h-12 w-12 rounded-lg border border-border shadow-sm ${color}`}
      />
      <span className="text-[10px] font-medium text-foreground">{label}</span>
      <span className="text-[9px] text-muted-foreground">{hex}</span>
    </div>
  )
}

interface PaletteData {
  name: string
  swatches: { step: string; color: string; hex: string }[]
}

function PaletteRow({ palette }: { palette: PaletteData }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold capitalize text-foreground">{palette.name}</span>
      <div className="flex flex-wrap gap-2">
        {palette.swatches.map((s) => (
          <Swatch key={s.step} color={s.color} label={s.step} hex={s.hex} />
        ))}
      </div>
    </div>
  )
}

const PALETTES: PaletteData[] = [
  {
    name: 'Neutral',
    swatches: [
      { step: '50', color: 'bg-neutral-50', hex: '#F6F7F9' },
      { step: '100', color: 'bg-neutral-100', hex: '#ECEFF3' },
      { step: '200', color: 'bg-neutral-200', hex: '#DCE1EA' },
      { step: '300', color: 'bg-neutral-300', hex: '#BFC8D9' },
      { step: '400', color: 'bg-neutral-400', hex: '#94A0B8' },
      { step: '500', color: 'bg-neutral-500', hex: '#6A7895' },
      { step: '600', color: 'bg-neutral-600', hex: '#536079' },
      { step: '700', color: 'bg-neutral-700', hex: '#3C475D' },
      { step: '800', color: 'bg-neutral-800', hex: '#2B3445' },
      { step: '900', color: 'bg-neutral-900', hex: '#1D2330' },
      { step: '950', color: 'bg-neutral-950', hex: '#121721' },
    ],
  },
  {
    name: 'Primary',
    swatches: [
      { step: '100', color: 'bg-primary-100', hex: '#ECD6FF' },
      { step: '200', color: 'bg-primary-200', hex: '#D7ADFF' },
      { step: '300', color: 'bg-primary-300', hex: '#BE84FF' },
      { step: '400', color: 'bg-primary-400', hex: '#A866FF' },
      { step: '500', color: 'bg-primary-500', hex: '#8333FF' },
      { step: '600', color: 'bg-primary-600', hex: '#6525DB' },
      { step: '700', color: 'bg-primary-700', hex: '#4B19B7' },
      { step: '800', color: 'bg-primary-800', hex: '#341093' },
      { step: '900', color: 'bg-primary-900', hex: '#23097A' },
    ],
  },
  {
    name: 'Success',
    swatches: [
      { step: '100', color: 'bg-success-100', hex: '#F1FDF2' },
      { step: '200', color: 'bg-success-200', hex: '#CCFBD5' },
      { step: '300', color: 'bg-success-300', hex: '#BFF9D1' },
      { step: '400', color: 'bg-success-400', hex: '#6BF3A1' },
      { step: '500', color: 'bg-success-500', hex: '#10E57A' },
      { step: '600', color: 'bg-success-600', hex: '#056F44' },
      { step: '700', color: 'bg-success-700', hex: '#03583E' },
      { step: '800', color: 'bg-success-800', hex: '#024437' },
      { step: '900', color: 'bg-success-900', hex: '#023A35' },
    ],
  },
  {
    name: 'Info',
    swatches: [
      { step: '100', color: 'bg-info-100', hex: '#D9FEFD' },
      { step: '200', color: 'bg-info-200', hex: '#B3FBFE' },
      { step: '300', color: 'bg-info-300', hex: '#8CF1FE' },
      { step: '400', color: 'bg-info-400', hex: '#70E3FD' },
      { step: '500', color: 'bg-info-500', hex: '#41CDFC' },
      { step: '600', color: 'bg-info-600', hex: '#2FA2D8' },
      { step: '700', color: 'bg-info-700', hex: '#207BB5' },
      { step: '800', color: 'bg-info-800', hex: '#145892' },
      { step: '900', color: 'bg-info-900', hex: '#0C3F78' },
    ],
  },
  {
    name: 'Warning',
    swatches: [
      { step: '100', color: 'bg-warning-100', hex: '#FFF4D8' },
      { step: '200', color: 'bg-warning-200', hex: '#FFE6B2' },
      { step: '300', color: 'bg-warning-300', hex: '#FFD58B' },
      { step: '400', color: 'bg-warning-400', hex: '#FFC46F' },
      { step: '500', color: 'bg-warning-500', hex: '#FFA83F' },
      { step: '600', color: 'bg-warning-600', hex: '#DB842E' },
      { step: '700', color: 'bg-warning-700', hex: '#B7641F' },
      { step: '800', color: 'bg-warning-800', hex: '#934814' },
      { step: '900', color: 'bg-warning-900', hex: '#7A340C' },
    ],
  },
  {
    name: 'Danger',
    swatches: [
      { step: '100', color: 'bg-danger-100', hex: '#FFF7F2' },
      { step: '200', color: 'bg-danger-200', hex: '#FFDDCE' },
      { step: '300', color: 'bg-danger-300', hex: '#FFD0C2' },
      { step: '400', color: 'bg-danger-400', hex: '#FF826E' },
      { step: '500', color: 'bg-danger-500', hex: '#FF1B0E' },
      { step: '600', color: 'bg-danger-600', hex: '#A01108' },
      { step: '700', color: 'bg-danger-700', hex: '#760F0A' },
      { step: '800', color: 'bg-danger-800', hex: '#530D09' },
      { step: '900', color: 'bg-danger-900', hex: '#360A08' },
    ],
  },
]

export function ColorPalettes() {
  return (
    <div className="not-prose mt-4 flex flex-col gap-6 rounded-lg border border-border bg-background p-6">
      {PALETTES.map((p) => (
        <PaletteRow key={p.name} palette={p} />
      ))}
    </div>
  )
}

const SEMANTIC_TOKENS = [
  { label: 'background', color: 'bg-background', border: true },
  { label: 'foreground', color: 'bg-foreground' },
  { label: 'surface', color: 'bg-surface' },
  { label: 'muted', color: 'bg-muted' },
  { label: 'muted-foreground', color: 'bg-muted-foreground' },
  { label: 'border', color: 'bg-border' },
  { label: 'input', color: 'bg-input' },
  { label: 'ring', color: 'bg-ring' },
  { label: 'overlay', color: 'bg-overlay' },
  { label: 'disabled', color: 'bg-disabled' },
  { label: 'disabled-foreground', color: 'bg-disabled-foreground' },
]

const COMPONENT_TOKENS = [
  { label: 'primary', color: 'bg-primary' },
  { label: 'primary-foreground', color: 'bg-primary-foreground', border: true },
  { label: 'secondary', color: 'bg-secondary' },
  { label: 'secondary-foreground', color: 'bg-secondary-foreground' },
  { label: 'danger', color: 'bg-danger' },
  { label: 'danger-foreground', color: 'bg-danger-foreground', border: true },
  { label: 'accent', color: 'bg-accent' },
  { label: 'accent-foreground', color: 'bg-accent-foreground' },
  { label: 'card', color: 'bg-card', border: true },
  { label: 'card-foreground', color: 'bg-card-foreground' },
  { label: 'popover', color: 'bg-popover', border: true },
  { label: 'popover-foreground', color: 'bg-popover-foreground' },
]

function TokenGrid({ tokens }: { tokens: { label: string; color: string; border?: boolean }[] }) {
  return (
    <div className="not-prose mt-4 grid grid-cols-2 gap-3 rounded-lg border border-border bg-background p-6 sm:grid-cols-3 md:grid-cols-4">
      {tokens.map((t) => (
        <div key={t.label} className="flex items-center gap-3">
          <div
            className={`h-10 w-10 shrink-0 rounded-lg shadow-sm ${t.color} ${t.border ? 'border border-border' : ''}`}
          />
          <span className="text-xs text-muted-foreground">{t.label}</span>
        </div>
      ))}
    </div>
  )
}

export function SemanticTokens() {
  return <TokenGrid tokens={SEMANTIC_TOKENS} />
}

export function ComponentTokens() {
  return <TokenGrid tokens={COMPONENT_TOKENS} />
}
