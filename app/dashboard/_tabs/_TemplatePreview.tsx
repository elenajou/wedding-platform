'use client'
import React from 'react'
import { getColorScheme, type ColorScheme } from '@/themes/color-schemes'

type SC = ColorScheme

// ── Shared helpers ────────────────────────────────────────────────────────────

function TextLines({ x, y, widths, fill, gap = 7 }: {
  x: number; y: number; widths: number[]; fill: string; gap?: number
}) {
  return <>{widths.map((w, i) =>
    <rect key={i} x={x} y={y + i * gap} width={w} height={2} rx={1} fill={fill} />
  )}</>
}

function EnvelopeBase({ sc }: { sc: SC }) {
  return <>
    <rect x={18} y={10} width={84} height={58} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={1} />
    <polyline points="18,10 60,38 102,10" fill="none" stroke={sc.colorPrimary} strokeWidth={1.2} />
    <polyline points="18,68 42,50" fill="none" stroke={sc.colorBorder} strokeWidth={0.8} />
    <polyline points="102,68 78,50" fill="none" stroke={sc.colorBorder} strokeWidth={0.8} />
  </>
}

// ── Section previews ──────────────────────────────────────────────────────────

function Envelope({ design, sc }: { design: string; sc: SC }) {
  switch (design) {
    case 'Minimal':
      return <>
        <rect x={18} y={10} width={84} height={58} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={1} />
        <polyline points="18,10 60,36 102,10" fill="none" stroke={sc.colorBorder} strokeWidth={1} />
        <rect x={34} y={44} width={52} height={2} rx={1} fill={sc.colorTextMuted} />
        <rect x={40} y={51} width={40} height={2} rx={1} fill={sc.colorTextMuted} />
      </>
    case 'Floral':
      return <>
        <EnvelopeBase sc={sc} />
        <path d="M18,10 Q10,4 4,2 Q10,8 18,10" fill={sc.colorPrimary} opacity={0.4} />
        <circle cx={4} cy={2} r={2} fill={sc.colorPrimary} opacity={0.4} />
        <path d="M102,10 Q110,4 116,2 Q110,8 102,10" fill={sc.colorPrimary} opacity={0.4} />
        <circle cx={116} cy={2} r={2} fill={sc.colorPrimary} opacity={0.4} />
        <path d="M18,68 Q10,76 4,78 Q10,72 18,68" fill={sc.colorPrimary} opacity={0.3} />
        <path d="M102,68 Q110,76 116,78 Q110,72 102,68" fill={sc.colorPrimary} opacity={0.3} />
      </>
    case 'Dark':
      return <>
        <rect x={0} y={0} width={120} height={80} fill="#1a1510" />
        <rect x={18} y={10} width={84} height={58} fill="#2e281f" stroke="#6b6046" strokeWidth={1} />
        <polyline points="18,10 60,38 102,10" fill="none" stroke="#b08d57" strokeWidth={1.2} />
        <polyline points="18,68 42,50" fill="none" stroke="#6b6046" strokeWidth={0.8} />
        <polyline points="102,68 78,50" fill="none" stroke="#6b6046" strokeWidth={0.8} />
        <circle cx={60} cy={38} r={5} fill="#b08d57" opacity={0.7} />
      </>
    case 'Garden':
      return <>
        <rect x={0} y={0} width={120} height={80} fill="#e8ede4" />
        <rect x={18} y={10} width={84} height={58} fill="#f0f5ec" stroke="#a8bda0" strokeWidth={1} />
        <polyline points="18,10 60,38 102,10" fill="none" stroke="#2c3a28" strokeWidth={1.2} />
        <polyline points="18,68 42,50" fill="none" stroke="#a8bda0" strokeWidth={0.8} />
        <polyline points="102,68 78,50" fill="none" stroke="#a8bda0" strokeWidth={0.8} />
        <circle cx={60} cy={38} r={4} fill="#2c3a28" opacity={0.5} />
      </>
    default: // Classic
      return <>
        <EnvelopeBase sc={sc} />
        <circle cx={60} cy={38} r={5} fill={sc.colorPrimary} opacity={0.65} />
        <rect x={32} y={48} width={56} height={2} rx={1} fill={sc.colorTextMuted} />
        <rect x={38} y={55} width={44} height={2} rx={1} fill={sc.colorTextMuted} />
      </>
  }
}

