import React from 'react';

const BloodPressureStats = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="stats-container">
        <h3>통계 정보</h3>
        <p>기록이 없어 통계를 표시할 수 없습니다.</p>
      </div>
    );
  }

  // 최근 7일 데이터 필터링
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentData = data.filter(item => {
    const itemDate = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
    return itemDate >= sevenDaysAgo;
  });

  // 평균 계산
  const avgSystolic = recentData.length > 0 
    ? Math.round(recentData.reduce((sum, item) => sum + item.systolic, 0) / recentData.length)
    : 0;
  
  const avgDiastolic = recentData.length > 0 
    ? Math.round(recentData.reduce((sum, item) => sum + item.diastolic, 0) / recentData.length)
    : 0;
  
  const avgPulse = recentData.length > 0 
    ? Math.round(recentData.reduce((sum, item) => sum + item.pulse, 0) / recentData.length)
    : 0;

  // 최고/최저값 계산
  const maxSystolic = recentData.length > 0 ? Math.max(...recentData.map(item => item.systolic)) : 0;
  const minSystolic = recentData.length > 0 ? Math.min(...recentData.map(item => item.systolic)) : 0;
  const maxDiastolic = recentData.length > 0 ? Math.max(...recentData.map(item => item.diastolic)) : 0;
  const minDiastolic = recentData.length > 0 ? Math.min(...recentData.map(item => item.diastolic)) : 0;

  // 혈압 상태 분석
  const getBloodPressureStatus = (systolic, diastolic) => {
    if (systolic < 120 && diastolic < 80) {
      return { status: '정상', color: '#2ecc71', icon: '✓' };
    } else if (systolic < 130 && diastolic < 80) {
      return { status: '고혈압 전단계', color: '#f39c12', icon: '⚠' };
    } else if (systolic < 140 || diastolic < 90) {
      return { status: '고혈압 1단계', color: '#e67e22', icon: '⚠' };
    } else if (systolic < 180 || diastolic < 120) {
      return { status: '고혈압 2단계', color: '#e74c3c', icon: '⚠' };
    } else {
      return { status: '고혈압 위기', color: '#c0392b', icon: '🚨' };
    }
  };

  const currentStatus = getBloodPressureStatus(avgSystolic, avgDiastolic);

  return (
    <div className="stats-container">
      <h3>최근 7일 통계</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h4>평균 혈압</h4>
            <div className="status-badge" style={{ backgroundColor: currentStatus.color }}>
              <span className="status-icon">{currentStatus.icon}</span>
              <span className="status-text">{currentStatus.status}</span>
            </div>
          </div>
          <div className="stat-value">
            <span className="systolic">{avgSystolic}</span>
            <span className="separator">/</span>
            <span className="diastolic">{avgDiastolic}</span>
            <span className="unit">mmHg</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h4>평균 맥박</h4>
          </div>
          <div className="stat-value">
            <span className="pulse">{avgPulse}</span>
            <span className="unit">bpm</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h4>수축기 혈압 범위</h4>
          </div>
          <div className="stat-value">
            <span className="range">{minSystolic} - {maxSystolic}</span>
            <span className="unit">mmHg</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h4>이완기 혈압 범위</h4>
          </div>
          <div className="stat-value">
            <span className="range">{minDiastolic} - {maxDiastolic}</span>
            <span className="unit">mmHg</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h4>총 기록 수</h4>
          </div>
          <div className="stat-value">
            <span className="count">{recentData.length}</span>
            <span className="unit">회</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h4>최근 기록</h4>
          </div>
          <div className="stat-value">
            <span className="latest">
              {recentData.length > 0 ? 
                `${recentData[recentData.length - 1].systolic}/${recentData[recentData.length - 1].diastolic}` : 
                '-'
              }
            </span>
            <span className="unit">mmHg</span>
          </div>
        </div>
      </div>

      <div className="health-tips">
        <h4>건강 팁</h4>
        <ul>
          <li>정기적인 혈압 측정으로 건강 상태를 모니터링하세요</li>
          <li>고혈압이 지속되면 의사와 상담하세요</li>
          <li>규칙적인 운동과 건강한 식단을 유지하세요</li>
          <li>스트레스 관리와 충분한 수면을 취하세요</li>
        </ul>
      </div>
    </div>
  );
};

export default BloodPressureStats;
