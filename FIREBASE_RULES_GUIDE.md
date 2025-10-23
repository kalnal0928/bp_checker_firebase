# Firebase Firestore 보안 규칙 변경 가이드

## 🚀 CLI 방법 (권장)

### 1. Firebase CLI 로그인
터미널에서 다음 명령어를 실행하고 웹 브라우저에서 로그인하세요:

```bash
firebase login
```

로그인 과정에서 "Enable Gemini in Firebase features?" 질문이 나오면 `n`을 입력하세요.

### 2. 프로젝트 설정
```bash
firebase use bloodpressuretracker-2a942
```

### 3. Firestore 규칙 배포
```bash
firebase deploy --only firestore:rules
```

## 🌐 웹 콘솔 방법 (대안)

### 1. Firebase 콘솔 접속
- [Firebase 콘솔](https://console.firebase.google.com/) 접속
- 프로젝트 `bloodpressuretracker-2a942` 선택

### 2. Firestore 규칙 수정
- 왼쪽 메뉴에서 "Firestore Database" 클릭
- "규칙" 탭 클릭
- 다음 규칙으로 교체:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 혈압 기록 컬렉션에 대한 읽기/쓰기 허용
    match /blood_pressure/{document} {
      allow read, write: if true;
    }
    
    // 다른 모든 문서에 대해서는 접근 거부
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. 규칙 게시
- "게시" 버튼 클릭

## 📁 생성된 파일들

- `firestore.rules`: Firestore 보안 규칙 파일
- `firebase.json`: Firebase 프로젝트 설정 파일
- `firestore.indexes.json`: Firestore 인덱스 설정 파일

## ✅ 규칙 변경 후 확인사항

1. 앱을 새로고침하여 연결 상태 확인
2. 혈압 기록 추가 테스트
3. 에러 메시지가 사라지는지 확인

## 🔒 보안 고려사항

현재 규칙은 개발용으로 모든 접근을 허용합니다. 프로덕션 환경에서는 더 엄격한 규칙을 사용하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /blood_pressure/{document} {
      // 인증된 사용자만 접근 허용
      allow read, write: if request.auth != null;
    }
  }
}
```