function Hero({ design, sc }: { design: string; sc: SC }) {
  const cx = 60
  switch (design) {
    case 'Minimal':
      return <>
        <rect x={cx - 20} y={14} width={40} height={2} rx={1} fill={sc.colorTextMuted} />
        <rect x={cx - 32} y={26} width={64} height={5} rx={1} fill={sc.colorText} />
        <rect x={cx - 26} y={35} width={52} height={5} rx={1} fill={sc.colorText} />
        <rect x={cx - 18} y={48} width={36} height={2} rx={1} fill={sc.colorTextMuted} />
        <rect x={cx - 12} y={58} width={24} height={2} rx={1} fill={sc.colorTextMuted} />
      </>
    case 'Fullscreen':
      return <>
        <rect x={0} y={0} width={120} height={80} fill={sc.colorPrimary} opacity={0.18} />
        <rect x={0} y={0} width={120} height={80} fill={sc.colorText} opacity={0.42} />
        <rect x={cx - 28} y={42} width={56} height={5} rx={1} fill="white" />
        <rect x={cx - 22} y={52} width={44} height={5} rx={1} fill="white" />
        <rect x={cx - 10} y={64} width={20} height={2} rx={1} fill="white" opacity={0.65} />
      </>
    case 'SplitLayout':
      return <>
        <rect x={0} y={0} width={52} height={80} fill={sc.colorPrimary} opacity={0.22} />
        <rect x={62} y={16} width={46} height={3} rx={1} fill={sc.colorTextMuted} />
        <rect x={60} y={26} width={50} height={6} rx={1} fill={sc.colorText} />
        <rect x={62} y={36} width={46} height={6} rx={1} fill={sc.colorText} />
        <rect x={66} y={50} width={36} height={2} rx={1} fill={sc.colorTextMuted} />
        <rect x={70} y={58} width={28} height={2} rx={1} fill={sc.colorPrimary} opacity={0.7} />
      </>
    case 'Floral':
      return <>
        <rect x={cx - 20} y={10} width={40} height={2} rx={1} fill={sc.colorTextMuted} />
        <rect x={cx - 30} y={22} width={60} height={5} rx={1} fill={sc.colorText} />
        <rect x={cx - 24} y={31} width={48} height={5} rx={1} fill={sc.colorText} />
        <polygon points={`${cx},44 ${cx + 4},48 ${cx},52 ${cx - 4},48`} fill={sc.colorPrimary} opacity={0.6} />
        <rect x={cx - 18} y={58} width={36} height={2} rx={1} fill={sc.colorTextMuted} />
        <path d="M4,4 Q14,2 20,10" stroke={sc.colorPrimary} strokeWidth={1} fill="none" opacity={0.45} />
        <circle cx={4} cy={4} r={2} fill={sc.colorPrimary} opacity={0.35} />
        <path d="M116,4 Q106,2 100,10" stroke={sc.colorPrimary} strokeWidth={1} fill="none" opacity={0.45} />
        <circle cx={116} cy={4} r={2} fill={sc.colorPrimary} opacity={0.35} />
      </>
    default: // Classic
      return <>
        <rect x={cx - 14} y={10} width={28} height={2} rx={1} fill={sc.colorTextMuted} />
        <rect x={cx - 28} y={20} width={56} height={6} rx={1} fill={sc.colorText} />
        <rect x={cx - 22} y={30} width={44} height={6} rx={1} fill={sc.colorText} />
        <line x1={cx - 28} y1={42} x2={cx + 28} y2={42} stroke={sc.colorBorder} strokeWidth={0.8} />
        <polygon points={`${cx},38 ${cx + 3},42 ${cx},46 ${cx - 3},42`} fill={sc.colorPrimary} opacity={0.7} />
        <rect x={cx - 16} y={50} width={32} height={2} rx={1} fill={sc.colorTextMuted} />
        <rect x={cx - 10} y={58} width={20} height={2} rx={1} fill={sc.colorPrimary} opacity={0.5} />
      </>
  }
}

