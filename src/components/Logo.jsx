// src/components/Logo.jsx - مكون اللوجو الخاص بالموقع
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Logo = ({
  size = 60,
  showText = false,
  className = "",
  href = "/",
  priority = true
}) => {

  return (
    <>
      <Link href={href} className={`logo-container ${className}`}>
      <div className="logo-wrapper">
        {/* صورة اللوجو */}
        <div className="logo-image">
            <Image
              src="/alf.png"
              alt="ألم - موقع القرآن الكريم"
              width={size}
              height={size}
              priority={priority}
              className="logo-img"
            />
          </div>

          {/* النص الاختياري */}
          {showText && (
            <span className="logo-text">ألم</span>
          )}
        </div>
      </Link>

      <style jsx>{`
        .logo-container {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logo-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-image {
          position: relative;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: #fafafa; /* سموك وايت - أبيض مائل للرمادي قليلاً */
          border: 3px solid #000000; /* بوردر أسود */
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }





        .logo-image:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          animation-play-state: paused; /* إيقاف الأنيميشن عند التمرير */
        }

        :global(.logo-img) {
          width: ${size * 0.7}px !important;
          height: ${size * 0.7}px !important;
          object-fit: contain;
          transition: all 0.3s ease;
        }

        .logo-text {
          font-family: 'Amiri', 'Traditional Arabic', serif;
          font-size: ${size * 0.3}px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          transition: color 0.3s ease;
        }

        .logo-container:hover .logo-text {
          color: var(--primary-color);
        }

        /* تحسينات للوضع المظلم */
        [data-theme="dark"] .logo-image {
          background: #f8f8f8; /* يبقى فاتح في الوضع المظلم للتباين */
          border-color: #ffffff;
        }

        [data-theme="dark"] .logo-text {
          color: var(--text-primary);
        }

        /* تحسينات للشاشات الصغيرة */
        @media (max-width: 768px) {
          .logo-image {
            width: ${Math.max(size * 0.8, 40)}px;
            height: ${Math.max(size * 0.8, 40)}px;
            border-width: 2px;
          }

          :global(.logo-img) {
            width: ${Math.max(size * 0.6, 28)}px !important;
            height: ${Math.max(size * 0.6, 28)}px !important;
          }

          .logo-text {
            font-size: ${Math.max(size * 0.25, 12)}px;
          }
        }

        /* تحسينات للطباعة */
        @media print {
          .logo-image {
            background: white;
            border-color: black;
          }
        }



        /* تحسين الأداء */
        .logo-container {
          will-change: transform;
        }

        .logo-image {
          will-change: transform, box-shadow;
        }

        /* تحسين للحركة المنخفضة */
        @media (prefers-reduced-motion: reduce) {
          .logo-image.shake-active {
            animation: none !important; /* إيقاف أنيميشن الهزة */
          }

          .logo-container,
          .logo-image,
          :global(.logo-img),
          .logo-text {
            transition: none !important;
          }

          .logo-image:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  );
};

export default Logo;
