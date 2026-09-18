import { ContentSection } from '../components/content-section'
import { ChangePasswordForm } from './change-password-form'

export function SettingsChangePassword() {
  return (
    <ContentSection
      title='Đổi mật khẩu'
      desc='Cập nhật mật khẩu dùng để đăng nhập vào tài khoản.'
    >
      <ChangePasswordForm />
    </ContentSection>
  )
}
