import { useEffect } from 'react'
import { Check, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Tên ngôn ngữ luôn viết bằng chính ngôn ngữ đó (endonym) — không dịch, để
 * người đang thấy giao diện sai ngôn ngữ vẫn nhận ra dòng mình cần bấm.
 */
const languages = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
]

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  // Dùng resolvedLanguage chứ không phải language: LanguageDetector đọc từ
  // navigator nên có thể trả về 'en-US' / 'vi-VN'. So 'en-US' với 'en' sẽ không
  // khớp và dấu tích không bao giờ hiện.
  const current = i18n.resolvedLanguage

  /* Đồng bộ <html lang> để screen reader đọc đúng ngữ điệu.
   * index.html hard-code lang="en" nên không tự đổi theo. */
  useEffect(() => {
    if (current) document.documentElement.lang = current
  }, [current])

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='scale-95 rounded-full'>
          <Languages className='size-[1.2rem]' />
          <span className='sr-only'>{t('language.switch')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {languages.map((lng) => (
          <DropdownMenuItem
            key={lng.code}
            onClick={() => i18n.changeLanguage(lng.code)}
          >
            {lng.label}
            <Check
              size={14}
              className={cn('ms-auto', current !== lng.code && 'hidden')}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
