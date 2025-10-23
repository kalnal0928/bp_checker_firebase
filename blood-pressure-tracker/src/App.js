import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import BloodPressureChart from './components/BloodPressureChart';
import BloodPressureStats from './components/BloodPressureStats';
import './App.css';

function App() {
  const [bloodPressure, setBloodPressure] = useState([]);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [recordTime, setRecordTime] = useState('');
  const [editingId, setEditingId] = useState(null);

  const formatTimestamp = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString();
    } else if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    return '';
  };

  const getFormattedDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFormattedTime = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'blood_pressure'));
      setBloodPressure(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    fetchData();

    const now = new Date();
    setRecordDate(getFormattedDate(now));
    setRecordTime(getFormattedTime(now));
  }, []);

  const handleAdd = async () => {
    if (systolic && diastolic && pulse && recordDate && recordTime) {
      const newTimestamp = new Date(`${recordDate}T${recordTime}`);
      const docRef = await addDoc(collection(db, 'blood_pressure'), {
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: Number(pulse),
        timestamp: newTimestamp,
      });
      setBloodPressure([...bloodPressure, { id: docRef.id, systolic: Number(systolic), diastolic: Number(diastolic), pulse: Number(pulse), timestamp: newTimestamp }]);
      setSystolic('');
      setDiastolic('');
      setPulse('');
      const now = new Date();
      setRecordDate(getFormattedDate(now));
      setRecordTime(getFormattedTime(now));
    }
  };

  const handleEdit = (bp) => {
    setEditingId(bp.id);
    setSystolic(bp.systolic);
    setDiastolic(bp.diastolic);
    setPulse(bp.pulse);
    const bpDate = bp.timestamp.toDate();
    setRecordDate(getFormattedDate(bpDate));
    setRecordTime(getFormattedTime(bpDate));
  };

  const handleUpdate = async () => {
    if (editingId && systolic && diastolic && pulse && recordDate && recordTime) {
      const newTimestamp = new Date(`${recordDate}T${recordTime}`);
      const bpRef = doc(db, 'blood_pressure', editingId);
      await updateDoc(bpRef, {
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: Number(pulse),
        timestamp: newTimestamp,
      });

      setBloodPressure(bloodPressure.map(bp => 
        bp.id === editingId ? { ...bp, systolic: Number(systolic), diastolic: Number(diastolic), pulse: Number(pulse), timestamp: newTimestamp } : bp
      ));
      setEditingId(null);
      setSystolic('');
      setDiastolic('');
      setPulse('');
      const now = new Date();
      setRecordDate(getFormattedDate(now));
      setRecordTime(getFormattedTime(now));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSystolic('');
    setDiastolic('');
    setPulse('');
    const now = new Date();
    setRecordDate(getFormattedDate(now));
    setRecordTime(getFormattedTime(now));
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🩺 혈압 관리 앱</h1>
          <p>건강한 혈압 관리를 위한 개인 기록 도구</p>
        </div>
      </header>

      <main className="app-main">
        {/* 입력 섹션 */}
        <section className="input-section">
          <div className="section-header">
            <h2>혈압 기록 추가</h2>
            <div className="section-icon">📝</div>
          </div>
          
          <div className="input-form">
            <div className="input-group">
              <label htmlFor="systolic">수축기 혈압 (mmHg)</label>
              <input
                id="systolic"
                type="number"
                placeholder="120"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                min="50"
                max="300"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="diastolic">이완기 혈압 (mmHg)</label>
              <input
                id="diastolic"
                type="number"
                placeholder="80"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                min="30"
                max="200"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="pulse">맥박 (bpm)</label>
              <input
                id="pulse"
                type="number"
                placeholder="72"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                min="30"
                max="200"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="date">측정 날짜</label>
              <input
                id="date"
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="time">측정 시간</label>
              <input
                id="time"
                type="time"
                value={recordTime}
                onChange={(e) => setRecordTime(e.target.value)}
              />
            </div>
            
            <div className="button-group">
              {editingId ? (
                <>
                  <button className="btn-primary" onClick={handleUpdate}>
                    <span className="btn-icon">💾</span>
                    업데이트
                  </button>
                  <button className="btn-secondary" onClick={handleCancelEdit}>
                    <span className="btn-icon">❌</span>
                    취소
                  </button>
                </>
              ) : (
                <button className="btn-primary" onClick={handleAdd}>
                  <span className="btn-icon">➕</span>
                  기록 저장
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 통계 섹션 */}
        <section className="stats-section">
          <div className="section-header">
            <h2>건강 통계</h2>
            <div className="section-icon">📊</div>
          </div>
          <BloodPressureStats data={bloodPressure} />
        </section>

        {/* 차트 섹션 */}
        <section className="chart-section">
          <div className="section-header">
            <h2>혈압 추이</h2>
            <div className="section-icon">📈</div>
          </div>
          <BloodPressureChart data={bloodPressure} />
        </section>

        {/* 기록 목록 섹션 */}
        <section className="records-section">
          <div className="section-header">
            <h2>기록 목록</h2>
            <div className="section-icon">📋</div>
          </div>
          
          {bloodPressure.length > 0 ? (
            <div className="records-list">
              {bloodPressure
                .sort((a, b) => {
                  const dateA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
                  const dateB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
                  return dateB - dateA;
                })
                .map((bp) => (
                <div key={bp.id} className="record-card">
                  <div className="record-main">
                    <div className="record-values">
                      <div className="blood-pressure">
                        <span className="systolic">{bp.systolic}</span>
                        <span className="separator">/</span>
                        <span className="diastolic">{bp.diastolic}</span>
                        <span className="unit">mmHg</span>
                      </div>
                      <div className="pulse">
                        <span className="pulse-value">{bp.pulse}</span>
                        <span className="unit">bpm</span>
                      </div>
                    </div>
                    <div className="record-time">
                      {formatTimestamp(bp.timestamp)}
                    </div>
                  </div>
                  <div className="record-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(bp)}
                      title="수정"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>아직 기록이 없습니다</h3>
              <p>위의 폼을 사용하여 첫 번째 혈압 기록을 추가해보세요!</p>
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>건강한 혈압 관리를 위해 정기적으로 측정하세요 💙</p>
      </footer>
    </div>
  );
}

export default App;
