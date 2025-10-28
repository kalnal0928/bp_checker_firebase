import React from 'react';
import { classifyBloodPressure } from '../utils/bloodPressureUtils';

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
    const itemDate = item.측정시간.toDate ? item.측정시간.toDate() : new Date(item.측정시간);
    return itemDate >= sevenDaysAgo;
  });

  // 평균 계산
  const avgSystolic = recentData.length > 0 
    ? Math.round(recentData.reduce((sum, item) => sum + item.수축기, 0) / recentData.length)
    : 0;
  
  const avgDiastolic = recentData.length > 0 
    ? Math.round(recentData.reduce((sum, item) => sum + item.이완기, 0) / recentData.length)
    : 0;
  
  const avgPulse = recentData.length > 0 
    ? Math.round(recentData.reduce((sum, item) => sum + item.맥박, 0) / recentData.length)
    : 0;

  // 최고/최저값 계산
  const maxSystolic = recentData.length > 0 ? Math.max(...recentData.map(item => item.수축기)) : 0;
  const minSystolic = recentData.length > 0 ? Math.min(...recentData.map(item => item.수축기)) : 0;
  const maxDiastolic = recentData.length > 0 ? Math.max(...recentData.map(item => item.이완기)) : 0;
  const minDiastolic = recentData.length > 0 ? Math.min(...recentData.map(item => item.이완기)) : 0;

  // 혈압 상태 분석
  const getStatusDetails = (classification) => {
    switch (classification) {
      case "정상 혈압":
        return { status: classification, color: "#2ecc71", icon: "✓" };
      case "주의 혈압":
        return { status: classification, color: "#f39c12", icon: "⚠" };
      case "1기 고혈압":
        return { status: classification, color: "#e67e22", icon: "⚠" };
      case "2기 고혈압":
        return { status: classification, color: "#e74c3c", icon: "⚠" };
      case "고혈압 위기":
        return { status: classification, color: "#c0392b", icon: "🚨" };
      default:
        return { status: "분류 불가", color: "#7f8c8d", icon: "?" };
    }
  };

  const bloodPressureClassification = classifyBloodPressure(avgSystolic, avgDiastolic);
  const currentStatus = getStatusDetails(bloodPressureClassification);

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
                `${recentData[recentData.length - 1].수축기}/${recentData[recentData.length - 1].이완기}` : 
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

