import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import BloodPressureChart from './components/BloodPressureChart';
import BloodPressureStats from './components/BloodPressureStats';
import ScrollPicker from './components/ScrollPicker';
import './App.css';

function App() {
  const [bloodPressure, setBloodPressure] = useState([]);
  const [systolic, setSystolic] = useState(130);
  const [diastolic, setDiastolic] = useState(90);
  const [pulse, setPulse] = useState(60);
  const [recordDate, setRecordDate] = useState('');
  const [recordTime, setRecordTime] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [userName, setUserName] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [activeTab, setActiveTab] = useState('add');
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'quarter', 'year'
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

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
    const savedUserName = localStorage.getItem('bp_tracker_user_name');
    if (savedUserName) {
      setCurrentUser(savedUserName);
    }

    const now = new Date();
    setRecordDate(getFormattedDate(now));
    setRecordTime(getFormattedTime(now));
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setBloodPressure([]);
      setSystolic(130);
      setDiastolic(90);
      setPulse(60);
      setConnectionStatus('disconnected');
      return;
    }

    setLoading(true);
    setError(null);
    setConnectionStatus('checking');
    
    const q = query(collection(db, 'blood_pressure'), where("이름", "==", currentUser));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

      setBloodPressure(userData);
      setConnectionStatus('connected');
      setLoading(false);

      if (userData.length > 0) {
        const sorted = userData.sort((a, b) => {
          const dateA = a.측정시간.toDate ? a.측정시간.toDate() : new Date(a.측정시간);
          const dateB = b.측정시간.toDate ? b.측정시간.toDate() : new Date(b.측정시간);
          return dateB - dateA;
        });

        const latest = sorted[0];
        setSystolic(latest.수축기);
        setDiastolic(latest.이완기);
        setPulse(latest.맥박);
      } else {
        setSystolic(130);
        setDiastolic(90);
        setPulse(60);
      }
    }, (err) => {
      console.error('데이터 로딩 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다. Firebase 연결을 확인해주세요.');
      setConnectionStatus('error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAdd = async () => {
    if (!currentUser) {
      setError('먼저 사용자 이름을 설정해주세요.');
      return;
    }
    
    if (!recordDate || !recordTime) {
      setError('날짜와 시간을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const newTimestamp = new Date(`${recordDate}T${recordTime}`);
      await addDoc(collection(db, 'blood_pressure'), {
        '수축기': systolic,
        '이완기': diastolic,
        '맥박': pulse,
        '측정시간': newTimestamp,
        '이름': currentUser,
      });
      
      setSystolic(130);
      setDiastolic(90);
      setPulse(60);
      const now = new Date();
      setRecordDate(getFormattedDate(now));
      setRecordTime(getFormattedTime(now));
      setSuccess('혈압 기록이 성공적으로 저장되었습니다!');
      setActiveTab('records'); // Switch back to records tab
      
      // 성공 메시지를 3초 후에 자동으로 제거
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('데이터 저장 오류:', err);
      setError('데이터 저장 중 오류가 발생했습니다. Firebase 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bp) => {
    setEditingId(bp.id);
    setSystolic(bp.수축기);
    setDiastolic(bp.이완기);
    setPulse(bp.맥박);
    const bpDate = bp.측정시간.toDate();
    setRecordDate(getFormattedDate(bpDate));
    setRecordTime(getFormattedTime(bpDate));
    setActiveTab('add'); // Switch to add/edit tab
  };

  const handleUpdate = async () => {
    if (!editingId || !systolic || !diastolic || !pulse || !recordDate || !recordTime) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const newTimestamp = new Date(`${recordDate}T${recordTime}`);
      const bpRef = doc(db, 'blood_pressure', editingId);
      await updateDoc(bpRef, {
        '수축기': systolic,
        '이완기': diastolic,
        '맥박': pulse,
        '측정시간': newTimestamp,
        '이름': currentUser,
      });

      setEditingId(null);
      setSystolic(130);
      setDiastolic(90);
      setPulse(60);
      const now = new Date();
      setRecordDate(getFormattedDate(now));
      setRecordTime(getFormattedTime(now));
      setSuccess('혈압 기록이 성공적으로 업데이트되었습니다!');
      setActiveTab('records'); // Switch back to records tab
      
      // 성공 메시지를 3초 후에 자동으로 제거
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('데이터 업데이트 오류:', err);
      setError('데이터 업데이트 중 오류가 발생했습니다. Firebase 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await deleteDoc(doc(db, 'blood_pressure', id));
      setSuccess('혈압 기록이 성공적으로 삭제되었습니다!');

      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('데이터 삭제 오류:', err);
      setError('데이터 삭제 중 오류가 발생했습니다. Firebase 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSystolic(130);
    setDiastolic(90);
    setPulse(60);
    const now = new Date();
    setRecordDate(getFormattedDate(now));
    setRecordTime(getFormattedTime(now));
    setActiveTab('records'); // Switch back to records tab
  };

  const handleSetUser = () => {
    if (userName.trim()) {
      setCurrentUser(userName.trim());
      localStorage.setItem('bp_tracker_user_name', userName.trim());
      setUserName('');
      setSuccess('사용자 이름이 설정되었습니다!');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleChangeUser = () => {
    setCurrentUser('');
    localStorage.removeItem('bp_tracker_user_name');
    setSuccess('사용자가 변경되었습니다. 새로운 사용자 이름을 입력해주세요.');
    setTimeout(() => setSuccess(null), 3000);
  };

  const filteredBloodPressure = bloodPressure.filter(bp => {
    const recordDate = bp.측정시간.toDate ? bp.측정시간.toDate() : new Date(bp.측정시간);
    const now = new Date();

    if (timeRange === 'month') {
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      return recordDate >= startDate && recordDate <= endDate;
    }

    let startDate = new Date();
    if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'quarter') {
      startDate.setMonth(now.getMonth() - 3);
    } else if (timeRange === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    return recordDate >= startDate && recordDate <= now;
  });

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🩺 혈압 관리 앱</h1>
          <p>건강한 혈압 관리를 위한 개인 기록 도구</p>
          <div className="connection-status">
            {connectionStatus === 'checking' && (
              <span className="status-indicator checking">
                <span className="status-icon">🔄</span>
                Firebase 연결 확인 중...
              </span>
            )}
            {connectionStatus === 'connected' && (
              <span className="status-indicator connected">
                <span className="status-icon">✅</span>
                Firebase 연결됨
              </span>
            )}
            {connectionStatus === 'error' && (
              <span className="status-indicator error">
                <span className="status-icon">❌</span>
                Firebase 연결 오류
              </span>
            )}
          </div>
        </div>
        
        {/* 사용자 이름 섹션 */}
        <div className="user-section">
          {currentUser ? (
            <div className="current-user">
              <span className="user-icon">👤</span>
              <span className="user-name">{currentUser}</span>
              <button className="btn-change-user" onClick={handleChangeUser}>
                사용자 변경
              </button>
            </div>
          ) : (
            <div className="user-setup">
              <div className="user-input-group">
                <input
                  type="text"
                  placeholder="사용자 이름을 입력하세요"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="user-name-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleSetUser()}
                />
                <button className="btn-set-user" onClick={handleSetUser}>
                  설정
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {/* 알림 메시지 */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span className="alert-message">{error}</span>
            <button className="alert-close" onClick={() => setError(null)}>×</button>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <span className="alert-message">{success}</span>
            <button className="alert-close" onClick={() => setSuccess(null)}>×</button>
          </div>
        )}

        {/* Tab Navigation */}
        <nav className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <span className="tab-icon">📝</span>
            <span className="tab-text">기록 추가</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => setActiveTab('records')}
          >
            <span className="tab-icon">📋</span>
            <span className="tab-text">기록 목록</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-text">건강 통계</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'chart' ? 'active' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            <span className="tab-icon">📈</span>
            <span className="tab-text">혈압 추이</span>
          </button>
        </nav>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'add' && (
            <section className="input-section">
              <div className="section-header">
                <h2>{editingId ? '혈압 기록 수정' : '혈압 기록 추가'}</h2>
                <div className="section-icon">📝</div>
              </div>
              
              <div className="input-form">
                <div className="scroll-pickers-container">
                  <ScrollPicker
                    label="수축기"
                    unit="mmHg"
                    min={50}
                    max={300}
                    value={systolic}
                    onChange={setSystolic}
                    icon="❤️"
                  />
                  
                  <ScrollPicker
                    label="이완기"
                    unit="mmHg"
                    min={30}
                    max={200}
                    value={diastolic}
                    onChange={setDiastolic}
                    icon="💓"
                  />
                  
                  <ScrollPicker
                    label="심박수"
                    unit="bpm"
                    min={30}
                    max={200}
                    value={pulse}
                    onChange={setPulse}
                    icon="💗"
                  />
                </div>
                
                <div className="input-bottom-row">
                  <div className="datetime-inputs">
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
                  </div>
                  
                  <div className="button-group">
                    {editingId ? (
                      <>
                        <button 
                          className="btn-primary" 
                          onClick={handleUpdate}
                          disabled={loading}
                        >
                          <span className="btn-icon">{loading ? '⏳' : '💾'}</span>
                          {loading ? '업데이트 중...' : '업데이트'}
                        </button>
                        <button 
                          className="btn-secondary" 
                          onClick={handleCancelEdit}
                          disabled={loading}
                        >
                          <span className="btn-icon">❌</span>
                          취소
                        </button>
                      </>
                    ) : (
                      <button 
                        className="btn-primary" 
                        onClick={handleAdd}
                        disabled={loading}
                      >
                        <span className="btn-icon">{loading ? '⏳' : '➕'}</span>
                        {loading ? '저장 중...' : '기록 저장'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'stats' && (
            <section className="stats-section">
              <div className="section-header">
                <h2>건강 통계</h2>
                <div className="section-icon">📊</div>
              </div>
              <div className="time-range-selector">
                <button onClick={() => setTimeRange('week')} className={timeRange === 'week' ? 'active' : ''}>주간</button>
                <button onClick={() => setTimeRange('month')} className={timeRange === 'month' ? 'active' : ''}>월간</button>
                <button onClick={() => setTimeRange('quarter')} className={timeRange === 'quarter' ? 'active' : ''}>분기별</button>
                <button onClick={() => setTimeRange('year')} className={timeRange === 'year' ? 'active' : ''}>연도별</button>
              </div>
              {timeRange === 'month' && (
                <div className="month-selector">
                  <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                </div>
              )}
              <BloodPressureStats data={filteredBloodPressure} />
            </section>
          )}

          {activeTab === 'chart' && (
            <section className="chart-section">
              <div className="section-header">
                <h2>혈압 추이</h2>
                <div className="section-icon">📈</div>
              </div>
              <div className="time-range-selector">
                <button onClick={() => setTimeRange('week')} className={timeRange === 'week' ? 'active' : ''}>주간</button>
                <button onClick={() => setTimeRange('month')} className={timeRange === 'month' ? 'active' : ''}>월간</button>
                <button onClick={() => setTimeRange('quarter')} className={timeRange === 'quarter' ? 'active' : ''}>분기별</button>
                <button onClick={() => setTimeRange('year')} className={timeRange === 'year' ? 'active' : ''}>연도별</button>
              </div>
              {timeRange === 'month' && (
                <div className="month-selector">
                  <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                </div>
              )}
              <BloodPressureChart data={filteredBloodPressure} />
            </section>
          )}

          {activeTab === 'records' && (
            <section className="records-section">
              <div className="section-header">
                <h2>기록 목록</h2>
                <div className="section-icon">📋</div>
              </div>
              
              {bloodPressure.length > 0 ? (
                <div className="records-list">
                  {bloodPressure
                    .sort((a, b) => {
                      const dateA = a.측정시간.toDate ? a.측정시간.toDate() : new Date(a.측정시간);
                      const dateB = b.측정시간.toDate ? b.측정시간.toDate() : new Date(b.측정시간);
                      return dateB - dateA;
                    })
                    .map((bp) => (
                    <div key={bp.id} className="record-card">
                      <div className="record-main">
                        <div className="record-values">
                          <div className="blood-pressure">
                            <span className="systolic">{bp.수축기}</span>
                            <span className="separator">/</span>
                            <span className="diastolic">{bp.이완기}</span>
                            <span className="unit">mmHg</span>
                          </div>
                          <div className="pulse">
                            <span className="pulse-value">{bp.맥박}</span>
                            <span className="unit">bpm</span>
                          </div>
                        </div>
                        <div className="record-time">
                          {formatTimestamp(bp.측정시간)}
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
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDelete(bp.id)}
                          title="삭제"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>아직 기록이 없습니다</h3>
                  <p>'기록 추가' 탭에서 첫 번째 혈압 기록을 추가해보세요!</p>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>건강한 혈압 관리를 위해 정기적으로 측정하세요 💙</p>
      </footer>
    </div>
  );
}

export default App;
