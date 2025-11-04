import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import './MedicationPage.css';

const MedicationPage = ({ user }) => {
  const [medicationName, setMedicationName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [medications, setMedications] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  const handleAdd = async () => {
    if (!medicationName || !startDate) {
      alert('약 이름과 시작 날짜를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await addDoc(collection(db, 'medications'), {
        name: medicationName,
        startDate,
        uid: user.uid,
      });
      setMedicationName('');
      setStartDate('');
      setSuccess('복용 정보가 저장되었습니다.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving medication: ', error);
      setError('복용 정보 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (med) => {
    setEditingId(med.id);
    setMedicationName(med.name);
    setStartDate(med.startDate);
  };

  const handleUpdate = async () => {
    if (!medicationName || !startDate) {
      alert('약 이름과 시작 날짜를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const medRef = doc(db, 'medications', editingId);
      await updateDoc(medRef, {
        name: medicationName,
        startDate,
      });
      setEditingId(null);
      setMedicationName('');
      setStartDate('');
      setSuccess('복용 정보가 업데이트되었습니다.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating medication: ', error);
      setError('복용 정보 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await deleteDoc(doc(db, 'medications', id));
      setSuccess('복용 정보가 삭제되었습니다.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting medication: ', error);
      setError('복용 정보 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setMedicationName('');
    setStartDate('');
  };

  return (
    <div className="medication-page">
      <h2>복용 약 정보</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
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
        {editingId ? (
          <>
            <button className="btn-update" onClick={handleUpdate} disabled={loading}>
              {loading ? '업데이트 중...' : '업데이트'}
            </button>
            <button className="btn-cancel" onClick={handleCancelEdit} disabled={loading}>
              취소
            </button>
          </>
        ) : (
          <button className="btn-save" onClick={handleAdd} disabled={loading}>
            {loading ? '저장 중...' : '저장'}
          </button>
        )}
      </div>

      <div className="medication-list">
        <h3>복용 약 목록</h3>
        {medications.length === 0 && !loading && <p>등록된 복용 약이 없습니다.</p>}
        {medications.map((med) => (
          <div key={med.id} className="medication-item">
            <span>{med.name}</span>
            <span>{med.startDate}</span>
            <div className="medication-actions">
              <button className="btn-edit" onClick={() => handleEdit(med)}>수정</button>
              <button className="btn-delete" onClick={() => handleDelete(med.id)}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicationPage;
