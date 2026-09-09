import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Minus, Pill, Plus, Save, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  CreateMasterData,
  GetMasterDatas,
  UpdateMasterData,
  type MasterData as MasterDataItem,
} from './api'

const CONSULTATION_FEE_KEY = 'CONSULTATION_FEE'
const SHOW_MEDICINES_TO_PATIENT_KEY = 'SHOW_MEDICINES_TO_PATIENT'
const MEDICINE_INSTRUCTION_OPTIONS_KEY = 'MEDICINE_INSTRUCTION_OPTIONS'
const DEFAULT_MEDICINE_INSTRUCTIONS = [
  'Uống trước ăn',
  'Uống sau ăn',
  'Uống trong bữa ăn',
  'Uống vào buổi sáng',
  'Uống vào buổi tối',
  'Uống khi cần',
  'Ngậm dưới lưỡi',
  'Bôi ngoài da',
]

function SettingHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Stethoscope
  title: string
  description: string
}) {
  return (
    <CardHeader className='flex flex-row items-start gap-3 space-y-0 border-b bg-muted/20'>
      <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
        <Icon className='size-5' />
      </div>
      <div className='space-y-1'>
        <CardTitle className='text-base'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
    </CardHeader>
  )
}

function MasterDataForm({
  consultationFeeItem,
  showMedicinesItem,
  defaultAdviceItem,
}: {
  consultationFeeItem?: MasterDataItem
  showMedicinesItem?: MasterDataItem
  defaultAdviceItem?: MasterDataItem
}) {
  const queryClient = useQueryClient()
  const [value, setValue] = useState(consultationFeeItem?.value ?? '0')
  const [showMedicines, setShowMedicines] = useState(
    showMedicinesItem?.value !== 'false'
  )
  const [adviceOptions, setAdviceOptions] = useState<string[]>(() => {
    const options = (defaultAdviceItem?.value ?? '')
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean)
    return options.length ? options : DEFAULT_MEDICINE_INSTRUCTIONS
  })
  const [savingKeys, setSavingKeys] = useState<string[]>([])

  const saveSetting = async (
    item: MasterDataItem | undefined,
    key: string,
    settingValue: string
  ) => {
    setSavingKeys((current) => [...current, key])
    try {
      const data = { key, value: settingValue }
      await (item ? UpdateMasterData(item.id, data) : CreateMasterData(data))
      await queryClient.invalidateQueries({ queryKey: ['master-data'] })
      toast.success('Đã lưu cài đặt')
    } catch (error) {
      toast.error('Không lưu được cài đặt', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setSavingKeys((current) => current.filter((item) => item !== key))
    }
  }

  const saveConsultationFee = () => {
    const fee = Number(value)
    if (!Number.isFinite(fee) || fee < 0) {
      toast.error('Giá khám bệnh không hợp lệ')
      return
    }
    void saveSetting(consultationFeeItem, CONSULTATION_FEE_KEY, String(fee))
  }

  const saveInstructions = () => {
    const instructions = adviceOptions
      .map((item) => item.trim())
      .filter(Boolean)
      .join('\n')
    void saveSetting(
      defaultAdviceItem,
      MEDICINE_INSTRUCTION_OPTIONS_KEY,
      instructions
    )
  }

  return (
    <div className='space-y-5'>
      <Card className='overflow-hidden'>
        <SettingHeading
          icon={Stethoscope}
          title='Giá khám bệnh'
          description='Mức phí mặc định được sử dụng khi lập phiếu khám.'
        />
        <CardContent className='space-y-5 pt-6'>
          <div className='max-w-md space-y-2'>
            <Label htmlFor='consultation-fee'>Số tiền</Label>
            <div className='relative'>
              <Input
                id='consultation-fee'
                className='pr-16'
                type='number'
                min={0}
                step={1000}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder='Nhập giá khám bệnh'
              />
              <span className='absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground'>
                VNĐ
              </span>
            </div>
          </div>
          <div className='flex justify-end border-t pt-4'>
            <Button
              type='button'
              disabled={savingKeys.includes(CONSULTATION_FEE_KEY)}
              onClick={saveConsultationFee}
            >
              <Save />{' '}
              {savingKeys.includes(CONSULTATION_FEE_KEY)
                ? 'Đang lưu...'
                : 'Lưu'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className='overflow-hidden'>
        <SettingHeading
          icon={Eye}
          title='Hồ sơ online của bệnh nhân'
          description='Kiểm soát thông tin thuốc mà bệnh nhân có thể xem.'
        />
        <CardContent className='space-y-5 pt-6'>
          <label
            htmlFor='show-medicines-to-patient'
            className='flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/30'
          >
            <Checkbox
              id='show-medicines-to-patient'
              className='mt-0.5'
              checked={showMedicines}
              onCheckedChange={(checked) => setShowMedicines(checked === true)}
            />
            <span className='grid gap-1'>
              <span className='text-sm font-medium'>
                Hiển thị danh sách thuốc
              </span>
              <span className='text-sm text-muted-foreground'>
                Khi bật, bệnh nhân có thể xem thuốc trong hồ sơ khám online.
              </span>
            </span>
          </label>
          <div className='flex justify-end border-t pt-4'>
            <Button
              type='button'
              disabled={savingKeys.includes(SHOW_MEDICINES_TO_PATIENT_KEY)}
              onClick={() =>
                void saveSetting(
                  showMedicinesItem,
                  SHOW_MEDICINES_TO_PATIENT_KEY,
                  String(showMedicines)
                )
              }
            >
              <Save />{' '}
              {savingKeys.includes(SHOW_MEDICINES_TO_PATIENT_KEY)
                ? 'Đang lưu...'
                : 'Lưu'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className='overflow-hidden'>
        <SettingHeading
          icon={Pill}
          title='Hướng dẫn sử dụng thuốc'
          description='Các lựa chọn có sẵn trong dropdown khi bác sĩ kê toa.'
        />
        <CardContent className='space-y-3 pt-6'>
          {adviceOptions.map((option, index) => (
            <div key={index} className='flex items-center gap-2'>
              <span className='w-6 shrink-0 text-right text-sm text-muted-foreground'>
                {index + 1}.
              </span>
              <Input
                id={index === 0 ? 'default-advice' : undefined}
                value={option}
                onChange={(event) =>
                  setAdviceOptions((current) =>
                    current.map((item, optionIndex) =>
                      optionIndex === index ? event.target.value : item
                    )
                  )
                }
                placeholder={`Hướng dẫn ${index + 1}`}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                disabled={adviceOptions.length === 1}
                onClick={() =>
                  setAdviceOptions((current) =>
                    current.filter((_, optionIndex) => optionIndex !== index)
                  )
                }
                aria-label={`Xóa hướng dẫn ${index + 1}`}
              >
                <Minus className='size-4' />
              </Button>
            </div>
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='ml-8'
            onClick={() => setAdviceOptions((current) => [...current, ''])}
          >
            <Plus className='size-4' /> Thêm hướng dẫn
          </Button>
          <div className='flex justify-end border-t pt-4'>
            <Button
              type='button'
              disabled={savingKeys.includes(MEDICINE_INSTRUCTION_OPTIONS_KEY)}
              onClick={saveInstructions}
            >
              <Save />{' '}
              {savingKeys.includes(MEDICINE_INSTRUCTION_OPTIONS_KEY)
                ? 'Đang lưu...'
                : 'Lưu'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function MasterData() {
  const { data, isLoading } = useQuery({
    queryKey: ['master-data'],
    queryFn: () => GetMasterDatas({ page: 1 }),
  })
  const consultationFeeItem = data?.data.find(
    (row) => row.key === CONSULTATION_FEE_KEY
  )
  const showMedicinesItem = data?.data.find(
    (row) => row.key === SHOW_MEDICINES_TO_PATIENT_KEY
  )
  const defaultAdviceItem = data?.data.find(
    (row) => row.key === MEDICINE_INSTRUCTION_OPTIONS_KEY
  )

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex flex-1 flex-col gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Cấu hình</h2>
          <p className='text-muted-foreground'>
            Thiết lập các giá trị mặc định của phòng khám.
          </p>
        </div>
        <div className='w-full max-w-3xl'>
          {isLoading ? (
            <p className='text-sm text-muted-foreground'>
              Đang tải cấu hình...
            </p>
          ) : (
            <MasterDataForm
              key={`${consultationFeeItem?.value ?? '0'}:${showMedicinesItem?.value ?? 'true'}:${defaultAdviceItem?.value ?? ''}`}
              consultationFeeItem={consultationFeeItem}
              showMedicinesItem={showMedicinesItem}
              defaultAdviceItem={defaultAdviceItem}
            />
          )}
        </div>
      </Main>
    </>
  )
}