function Countdown({ design, sc }: { design: string; sc: SC }) {
  const xs = [8, 35, 62, 89]
  switch (design) {
    case 'Circular':
      return <>{xs.map((bx, i) => {
        const cx = bx + 11, cy = 36, r = 13
        const arc = 2 * Math.PI * r
        const dash = arc * (0.85 - i * 0.18)
        return <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={sc.colorBorder} strokeWidth={2} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={sc.colorPrimary} strokeWidth={2}
            strokeDasharray={`${dash} ${arc}`} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`} />
          <rect x={cx - 4} y={cy - 4} width={8} height={5} rx={0.5} fill={sc.colorText} opacity={0.8} />
          <rect x={cx - 3} y={cy + 5} width={6} height={2} rx={1} fill={sc.colorTextMuted} />
        </g>
      })}</>
    case 'Elegant':
      return <>{xs.map((bx, i) => {
        const cx = bx + 11
        return <g key={i}>
          <rect x={cx - 8} y={22} width={16} height={18} rx={0.5} fill={sc.colorText} opacity={0.85} />
          <rect x={cx - 4} y={44} width={8} height={2} rx={1} fill={sc.colorTextMuted} />
          {i < xs.length - 1 && <rect x={cx + 10} y={30} width={3} height={3} rx={1} fill={sc.colorPrimary} opacity={0.5} />}
        </g>
      })}</>
    case 'Framed':
      return <>{xs.map((bx, i) => {
        const cx = bx + 11
        return <g key={i}>
          <rect x={cx - 12} y={20} width={24} height={24} rx={1} fill="none" stroke={sc.colorBorder} strokeWidth={1} />
          <rect x={cx - 9} y={23} width={18} height={18} rx={0.5} fill="none" stroke={sc.colorPrimary} strokeWidth={0.8} />
          <rect x={cx - 4} y={28} width={8} height={7} rx={0.5} fill={sc.colorText} opacity={0.8} />
          <rect x={cx - 4} y={48} width={8} height={2} rx={1} fill={sc.colorTextMuted} />
        </g>
      })}</>
    case 'Film':
      return <>
        <rect x={0} y={0} width={120} height={80} fill={sc.colorText} opacity={0.85} />
        {[10, 30, 50, 70, 90, 110].map(x => <g key={x}>
          <circle cx={x} cy={7} r={3} fill={sc.colorBackground} opacity={0.55} />
          <circle cx={x} cy={73} r={3} fill={sc.colorBackground} opacity={0.55} />
        </g>)}
        {xs.map((bx) => <g key={bx}>
          <rect x={bx} y={18} width={22} height={44} rx={1} fill={sc.colorBackground} opacity={0.12} />
          <rect x={bx + 2} y={22} width={18} height={28} rx={0.5} fill={sc.colorPrimary} opacity={0.3} />
          <rect x={bx + 4} y={55} width={10} height={2} rx={1} fill={sc.colorBackground} opacity={0.4} />
        </g>)}
      </>
    default: // Classic
      return <>{xs.map((bx, i) => {
        const cx = bx + 11
        return <g key={i}>
          <rect x={cx - 11} y={20} width={22} height={24} rx={1} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={1} />
          <rect x={cx - 5} y={26} width={10} height={10} rx={0.5} fill={sc.colorPrimary} opacity={0.65} />
          <rect x={cx - 5} y={48} width={10} height={2} rx={1} fill={sc.colorTextMuted} />
        </g>
      })}</>
  }
}

function Seating({ design, sc }: { design: string; sc: SC }) {
  switch (design) {
    case 'Ornate':
      return <>
        <rect x={14} y={8} width={92} height={64} rx={1} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={1} />
        <rect x={18} y={12} width={84} height={56} rx={0.5} fill="none" stroke={sc.colorPrimary} strokeWidth={0.8} />
        <rect x={14} y={8} width={92} height={14} rx={1} fill={sc.colorPrimary} opacity={0.18} />
        <rect x={34} y={12} width={52} height={4} rx={1} fill={sc.colorPrimary} />
        <TextLines x={28} y={32} widths={[64, 52, 58]} fill={sc.colorTextMuted} />
      </>
    case 'Postcard':
      return <>
        <rect x={6} y={18} width={108} height={44} rx={1} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={1} />
        <rect x={6} y={18} width={36} height={44} rx={1} fill={sc.colorPrimary} opacity={0.22} />
        <rect x={14} y={28} width={18} height={4} rx={1} fill={sc.colorPrimary} />
        <rect x={14} y={36} width={14} height={3} rx={1} fill={sc.colorPrimary} opacity={0.5} />
        <TextLines x={48} y={25} widths={[44, 52, 38, 46]} fill={sc.colorTextMuted} />
      </>
    case 'Badge':
      return <>
        <rect x={24} y={8} width={72} height={64} rx={2} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={1} />
        <rect x={24} y={8} width={72} height={22} rx={2} fill={sc.colorPrimary} />
        <rect x={34} y={13} width={52} height={4} rx={1} fill="white" opacity={0.9} />
        <rect x={38} y={20} width={36} height={3} rx={1} fill="white" opacity={0.55} />
        <rect x={46} y={36} width={28} height={16} rx={1} fill={sc.colorPrimary} opacity={0.2} />
        <rect x={51} y={40} width={18} height={8} rx={0.5} fill={sc.colorPrimary} opacity={0.65} />
        <TextLines x={34} y={58} widths={[52, 42]} fill={sc.colorTextMuted} />
      </>
    case 'Formal':
      return <>
        <rect x={38} y={5} width={44} height={70} rx={1} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={1} />
        <rect x={42} y={9} width={36} height={62} rx={0.5} fill="none" stroke={sc.colorPrimary} strokeWidth={0.6} />
        <rect x={48} y={16} width={24} height={2} rx={1} fill={sc.colorTextMuted} />
        <rect x={44} y={24} width={32} height={5} rx={1} fill={sc.colorText} />
        <rect x={46} y={33} width={28} height={5} rx={1} fill={sc.colorText} />
        <rect x={50} y={44} width={20} height={2} rx={1} fill={sc.colorPrimary} opacity={0.6} />
        <TextLines x={46} y={52} widths={[28, 22, 25]} fill={sc.colorTextMuted} />
      </>
    default: // Classic
      return <>
        <rect x={18} y={8} width={84} height={64} rx={1} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={1} />
        <rect x={18} y={8} width={84} height={16} rx={1} fill={sc.colorPrimary} opacity={0.2} />
        <rect x={34} y={12} width={52} height={5} rx={1} fill={sc.colorPrimary} />
        <TextLines x={28} y={34} widths={[64, 52, 58, 46]} fill={sc.colorTextMuted} />
      </>
  }
}

function Rsvp({ design, sc }: { design: string; sc: SC }) {
  switch (design) {
    case 'Card':
      return <>
        <rect x={12} y={6} width={96} height={68} rx={1} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={1} />
        <rect x={12} y={6} width={96} height={18} rx={1} fill={sc.colorPrimary} opacity={0.22} />
        <rect x={28} y={11} width={64} height={4} rx={1} fill={sc.colorPrimary} />
        <rect x={36} y={17} width={48} height={2} rx={1} fill={sc.colorPrimary} opacity={0.5} />
        <rect x={22} y={30} width={76} height={8} rx={0.5} fill="none" stroke={sc.colorBorder} strokeWidth={0.8} />
        <rect x={22} y={43} width={76} height={8} rx={0.5} fill="none" stroke={sc.colorBorder} strokeWidth={0.8} />
        <rect x={22} y={57} width={34} height={9} rx={1} fill={sc.colorPrimary} opacity={0.8} />
        <rect x={64} y={57} width={34} height={9} rx={1} fill="none" stroke={sc.colorBorder} strokeWidth={0.8} />
      </>
    case 'Minimal':
      return <>
        <rect x={20} y={20} width={80} height={1.5} rx={0.5} fill={sc.colorBorder} />
        <rect x={20} y={36} width={80} height={1.5} rx={0.5} fill={sc.colorBorder} />
        <rect x={20} y={52} width={80} height={1.5} rx={0.5} fill={sc.colorBorder} />
        <rect x={20} y={14} width={38} height={2} rx={1} fill={sc.colorTextMuted} />
        <rect x={20} y={30} width={30} height={2} rx={1} fill={sc.colorTextMuted} />
        <rect x={20} y={46} width={34} height={2} rx={1} fill={sc.colorTextMuted} />
        <rect x={20} y={62} width={26} height={2} rx={1} fill={sc.colorPrimary} />
        <rect x={54} y={62} width={26} height={2} rx={1} fill={sc.colorTextMuted} />
      </>
    case 'Envelope':
      return <>
        <polygon points="8,0 112,0 60,30" fill={sc.colorPrimary} opacity={0.18} />
        <polyline points="8,0 60,30 112,0" fill="none" stroke={sc.colorPrimary} strokeWidth={1.2} />
        <rect x={12} y={28} width={96} height={50} rx={1} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={1} />
        <rect x={22} y={36} width={76} height={7} rx={0.5} fill="none" stroke={sc.colorBorder} strokeWidth={0.8} />
        <rect x={22} y={48} width={76} height={7} rx={0.5} fill="none" stroke={sc.colorBorder} strokeWidth={0.8} />
        <rect x={22} y={61} width={34} height={9} rx={1} fill={sc.colorPrimary} opacity={0.8} />
      </>
    case 'Modern':
      return <>
        <rect x={18} y={8} width={84} height={5} rx={2.5} fill={sc.colorBorder} />
        <rect x={18} y={8} width={52} height={5} rx={2.5} fill={sc.colorPrimary} opacity={0.7} />
        {[22, 38, 54].map((y, i) => <g key={i}>
          <circle cx={28} cy={y + 6} r={5} fill={sc.colorPrimary} opacity={i === 0 ? 0.8 : 0.28} />
          <rect x={38} y={y + 4} width={42} height={3} rx={1} fill={sc.colorText} opacity={0.7} />
          <rect x={84} y={y + 3} width={14} height={5} rx={1}
            fill={i === 0 ? sc.colorPrimary : sc.colorBorder} opacity={0.6} />
        </g>)}
        <rect x={22} y={64} width={76} height={10} rx={1} fill={sc.colorPrimary} opacity={0.85} />
      </>
    default: // Classic
      return <>
        <rect x={12} y={8} width={96} height={64} rx={1} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={1} />
        <rect x={22} y={18} width={76} height={8} rx={0.5} fill="none" stroke={sc.colorBorder} strokeWidth={0.8} />
        <rect x={22} y={31} width={76} height={8} rx={0.5} fill="none" stroke={sc.colorBorder} strokeWidth={0.8} />
        <rect x={22} y={44} width={76} height={8} rx={0.5} fill="none" stroke={sc.colorBorder} strokeWidth={0.8} />
        <rect x={22} y={58} width={34} height={8} rx={1} fill={sc.colorPrimary} opacity={0.8} />
        <rect x={64} y={58} width={34} height={8} rx={1} fill="none" stroke={sc.colorBorder} strokeWidth={0.8} />
      </>
  }
}

function Schedule({ design, sc }: { design: string; sc: SC }) {
  const ys = [10, 26, 42, 58]
  switch (design) {
    case 'Cards':
      return <>
        {([[6, 8], [66, 8], [6, 46], [66, 46]] as [number, number][]).map(([x, y], i) => <g key={i}>
          <rect x={x} y={y} width={48} height={28} rx={1} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={0.8} />
          <rect x={x + 4} y={y + 5} width={26} height={3} rx={1} fill={sc.colorText} opacity={0.8} />
          <rect x={x + 4} y={y + 12} width={32} height={2} rx={1} fill={sc.colorTextMuted} />
          <rect x={x + 4} y={y + 18} width={22} height={2} rx={1} fill={sc.colorTextMuted} />
        </g>)}
      </>
    case 'Compact':
      return <>{ys.map((y, i) => <g key={i}>
        <circle cx={22} cy={y + 5} r={5} fill={sc.colorPrimary} opacity={0.7} />
        <rect x={18} y={y + 3} width={8} height={4} rx={0.5} fill="white" opacity={0.85} />
        <rect x={34} y={y + 3} width={52} height={3} rx={1} fill={sc.colorText} opacity={0.8} />
        <rect x={34} y={y + 9} width={38} height={2} rx={1} fill={sc.colorTextMuted} />
      </g>)}</>
    case 'Elegant':
      return <>{ys.map((y, i) => <g key={i}>
        <rect x={6} y={y + 1} width={26} height={8} rx={0.5} fill={sc.colorPrimary} opacity={0.15} />
        <rect x={8} y={y + 3} width={22} height={4} rx={0.5} fill={sc.colorPrimary} opacity={0.75} />
        <line x1={40} y1={y} x2={40} y2={y + 13} stroke={sc.colorBorder} strokeWidth={0.8} />
        <rect x={46} y={y + 3} width={50} height={3} rx={1} fill={sc.colorText} opacity={0.8} />
        <rect x={46} y={y + 9} width={36} height={2} rx={1} fill={sc.colorTextMuted} />
      </g>)}</>
    case 'Illustrated': {
      const colors = [sc.colorPrimary, '#e67e22', '#27ae60', '#8e44ad']
      return <>{ys.map((y, i) => <g key={i}>
        <circle cx={22} cy={y + 6} r={6} fill={colors[i]} opacity={0.55} />
        <rect x={34} y={y + 4} width={52} height={3} rx={1} fill={sc.colorText} opacity={0.8} />
        <rect x={34} y={y + 10} width={38} height={2} rx={1} fill={sc.colorTextMuted} />
      </g>)}</>
    }
    default: // Classic timeline
      return <>
        <line x1={26} y1={8} x2={26} y2={74} stroke={sc.colorBorder} strokeWidth={1.5} />
        {ys.map((y, i) => <g key={i}>
          <circle cx={26} cy={y + 5} r={4} fill={sc.colorPrimary} opacity={0.7} />
          <rect x={38} y={y + 3} width={52} height={3} rx={1} fill={sc.colorText} opacity={0.8} />
          <rect x={38} y={y + 9} width={38} height={2} rx={1} fill={sc.colorTextMuted} />
        </g>)}
      </>
  }
}

function Video({ design, sc }: { design: string; sc: SC }) {
  function PlayBtn({ cx, cy, size = 10 }: { cx: number; cy: number; size?: number }) {
    return <polygon
      points={`${cx - size * 0.45},${cy - size * 0.6} ${cx + size * 0.75},${cy} ${cx - size * 0.45},${cy + size * 0.6}`}
      fill={sc.colorPrimary} opacity={0.85} />
  }
  switch (design) {
    case 'Fullwidth':
      return <>
        <rect x={0} y={10} width={120} height={54} fill={sc.colorText} opacity={0.72} />
        <PlayBtn cx={60} cy={37} size={12} />
        <rect x={38} y={58} width={44} height={3} rx={1} fill={sc.colorText} opacity={0.5} />
        <rect x={46} y={65} width={28} height={2} rx={1} fill={sc.colorTextMuted} />
      </>
    case 'Cinema':
      return <>
        <rect x={0} y={0} width={120} height={80} fill={sc.colorText} opacity={0.85} />
        <rect x={0} y={0} width={18} height={80} fill="#4a0f0f" opacity={0.85} />
        <rect x={102} y={0} width={18} height={80} fill="#4a0f0f" opacity={0.85} />
        <rect x={0} y={0} width={120} height={10} fill="#5a1515" opacity={0.9} />
        <rect x={22} y={14} width={76} height={46} rx={1} fill={sc.colorText} opacity={0.5} />
        <PlayBtn cx={60} cy={37} size={10} />
      </>
    case 'Card':
      return <>
        <rect x={10} y={6} width={100} height={68} rx={3} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={0.8} />
        <rect x={14} y={10} width={92} height={44} rx={2} fill={sc.colorText} opacity={0.65} />
        <PlayBtn cx={60} cy={32} size={9} />
        <rect x={18} y={58} width={52} height={3} rx={1} fill={sc.colorText} opacity={0.7} />
        <rect x={18} y={65} width={36} height={2} rx={1} fill={sc.colorTextMuted} />
      </>
    case 'Floating':
      return <>
        <rect x={6} y={14} width={46} height={4} rx={1} fill={sc.colorText} opacity={0.8} />
        <rect x={6} y={22} width={38} height={3} rx={1} fill={sc.colorTextMuted} />
        <rect x={6} y={29} width={42} height={3} rx={1} fill={sc.colorTextMuted} />
        <rect x={6} y={36} width={30} height={3} rx={1} fill={sc.colorTextMuted} />
        <rect x={6} y={50} width={34} height={8} rx={1} fill={sc.colorPrimary} opacity={0.7} />
        <rect x={60} y={10} width={54} height={58} rx={2} fill={sc.colorText} opacity={0.65} />
        <PlayBtn cx={87} cy={39} size={9} />
      </>
    default: // Classic
      return <>
        <rect x={18} y={8} width={84} height={50} rx={1} fill={sc.colorText} opacity={0.65} />
        <PlayBtn cx={60} cy={33} size={10} />
        <rect x={34} y={62} width={52} height={3} rx={1} fill={sc.colorText} opacity={0.65} />
        <rect x={42} y={69} width={36} height={2} rx={1} fill={sc.colorTextMuted} />
      </>
  }
}

function Gallery({ design, sc }: { design: string; sc: SC }) {
  switch (design) {
    case 'Masonry':
      return <>
        <rect x={4} y={6} width={32} height={38} rx={1} fill={sc.colorPrimary} opacity={0.3} />
        <rect x={4} y={48} width={32} height={26} rx={1} fill={sc.colorPrimary} opacity={0.22} />
        <rect x={44} y={6} width={32} height={24} rx={1} fill={sc.colorPrimary} opacity={0.26} />
        <rect x={44} y={34} width={32} height={40} rx={1} fill={sc.colorPrimary} opacity={0.34} />
        <rect x={84} y={6} width={32} height={32} rx={1} fill={sc.colorPrimary} opacity={0.2} />
        <rect x={84} y={42} width={32} height={32} rx={1} fill={sc.colorPrimary} opacity={0.3} />
      </>
    case 'Carousel':
      return <>
        <rect x={16} y={12} width={88} height={52} rx={1} fill={sc.colorPrimary} opacity={0.22} />
        <rect x={20} y={16} width={80} height={44} rx={1} fill={sc.colorPrimary} opacity={0.18} />
        <circle cx={9} cy={38} r={7} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={0.8} />
        <polyline points="12,34 6,38 12,42" fill="none" stroke={sc.colorText} strokeWidth={1.2} />
        <circle cx={111} cy={38} r={7} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={0.8} />
        <polyline points="108,34 114,38 108,42" fill="none" stroke={sc.colorText} strokeWidth={1.2} />
        {[-6, 0, 6].map(dx => <circle key={dx} cx={60 + dx} cy={72} r={2.5}
          fill={dx === 0 ? sc.colorPrimary : sc.colorBorder} opacity={0.8} />)}
      </>
    case 'Film':
      return <>
        <rect x={0} y={0} width={120} height={80} fill={sc.colorText} opacity={0.82} />
        {[10, 30, 50, 70, 90, 110].map(x => <g key={x}>
          <circle cx={x} cy={7} r={3} fill={sc.colorBackground} opacity={0.5} />
          <circle cx={x} cy={73} r={3} fill={sc.colorBackground} opacity={0.5} />
        </g>)}
        {[8, 46, 84].map(x => <rect key={x} x={x} y={16} width={28} height={48} rx={1}
          fill={sc.colorPrimary} opacity={0.32} />)}
      </>
    case 'Polaroid':
      return <>
        {[
          { x: 4, y: 10, rot: -5 },
          { x: 42, y: 6, rot: 2 },
          { x: 78, y: 12, rot: -3 },
        ].map(({ x, y, rot }, i) => <g key={i} transform={`rotate(${rot} ${x + 17} ${y + 22})`}>
          <rect x={x} y={y} width={36} height={46} rx={1} fill="white" stroke={sc.colorBorder} strokeWidth={0.8} />
          <rect x={x + 3} y={y + 3} width={30} height={30} rx={0.5} fill={sc.colorPrimary} opacity={0.24} />
          <rect x={x + 7} y={y + 38} width={18} height={2} rx={1} fill={sc.colorTextMuted} />
        </g>)}
      </>
    default: // Classic 3×2 grid
      return <>
        {[0, 1, 2].flatMap(col => [0, 1].map(row => <rect
          key={`${col}-${row}`}
          x={col * 40 + 4} y={row * 38 + 4}
          width={36} height={34} rx={1}
          fill={sc.colorPrimary} opacity={0.18 + (col + row) * 0.06}
        />))}
      </>
  }
}

function Faq({ design, sc }: { design: string; sc: SC }) {
  const ys = [8, 24, 40, 56]
  switch (design) {
    case 'Stacked':
      return <>{ys.map((y, i) => <g key={i}>
        <rect x={6} y={y} width={108} height={14} rx={1} fill={sc.colorSurface} stroke={sc.colorBorder} strokeWidth={0.8} />
        <rect x={12} y={y + 3} width={56} height={3} rx={1} fill={sc.colorText} opacity={0.8} />
        <rect x={12} y={y + 9} width={72} height={2} rx={1} fill={sc.colorTextMuted} />
      </g>)}</>
    case 'Minimal':
      return <>{ys.map((y, i) => <g key={i}>
        <rect x={10} y={y + 2} width={56} height={3} rx={1} fill={sc.colorText} opacity={0.8} />
        <rect x={10} y={y + 8} width={80} height={2} rx={1} fill={sc.colorTextMuted} />
        {i < ys.length - 1 && <line x1={10} y1={y + 14} x2={110} y2={y + 14} stroke={sc.colorBorder} strokeWidth={0.5} />}
      </g>)}</>
    case 'Boxed':
      return <>{ys.map((y, i) => <g key={i}>
        <rect x={6} y={y} width={108} height={14} rx={1} fill="none" stroke={sc.colorBorder} strokeWidth={0.8} />
        <rect x={6} y={y} width={8} height={14} rx={1} fill={sc.colorPrimary} opacity={0.7} />
        <rect x={20} y={y + 3} width={54} height={3} rx={1} fill={sc.colorText} opacity={0.8} />
        <rect x={20} y={y + 9} width={64} height={2} rx={1} fill={sc.colorTextMuted} />
      </g>)}</>
    case 'Split':
      return <>{ys.map((y, i) => <g key={i}>
        <rect x={6} y={y + 2} width={46} height={3} rx={1} fill={sc.colorText} opacity={0.8} />
        <rect x={6} y={y + 8} width={38} height={2} rx={1} fill={sc.colorText} opacity={0.5} />
        <line x1={60} y1={y} x2={60} y2={y + 14} stroke={sc.colorBorder} strokeWidth={0.5} />
        <rect x={64} y={y + 2} width={48} height={2} rx={1} fill={sc.colorTextMuted} />
        <rect x={64} y={y + 7} width={42} height={2} rx={1} fill={sc.colorTextMuted} />
        <rect x={64} y={y + 12} width={34} height={2} rx={1} fill={sc.colorTextMuted} />
      </g>)}</>
    default: // Classic accordion
      return <>{ys.map((y, i) => <g key={i}>
        <rect x={6} y={y} width={108} height={14} rx={0.5}
          fill={i === 0 ? sc.colorSurface : 'none'} stroke={sc.colorBorder} strokeWidth={0.8} />
        <rect x={12} y={y + 5} width={62} height={3} rx={1} fill={sc.colorText} opacity={0.8} />
        <polyline points={`${106},${y + 4} ${110},${y + 7} ${106},${y + 10}`}
          fill="none" stroke={sc.colorTextMuted} strokeWidth={1.2} />
        {i === 0 && <rect x={12} y={y + 10} width={82} height={2} rx={1} fill={sc.colorTextMuted} />}
      </g>)}</>
  }
}

// ── Public component ──────────────────────────────────────────────────────────

export default function TemplatePreview({ sectionKey, designKey, colorScheme }: {
  sectionKey: string
  designKey: string
  colorScheme: string
}) {
  const sc = getColorScheme(colorScheme)

  function renderContent() {
    switch (sectionKey) {
      case 'envelope': return <Envelope design={designKey} sc={sc} />
      case 'hero':     return <Hero design={designKey} sc={sc} />
      case 'countdown': return <Countdown design={designKey} sc={sc} />
      case 'seating':  return <Seating design={designKey} sc={sc} />
      case 'rsvp':     return <Rsvp design={designKey} sc={sc} />
      case 'schedule': return <Schedule design={designKey} sc={sc} />
      case 'video':    return <Video design={designKey} sc={sc} />
      case 'gallery':  return <Gallery design={designKey} sc={sc} />
      case 'faq':      return <Faq design={designKey} sc={sc} />
      default:         return null
    }
  }

  return (
    <svg viewBox="0 0 120 80" width="120" height="80" style={{ display: 'block', borderRadius: 2 }}>
      <rect x="0" y="0" width="120" height="80" fill={sc.colorBackground} />
      {renderContent()}
    </svg>
  )
}
