# Firebase Firestore 보안 규칙 설정

현재 앱에서 Firebase 연결 오류가 발생하고 있습니다. 이는 주로 Firestore 보안 규칙 때문입니다.

## 해결 방법

### 1. Firebase 콘솔 접속
- [Firebase 콘솔](https://console.firebase.google.com/)에 접속
- 프로젝트 `bloodpressuretracker-2a942` 선택

### 2. Firestore 보안 규칙 수정
Firestore > 규칙 탭에서 다음 규칙으로 변경:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 혈압 기록 컬렉션에 대한 읽기/쓰기 허용
    match /blood_pressure/{document} {
      allow read, write: if true;
    }
  }
}
```

### 3. 임시 개발용 규칙 (테스트용)
개발 중에는 모든 접근을 허용하는 규칙을 사용할 수 있습니다:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. 프로덕션용 보안 규칙 (권장)
실제 서비스에서는 더 엄격한 규칙을 사용하세요:

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

## 추가 확인사항

1. **Firebase 프로젝트 상태**: 프로젝트가 활성화되어 있는지 확인
2. **API 키**: Firebase 설정의 API 키가 올바른지 확인
3. **네트워크**: 방화벽이나 네트워크 설정으로 인한 차단 여부 확인

## 현재 앱의 개선사항

- ✅ 에러 처리 및 사용자 피드백 추가
- ✅ 로딩 상태 표시
- ✅ 성공/실패 메시지 표시
- ✅ 입력 유효성 검사
- ✅ 버튼 비활성화 상태 처리

이제 앱을 다시 테스트해보세요!
