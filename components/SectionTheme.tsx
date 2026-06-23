'use client'

import { useMemo } from 'react'
import { getColorScheme, getSectionCSSVars } from '@/themes/color-schemes'

type SectionCfg = {
  colorScheme?: string
  fontColor?: string
}

type Props = {
  sectionCfg?: SectionCfg
  children: React.ReactNode
}

export default function SectionTheme({ sectionCfg, children }: Props) {
  const cssVars = useMemo(() => {
    if (!sectionCfg?.colorScheme) return {}
    return getSectionCSSVars(getColorScheme(sectionCfg.colorScheme))
  }, [sectionCfg?.colorScheme])

  return <div style={cssVars as React.CSSProperties}>{children}</div>
}
