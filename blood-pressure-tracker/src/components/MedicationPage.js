import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, where } from 'firebase/firestore';
import './MedicationPage.css';

const MedicationPage = ({ user }) => {
  const [medicationName, setMedicationName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [medications, setMedications] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'medications'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const meds = [];
      querySnapshot.forEach((doc) => {
        meds.push({ id: doc.id, ...doc.data() });
      });
      setMedications(meds);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    if (!medicationName || !startDate) {
      alert('약 이름과 시작 날짜를 모두 입력해주세요.');
      return;
    }

    try {
      await addDoc(collection(db, 'medications'), {
        name: medicationName,
        startDate,
        uid: user.uid,
      });
      setMedicationName('');
      setStartDate('');
      alert('복용 정보가 저장되었습니다.');
    } catch (error) {
      console.error('Error saving medication: ', error);
      alert('복용 정보 저장에 실패했습니다.');
    }
  };

  return (
    <div className="medication-page">
      <h2>복용 약 정보</h2>
      <div className="medication-form">
        <div className="input-group">
          <label htmlFor="medication-name">약 이름</label>
          <input
            id="medication-name"
            type="text"
            value={medicationName}
            onChange={(e) => setMedicationName(e.target.value)}
            placeholder="예: 고혈압약"
          />
        </div>
        <div className="input-group">
          <label htmlFor="start-date">시작 날짜</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <button className="btn-save" onClick={handleSave}>
          저장
        </button>
      </div>

      <div className="medication-list">
        <h3>복용 약 목록</h3>
        {medications.map((med) => (
          <div key={med.id} className="medication-item">
            <span>{med.name}</span>
            <span>{med.startDate}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicationPage;
