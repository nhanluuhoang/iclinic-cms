import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMasterData } from './master-data-provider'

export function MasterDataPrimaryButtons() {
  const { setOpen } = useMasterData()
  return (
    <div className='flex gap-2'>
      <Button className='gap-2' onClick={() => setOpen('create')}>
        <Plus size={18} />
        <span>Create</span>
      </Button>
    </div>
  )
}
