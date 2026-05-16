# Google Play Store Submission Checklist

## ✅ Completed
- [x] Feature graphic (1024x500px) - `resources/feature-graphic.png`
- [x] App icon (512x512px) - `resources/icon-512.png`
- [x] Privacy policy page - https://hoalangiong.tino.page/pp.html
- [x] Code changes committed and pushed
- [x] GitHub Actions building AAB with JDK 21

## 🔄 In Progress
- [ ] Wait for GitHub Actions build to complete
- [ ] Download AAB from GitHub Actions artifacts

## 📋 To Do

### 1. Download AAB
- Go to https://github.com/hoalangiong/orchidai/actions
- Click on latest successful run
- Download `app-release.aab` from artifacts

### 2. Create Screenshots (Phone - at least 2 required)
Need 2-8 screenshots, recommended size: 1080x1920px (9:16 ratio)
Suggested screens to capture:
- Login page with Google sign-in
- Orchid garden list with plants
- Plant detail with care schedule
- AI disease diagnosis feature
- Community posts page

### 3. Google Play Console - Store Listing
- **App name**: Orchid AI (or your preferred name)
- **Short description** (80 chars max): Quản lý vườn lan thông minh với AI chẩn đoán bệnh
- **Full description** (4000 chars max): Write detailed description
- **App icon**: Upload `resources/icon-512.png`
- **Feature graphic**: Upload `resources/feature-graphic.png`
- **Screenshots**: Upload 2-8 phone screenshots
- **App category**: Lifestyle or Productivity
- **Tags**: gardening, orchid, AI, plant care
- **Contact email**: trananhthy@gmail.com
- **Privacy policy URL**: https://hoalangiong.tino.page/pp.html

### 4. Data Safety Form
Declare what data you collect:
- **Location**: No
- **Personal info**: Yes (Name, Email from Google Sign-In)
- **Photos**: Yes (User uploads for diagnosis and posts)
- **App activity**: Yes (Orchid care logs, community posts)
- **Data sharing**: Yes (with Anthropic Claude AI for diagnosis)
- **Data encryption**: Yes (Firebase)
- **Data deletion**: Users can request deletion via trananhthy@gmail.com

### 5. Content Rating
Answer questionnaire honestly:
- Violence: No
- Sexual content: No
- Profanity: No
- Controlled substances: No
- User-generated content: Yes (community posts)
- User interaction: Yes (community features)
- Personal info sharing: Yes (Google Sign-In)

### 6. App Content
- **Target audience**: Adults (18+)
- **Content guidelines**: Compliant
- **Ads**: No (if you don't have ads)

### 7. Release - Production
- Upload AAB file
- Release name: v1.0.0
- Release notes (Vietnamese & English):
  ```
  🌿 Phiên bản đầu tiên của Orchid AI
  - Quản lý vườn lan cá nhân
  - Lịch chăm sóc thông minh
  - Chẩn đoán bệnh bằng AI
  - Cộng đồng yêu lan
  - Hỗ trợ 5 ngôn ngữ: Tiếng Việt, English, 中文, ไทย, Indonesia
  ```

### 8. Submit for Review
- Review all sections for completeness
- Click "Send for review"
- Wait 1-7 days for Google review

## 📝 Notes
- First submission usually takes 3-7 days
- Make sure all required fields are filled
- Test the app thoroughly before submitting
- Keep trananhthy@gmail.com accessible for Google verification emails
