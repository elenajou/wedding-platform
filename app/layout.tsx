import { headers } from 'next/headers'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers()
  const lang = h.get('x-lang') ?? 'en'
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  )
}
