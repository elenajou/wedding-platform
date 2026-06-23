import { revalidatePath } from 'next/cache'

export function revalidateWeddingPages(locales: string[]): void {
  for (const lang of locales) {
    revalidatePath(`/${lang}`)
    revalidatePath(`/${lang}/invitation`)
  }
}
