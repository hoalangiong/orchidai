import { useTranslation } from 'react-i18next';

export default function PrivacyPolicyPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';

  if (!isVi) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-xs text-gray-400 mb-6">Last updated: May 15, 2026</p>

        <section className="space-y-5 text-sm text-gray-700 leading-relaxed">
          <div>
            <h2 className="font-bold text-gray-900 mb-1">1. Information We Collect</h2>
            <p>When you sign in with Google, we collect your name, email address, and profile photo. We also store orchid garden data you enter (plant names, care schedules, photos, notes) in Firebase Firestore linked to your account.</p>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 mb-1">2. How We Use Your Information</h2>
            <ul className="list-disc pl-4 space-y-1">
              <li>To provide and sync your orchid garden data across devices</li>
              <li>To send care reminder notifications (only if you enable them)</li>
              <li>To analyze orchid disease photos using AI (images are sent to our AI service and not stored)</li>
              <li>To display community posts you choose to share</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 mb-1">3. Data Sharing</h2>
            <p>We do not sell your personal data. We use the following third-party services:</p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li><strong>Firebase (Google)</strong> — authentication, database, push notifications</li>
              <li><strong>Anthropic Claude AI</strong> — disease diagnosis from photos</li>
              <li><strong>Open Weather API</strong> — local weather data</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 mb-1">4. Camera & Storage</h2>
            <p>The app requests camera and storage permissions solely to let you photograph your orchids for disease diagnosis and community posts. Photos are not stored on our servers.</p>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 mb-1">5. Data Retention & Deletion</h2>
            <p>Your data is stored as long as your account is active. To delete your account and all associated data, contact us at <strong>trananhthy@gmail.com</strong>.</p>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 mb-1">6. Children's Privacy</h2>
            <p>This app is not directed at children under 13. We do not knowingly collect data from children.</p>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 mb-1">7. Contact</h2>
            <p>For privacy questions: <strong>trananhthy@gmail.com</strong></p>
            <p className="mt-1">Developer: Hoalangiong.com — Ho Chi Minh City, Vietnam</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Chính sách Bảo mật</h1>
      <p className="text-xs text-gray-400 mb-6">Cập nhật lần cuối: 15/05/2026</p>

      <section className="space-y-5 text-sm text-gray-700 leading-relaxed">
        <div>
          <h2 className="font-bold text-gray-900 mb-1">1. Thông tin chúng tôi thu thập</h2>
          <p>Khi bạn đăng nhập bằng Google, chúng tôi thu thập tên, địa chỉ email và ảnh đại diện của bạn. Chúng tôi cũng lưu trữ dữ liệu vườn lan bạn nhập (tên cây, lịch chăm sóc, ảnh, ghi chú) trên Firebase Firestore gắn với tài khoản của bạn.</p>
        </div>
        <div>
          <h2 className="font-bold text-gray-900 mb-1">2. Cách chúng tôi sử dụng thông tin</h2>
          <ul className="list-disc pl-4 space-y-1">
            <li>Cung cấp và đồng bộ dữ liệu vườn lan của bạn trên các thiết bị</li>
            <li>Gửi thông báo nhắc nhở chăm sóc (chỉ khi bạn bật tính năng này)</li>
            <li>Phân tích ảnh bệnh lan bằng AI (ảnh được gửi đến dịch vụ AI và không được lưu trữ)</li>
            <li>Hiển thị bài đăng cộng đồng bạn chọn chia sẻ</li>
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-gray-900 mb-1">3. Chia sẻ dữ liệu</h2>
          <p>Chúng tôi không bán dữ liệu cá nhân của bạn. Chúng tôi sử dụng các dịch vụ bên thứ ba sau:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Firebase (Google)</strong> — xác thực, cơ sở dữ liệu, thông báo đẩy</li>
            <li><strong>Anthropic Claude AI</strong> — chẩn đoán bệnh từ ảnh</li>
            <li><strong>Open Weather API</strong> — dữ liệu thời tiết địa phương</li>
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-gray-900 mb-1">4. Camera & Bộ nhớ</h2>
          <p>Ứng dụng yêu cầu quyền camera và bộ nhớ chỉ để cho phép bạn chụp ảnh lan để chẩn đoán bệnh và đăng bài cộng đồng. Ảnh không được lưu trữ trên máy chủ của chúng tôi.</p>
        </div>
        <div>
          <h2 className="font-bold text-gray-900 mb-1">5. Lưu trữ & Xóa dữ liệu</h2>
          <p>Dữ liệu của bạn được lưu trữ miễn là tài khoản còn hoạt động. Để xóa tài khoản và toàn bộ dữ liệu, liên hệ: <strong>trananhthy@gmail.com</strong></p>
        </div>
        <div>
          <h2 className="font-bold text-gray-900 mb-1">6. Trẻ em</h2>
          <p>Ứng dụng này không dành cho trẻ em dưới 13 tuổi. Chúng tôi không cố ý thu thập dữ liệu từ trẻ em.</p>
        </div>
        <div>
          <h2 className="font-bold text-gray-900 mb-1">7. Liên hệ</h2>
          <p>Mọi thắc mắc về quyền riêng tư: <strong>trananhthy@gmail.com</strong></p>
          <p className="mt-1">Nhà phát triển: Hoalangiong.com — TP. Hồ Chí Minh, Việt Nam</p>
        </div>
      </section>
    </div>
  );
}
