import { ContentSection } from '../components/content-section'
import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  return (
    <ContentSection
      title='Hồ sơ cá nhân'
      desc='Xem và cập nhật thông tin tài khoản của bạn.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
