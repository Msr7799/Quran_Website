// src/components/AudioPlayer/AyahHighlight.jsx - مكون تمييز الآيات أثناء التشغيل

import React, { useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

const HighlightContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  '& .ayah-highlight': {
    position: 'absolute',
    backgroundColor: 'rgba(255, 235, 59, 0.4)',
    border: '2px solid #FFC107',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    pointerEvents: 'none',
    zIndex: 10,
  },
  '& .ayah-highlight.active': {
    backgroundColor: 'rgba(255, 193, 7, 0.6)',
    boxShadow: '0 0 10px rgba(255, 193, 7, 0.8)',
  }
}));

/**
 * مكون تمييز الآيات أثناء التشغيل الصوتي
 * يقوم بتمييز الآية الحالية على الصفحة أو النص
 */
const AyahHighlight = ({ 
  currentAyah, 
  ayahTimings = [], 
  svgRef, 
  textRef,
  highlightMode = 'svg' // 'svg' | 'text'
}) => {
  const highlightRef = useRef(null);

  // تمييز الآية على SVG
  const highlightAyahOnSVG = (ayahNumber, polygon) => {
    if (!svgRef?.current) return;
    
    // إزالة التمييز السابق
    const previousHighlights = svgRef.current.querySelectorAll('.ayah-highlight');
    previousHighlights.forEach(el => el.remove());
    
    // إنشاء تمييز جديد
    if (polygon) {
      const svgElement = svgRef.current.querySelector('svg');
      if (svgElement) {
        const highlightElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        highlightElement.setAttribute('points', polygon);
        highlightElement.setAttribute('class', 'ayah-highlight active');
        highlightElement.setAttribute('fill', 'rgba(255, 235, 59, 0.4)');
        highlightElement.setAttribute('stroke', '#FFC107');
        highlightElement.setAttribute('stroke-width', '2');
        highlightElement.setAttribute('data-ayah', ayahNumber);
        
        svgElement.appendChild(highlightElement);
      }
    }
  };

  // تمييز الآية في النص
  const highlightAyahInText = (ayahNumber) => {
    if (!textRef?.current) return;
    
    // إزالة التمييز السابق
    const previousHighlights = textRef.current.querySelectorAll('.ayah-highlight');
    previousHighlights.forEach(el => {
      el.classList.remove('ayah-highlight', 'active');
    });
    
    // تمييز الآية الحالية
    const ayahElement = textRef.current.querySelector(`[data-ayah="${ayahNumber}"]`);
    if (ayahElement) {
      ayahElement.classList.add('ayah-highlight', 'active');
      
      // التمرير إلى الآية
      ayahElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // تحديث التمييز عند تغيير الآية الحالية
  useEffect(() => {
    if (!currentAyah || !ayahTimings.length) return;
    
    const currentAyahData = ayahTimings.find(timing => timing.ayah === currentAyah);
    
    if (currentAyahData) {
      if (highlightMode === 'svg' && currentAyahData.polygon) {
        highlightAyahOnSVG(currentAyah, currentAyahData.polygon);
      } else if (highlightMode === 'text') {
        highlightAyahInText(currentAyah);
      }
    }
  }, [currentAyah, ayahTimings, highlightMode, svgRef, textRef]);

  // تنظيف التمييز عند إلغاء تحميل المكون
  useEffect(() => {
    return () => {
      if (svgRef?.current) {
        const highlights = svgRef.current.querySelectorAll('.ayah-highlight');
        highlights.forEach(el => el.remove());
      }
      
      if (textRef?.current) {
        const highlights = textRef.current.querySelectorAll('.ayah-highlight');
        highlights.forEach(el => {
          el.classList.remove('ayah-highlight', 'active');
        });
      }
    };
  }, [svgRef, textRef]);

  return (
    <HighlightContainer ref={highlightRef}>
      {/* يمكن إضافة عناصر UI إضافية هنا إذا لزم الأمر */}
    </HighlightContainer>
  );
};

export default AyahHighlight;
