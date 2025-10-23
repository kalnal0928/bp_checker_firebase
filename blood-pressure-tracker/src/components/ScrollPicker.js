import React, { useState, useRef, useEffect } from 'react';
import './ScrollPicker.css';

const ScrollPicker = ({ 
  label, 
  unit, 
  min = 0, 
  max = 300, 
  value, 
  onChange, 
  icon 
}) => {
  const containerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const itemHeight = 50; // 각 항목의 높이
  const visibleItems = 5; // 보이는 항목 수

  // 값 범위에 따른 배열 생성
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  // 현재 선택된 값의 인덱스
  const currentIndex = values.indexOf(value);

  // 스크롤 위치 계산
  const scrollTop = currentIndex * itemHeight;

  useEffect(() => {
    if (containerRef.current && !isScrolling) {
      containerRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop, isScrolling]);

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const newValue = Math.max(min, Math.min(max, values[index]));
    
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  // 스크롤 시작
  const handleScrollStart = () => {
    setIsScrolling(true);
  };

  // 스크롤 종료 (스냅 효과)
  const handleScrollEnd = () => {
    setIsScrolling(false);
    
    if (!containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const targetScrollTop = index * itemHeight;
    
    // 부드럽게 스냅
    containerRef.current.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  };

  // 휠 이벤트 (데스크톱용)
  const handleWheel = (e) => {
    e.preventDefault();
    
    if (!containerRef.current) return;
    
    const delta = e.deltaY > 0 ? 1 : -1;
    const newValue = Math.max(min, Math.min(max, value + delta));
    onChange(newValue);
    
    // 스크롤 위치 업데이트
    const newIndex = values.indexOf(newValue);
    const targetScrollTop = newIndex * itemHeight;
    
    containerRef.current.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = () => {
    setIsScrolling(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      setIsScrolling(false);
      handleScrollEnd();
    }, 150);
  };

  return (
    <div className="scroll-picker-container">
      <div className="picker-header">
        <span className="picker-icon">{icon}</span>
        <div className="picker-label-group">
          <div className="picker-label">{label}</div>
          <div className="picker-unit">{unit}</div>
        </div>
      </div>
      
      <div className="scroll-picker-wrapper">
        <div 
          className="scroll-picker"
          ref={containerRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          style={{ height: itemHeight * visibleItems }}
        >
          <div className="picker-items" style={{ paddingTop: itemHeight * 2, paddingBottom: itemHeight * 2 }}>
            {values.map((val, index) => (
              <div
                key={val}
                className={`picker-item ${val === value ? 'selected' : ''}`}
                style={{ height: itemHeight }}
              >
                {val}
              </div>
            ))}
          </div>
        </div>
        
        <div className="picker-selection-indicator"></div>
        <div className="picker-gradient-top"></div>
        <div className="picker-gradient-bottom"></div>
      </div>
    </div>
  );
};

export default ScrollPicker;
