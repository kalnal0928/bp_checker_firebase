import React, { useState } from 'react';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase'; // Assuming firebase.js is in the parent directory

function MigrationPage({ user, setError, setSuccess, setLoading }) {
  const [migrationName, setMigrationName] = useState('');

  const handleMigrate = async () => {
    if (!migrationName) {
      setError('이전 사용자 이름을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const q = query(collection(db, 'blood_pressure'), where("이름", "==", migrationName));
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { uid: user.uid });
      });
      await batch.commit();

      setSuccess('데이터 마이그레이션이 완료되었습니다.');
      setMigrationName('');

      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('데이터 마이그레이션 오류:', err);
      setError('데이터 마이그레이션 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="migration-section-page">
      <div className="section-header">
        <h2>데이터 마이그레이션</h2>
        <div className="section-icon">🔄</div>
      </div>
      <div className="migration-content">
        <p>이전 계정의 혈압 기록을 현재 로그인된 계정으로 이전합니다. 이전할 계정의 사용자 이름을 입력해주세요.</p>
        <div className="migration-input-group">
          <input
            type="text"
            placeholder="이전 사용자 이름 입력"
            value={migrationName}
            onChange={(e) => setMigrationName(e.target.value)}
            className="migration-input"
          />
          <button
            className="btn-migrate-page"
            onClick={handleMigrate}
          >
            데이터 마이그레이션 시작
          </button>
        </div>
      </div>
    </section>
  );
}

export default MigrationPage;
