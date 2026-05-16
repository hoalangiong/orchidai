# Hướng dẫn Build Android App với GitHub Actions

## Bước 1: Push code lên GitHub

```bash
cd C:\Users\Dell Precision 5560\orchid-farm-v2
git init
git add .
git commit -m "Initial commit with Android build setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/orchid-farm-v2.git
git push -u origin main
```

## Bước 2: Thêm GitHub Secrets

Vào repository trên GitHub → Settings → Secrets and variables → Actions → New repository secret

Thêm 4 secrets sau:

### 1. KEYSTORE_BASE64
- Mở file: `android/keystore.base64.txt`
- Copy toàn bộ nội dung
- Paste vào Value

### 2. KEYSTORE_PASSWORD
```
OrchidAI2026!
```

### 3. KEY_PASSWORD
```
OrchidAI2026!
```

### 4. KEY_ALIAS
```
orchid-ai
```

## Bước 3: Chạy GitHub Actions

Sau khi push code và thêm secrets:
1. Vào tab "Actions" trên GitHub
2. Chọn workflow "Build Android APK/AAB"
3. Click "Run workflow"
4. Đợi khoảng 5-10 phút
5. Download APK/AAB từ Artifacts

## File output

- **app-release.aab** - Dùng để submit lên Google Play Store
- **app-release.apk** - Dùng để test hoặc phát hành trực tiếp

## Lưu ý

- File keystore (`orchid-ai-release.keystore`) rất quan trọng, backup cẩn thận
- Mật khẩu keystore: `OrchidAI2026!`
- Không được mất keystore, nếu mất sẽ không thể update app trên Google Play
