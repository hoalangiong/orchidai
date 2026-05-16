# Google Play Data Safety Form - Orchid AI

## Data Collection Summary

### Does your app collect or share any of the required user data types?
**YES**

---

## Data Types Collected

### 1. Personal Info
**Collected**: YES

#### Name
- **Collected**: YES
- **Purpose**: App functionality, Account management
- **Collection is optional**: NO (required for Google Sign-In)
- **Data is encrypted in transit**: YES
- **Users can request data deletion**: YES

#### Email address
- **Collected**: YES
- **Purpose**: App functionality, Account management
- **Collection is optional**: NO (required for Google Sign-In)
- **Data is encrypted in transit**: YES
- **Users can request data deletion**: YES

---

### 2. Photos and videos
**Collected**: YES

#### Photos
- **Collected**: YES
- **Purpose**: App functionality (disease diagnosis, community posts)
- **Collection is optional**: YES (user chooses to upload)
- **Data is encrypted in transit**: YES
- **Users can request data deletion**: YES

---

### 3. App activity
**Collected**: YES

#### App interactions
- **Collected**: YES
- **Purpose**: App functionality (orchid care logs, community posts)
- **Collection is optional**: NO (core app functionality)
- **Data is encrypted in transit**: YES
- **Users can request data deletion**: YES

---

### 4. App info and performance
**Collected**: NO
(We don't collect crash logs or diagnostics)

---

### 5. Device or other IDs
**Collected**: NO
(Firebase Auth uses tokens but doesn't expose device IDs to us)

---

## Data Sharing

### Do you share user data with third parties?
**YES**

#### Third-party services:

1. **Anthropic Claude AI**
   - **Data shared**: Photos (for disease diagnosis only)
   - **Purpose**: AI analysis for disease identification
   - **Data retention**: Not stored by us or Anthropic (processed in real-time)

2. **Firebase (Google)**
   - **Data shared**: Name, Email, Photos, Care logs, Community posts
   - **Purpose**: Authentication, Database, Cloud storage
   - **Data retention**: Until user requests deletion

3. **OpenWeather API**
   - **Data shared**: None (we only receive weather data)
   - **Purpose**: Display local weather information

---

## Data Security

### Is all user data encrypted in transit?
**YES** - All data transmitted over HTTPS/TLS

### Do you provide a way for users to request their data be deleted?
**YES** - Users can contact trananhthy@gmail.com to request account and data deletion

---

## Privacy Policy
**URL**: https://hoalangiong.tino.page/pp.html

---

## Additional Notes for Reviewers

1. **Google Sign-In**: We only collect name and email from Google OAuth. No passwords are stored.

2. **Photo Usage**: 
   - Photos are uploaded by users voluntarily for two purposes:
     - Disease diagnosis: Sent to Anthropic Claude AI API, not stored on our servers
     - Community posts: Stored in Firebase Storage, visible to other users

3. **Data Deletion Process**:
   - Users email trananhthy@gmail.com
   - We manually delete their Firebase Auth account and all associated Firestore data
   - Process completed within 7 days

4. **No Ads or Analytics**: 
   - We don't use Google Analytics, Facebook SDK, or any tracking SDKs
   - No advertising IDs collected

5. **Children's Privacy**:
   - App is not directed at children under 13
   - We don't knowingly collect data from children

---

## Quick Reference Checklist

- [x] Personal info (Name, Email) - Required for login
- [x] Photos - Optional, user-uploaded
- [x] App activity - Care logs and posts
- [ ] Location - NOT collected
- [ ] Financial info - NOT collected
- [ ] Health and fitness - NOT collected
- [ ] Messages - NOT collected
- [ ] Audio files - NOT collected
- [ ] Files and docs - NOT collected
- [ ] Calendar - NOT collected
- [ ] Contacts - NOT collected
- [x] Data encrypted in transit - YES
- [x] Users can request deletion - YES
- [x] Privacy policy provided - YES
