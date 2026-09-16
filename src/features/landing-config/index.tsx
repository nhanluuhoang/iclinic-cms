import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Globe2, Image, Palette, Save, Search, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { getLandingConfig, updateLandingConfig, type LandingConfig } from './api'

const emptyConfig: LandingConfig = {
  branding: { name: '', tagline: '', logoUrl: '', primaryColor: '#176B5B', accentColor: '#B77B35' },
  hero: { title: '', highlightedText: '', description: '', imageUrl: '' },
  doctor: { name: '', specialty: '', description: '', imageUrl: '' },
  services: [],
  booking: { workingHours: '', slots: [] },
  contact: { phone: '', address: '', mapUrl: '' },
  seo: { title: '', description: '' },
}

function Section({ icon: Icon, title, description, children }: { icon: typeof Palette; title: string; description: string; children: React.ReactNode }) {
  return <Card><CardHeader className='border-b bg-muted/20'><div className='flex gap-3'><span className='flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary'><Icon className='size-5'/></span><div><CardTitle className='text-base'>{title}</CardTitle><CardDescription>{description}</CardDescription></div></div></CardHeader><CardContent className='grid gap-5 pt-6 md:grid-cols-2'>{children}</CardContent></Card>
}

function Field({ label, value, onChange, placeholder, wide }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; wide?: boolean }) {
  return <div className={`space-y-2 ${wide ? 'md:col-span-2' : ''}`}><Label>{label}</Label><Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder}/></div>
}

export function LandingConfigPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['landing-config'], queryFn: getLandingConfig })
  const [config, setConfig] = useState(emptyConfig)
  const [isPublished, setIsPublished] = useState(false)
  useEffect(() => { if (data) { setConfig({ ...emptyConfig, ...data.config } as LandingConfig); setIsPublished(data.isPublished) } }, [data])
  const mutation = useMutation({ mutationFn: updateLandingConfig, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['landing-config'] }); toast.success('Đã lưu cấu hình landing page') }, onError: () => toast.error('Không thể lưu cấu hình landing page') })
  const set = <K extends keyof LandingConfig>(group: K, key: keyof LandingConfig[K], value: string | string[]) => setConfig((current) => ({ ...current, [group]: { ...current[group], [key]: value } }))
  if (isLoading) return <Main className='mx-auto w-full max-w-4xl'><p className='text-sm text-muted-foreground'>Đang tải cấu hình...</p></Main>
  return <><Header fixed><div className='ms-auto flex items-center gap-3'><ThemeSwitch/><ProfileDropdown/></div></Header><Main className='mx-auto w-full max-w-4xl space-y-6'><div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'><div><h2 className='text-2xl font-bold tracking-tight'>Landing page phòng khám</h2><p className='text-muted-foreground'>Tùy chỉnh nội dung và giao diện hiển thị cho tenant hiện tại.</p></div><div className='flex items-center gap-3 rounded-lg border p-3'><div><Label htmlFor='published'>Công khai landing page</Label><p className='text-xs text-muted-foreground'>Chỉ bản đã công khai mới xuất hiện với khách hàng.</p></div><Switch id='published' checked={isPublished} onCheckedChange={setIsPublished}/></div></div><div className='w-full space-y-5'>
   <Section icon={Palette} title='Thương hiệu' description='Tên, logo và màu sắc nhận diện của phòng khám.'><Field label='Tên phòng khám' value={config.branding.name} onChange={(v)=>set('branding','name',v)}/><Field label='Thông điệp ngắn' value={config.branding.tagline} onChange={(v)=>set('branding','tagline',v)}/><Field label='URL logo' value={config.branding.logoUrl} onChange={(v)=>set('branding','logoUrl',v)}/><div className='grid grid-cols-2 gap-3'><Field label='Màu chính' value={config.branding.primaryColor} onChange={(v)=>set('branding','primaryColor',v)}/><Field label='Màu nhấn' value={config.branding.accentColor} onChange={(v)=>set('branding','accentColor',v)}/></div></Section>
   <Section icon={Image} title='Hero' description='Nội dung đầu tiên khách hàng nhìn thấy.'><Field label='Tiêu đề' value={config.hero.title} onChange={(v)=>set('hero','title',v)}/><Field label='Dòng nổi bật' value={config.hero.highlightedText} onChange={(v)=>set('hero','highlightedText',v)}/><Field label='URL ảnh hero' value={config.hero.imageUrl} onChange={(v)=>set('hero','imageUrl',v)} wide/><div className='space-y-2 md:col-span-2'><Label>Mô tả</Label><Textarea value={config.hero.description} onChange={(e)=>set('hero','description',e.target.value)}/></div></Section>
   <Section icon={Stethoscope} title='Bác sĩ phụ trách' description='Phù hợp cho phòng khám có một bác sĩ.'><Field label='Tên bác sĩ' value={config.doctor.name} onChange={(v)=>set('doctor','name',v)}/><Field label='Chuyên khoa' value={config.doctor.specialty} onChange={(v)=>set('doctor','specialty',v)}/><Field label='URL ảnh bác sĩ' value={config.doctor.imageUrl} onChange={(v)=>set('doctor','imageUrl',v)} wide/><div className='space-y-2 md:col-span-2'><Label>Giới thiệu</Label><Textarea value={config.doctor.description} onChange={(e)=>set('doctor','description',e.target.value)}/></div></Section>
   <Section icon={Globe2} title='Dịch vụ và đặt lịch' description='Mỗi dịch vụ hoặc khung giờ nằm trên một dòng.'><div className='space-y-2'><Label>Dịch vụ</Label><Textarea rows={6} value={config.services.join('\n')} onChange={(e)=>setConfig((c)=>({...c,services:e.target.value.split('\n')}))}/></div><div className='space-y-2'><Label>Khung giờ</Label><Textarea rows={6} value={config.booking.slots.join('\n')} onChange={(e)=>set('booking','slots',e.target.value.split('\n'))}/></div><Field label='Giờ làm việc' value={config.booking.workingHours} onChange={(v)=>set('booking','workingHours',v)} wide/></Section>
   <Section icon={Globe2} title='Liên hệ' description='Thông tin khách hàng dùng để tìm và liên hệ phòng khám.'><Field label='Số điện thoại' value={config.contact.phone} onChange={(v)=>set('contact','phone',v)}/><Field label='Địa chỉ' value={config.contact.address} onChange={(v)=>set('contact','address',v)}/><Field label='URL Google Maps' value={config.contact.mapUrl} onChange={(v)=>set('contact','mapUrl',v)} wide/></Section>
   <Section icon={Search} title='SEO' description='Thông tin hiển thị trên công cụ tìm kiếm.'><Field label='Tiêu đề SEO' value={config.seo.title} onChange={(v)=>set('seo','title',v)}/><Field label='Mô tả SEO' value={config.seo.description} onChange={(v)=>set('seo','description',v)}/></Section>
   <div className='sticky bottom-4 flex justify-end rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur'><Button disabled={mutation.isPending} onClick={()=>mutation.mutate({config:{...config,services:config.services.filter(Boolean),booking:{...config.booking,slots:config.booking.slots.filter(Boolean)}},isPublished})}><Save/>{mutation.isPending?'Đang lưu...':'Lưu cấu hình'}</Button></div>
  </div></Main></>
}
