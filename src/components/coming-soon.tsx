import { Telescope } from 'lucide-react'

export function ComingSoon() {
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <Telescope size={72} />
        <h1 className='text-4xl leading-tight font-bold'>Sắp ra mắt!</h1>
        <p className='text-center text-muted-foreground'>
          Trang này đang được xây dựng. <br />
          Vui lòng quay lại sau.
        </p>
      </div>
    </div>
  )
}
