import React, { useState, useRef, useEffect, useMemo } from 'react';
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

  const values = useMemo(() => 
    Array.from({ length: max - min + 1 }, (_, i) => min + i), 
    [min, max]
  );

  // 값이 변경될 때 스크롤 위치 업데이트 ( 외부 요인에 의한 변경 )
  useEffect(() => {
    if (containerRef.current && !isScrolling) {
      const targetIndex = values.indexOf(value);
      if (targetIndex !== -1) {
        const targetScrollTop = targetIndex * itemHeight;
        // 현재 스크롤 위치와 목표 위치가 다를 경우에만 부드럽게 이동
        if (containerRef.current.scrollTop !== targetScrollTop) {
          containerRef.current.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [value, isScrolling, values]);

  // 스크롤 종료 (스냅 효과 및 값 변경)
  const handleScrollEnd = () => {
    setIsScrolling(false);
    
    if (!containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const targetScrollTop = index * itemHeight;
    
    const newValue = values[index];
    if (newValue !== undefined && newValue !== value) {
      onChange(newValue);
    }
    
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
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = () => {
    setIsScrolling(true);
  };

  const scrollEndTimer = useRef(null);
  const handleUserScroll = () => {
    if (scrollEndTimer.current) {
      clearTimeout(scrollEndTimer.current);
    }
    scrollEndTimer.current = setTimeout(handleScrollEnd, 150);
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
          onScroll={handleUserScroll}
          onTouchStart={handleTouchStart}
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
