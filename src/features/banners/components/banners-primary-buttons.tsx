import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBanners } from './banners-provider'

export function BannersPrimaryButtons() {
  const { setOpen } = useBanners()
  return (
    <div className='flex gap-2'>
      <Button className='gap-2' onClick={() => setOpen('create')}>
        <span>Create</span>
        <Plus size={18} />
      </Button>
    </div>
  )
}
