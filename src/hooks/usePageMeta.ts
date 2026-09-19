import { useEffect } from 'react'

const defaultDescription = 'ocekyWT — современная витрина аккаунтов War Thunder с подробными характеристиками и переходом на FunPay.'

export function usePageMeta(title: string, description = defaultDescription) {
  useEffect(() => {
    document.title = title
    const descriptionTag = document.querySelector('meta[name="description"]')
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDescription = document.querySelector('meta[property="og:description"]')
    descriptionTag?.setAttribute('content', description)
    ogTitle?.setAttribute('content', title)
    ogDescription?.setAttribute('content', description)
  }, [title, description])
}
