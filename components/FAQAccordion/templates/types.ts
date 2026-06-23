export type FAQItem = { question: string; answer: string }

export type FAQTemplateProps = {
  coordinatorEmail?: string
  coordinatorName?: string
  lang: string
  dict: {
    sectionLabel: string
    contactLabel: string
    contactText: string
    items: FAQItem[]
    close: string
  }
  onBack?: () => void
}
