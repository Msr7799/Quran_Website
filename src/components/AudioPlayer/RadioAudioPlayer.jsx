// ===================================
// src/components/AudioPlayer/RadioAudioPlayer.jsx - مشغل الإذاعة المتطور
// ===================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Radio, 
  SkipForward, 
  SkipBack, 
  ChevronDown,
  Heart,
  Share,
  RotateCcw
} from 'lucide-react';

const RadioAudioPlayer = ({ radios = [] }) => {
  const [currentRadio, setCurrentRadio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const audioRef = useRef(null);
  const dropdownRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.addEventListener('loadstart', () => setIsConnecting(true));
      audioRef.current.addEventListener('canplay', () => setIsConnecting(false));
      audioRef.current.addEventListener('error', handleAudioError);
      audioRef.current.addEventListener('timeupdate', updateTime);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('error', handleAudioError);
        audioRef.current.removeEventListener('timeupdate', updateTime);
      }
    };
  }, []);

  // Set initial radio if radios available
  useEffect(() => {
    if (radios.length > 0 && !currentRadio) {
      setCurrentRadio(radios[0]);
    }
  }, [radios, currentRadio]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAudioError = () => {
    setError('خطأ في تحميل الإذاعة');
    setIsPlaying(false);
    setIsLoading(false);
    setIsConnecting(false);
  };

  const updateTime = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const togglePlay = async () => {
    if (!currentRadio || !audioRef.current) return;

    try {
      setError(null);
      setIsLoading(true);

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Load new source if changed
        if (audioRef.current.src !== currentRadio.url) {
          audioRef.current.src = currentRadio.url;
        }
        
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      handleAudioError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRadioChange = (radio) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setCurrentRadio(radio);
    setIsPlaying(false);
    setError(null);
    setIsDropdownOpen(false);
    
    // Auto play new radio
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = radio.url;
        togglePlay();
      }
    }, 100);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const playNext = () => {
    const currentIndex = radios.findIndex(radio => radio.id === currentRadio?.id);
    const nextIndex = (currentIndex + 1) % radios.length;
    handleRadioChange(radios[nextIndex]);
  };

  const playPrevious = () => {
    const currentIndex = radios.findIndex(radio => radio.id === currentRadio?.id);
    const prevIndex = currentIndex === 0 ? radios.length - 1 : currentIndex - 1;
    handleRadioChange(radios[prevIndex]);
  };

  const toggleFavorite = () => {
    if (!currentRadio) return;
    
    const isFav = favorites.includes(currentRadio.id);
    if (isFav) {
      setFavorites(favorites.filter(id => id !== currentRadio.id));
    } else {
      setFavorites([...favorites, currentRadio.id]);
    }
  };

  const retry = () => {
    setError(null);
    togglePlay();
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return '--:--';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!radios.length) {
    return (
      <div className="radio-player-container">
        <div className="no-radios">
          <Radio className="radio-icon" />
          <p>لا توجد إذاعات متاحة</p>
        </div>
        
        <style jsx>{`
          .radio-player-container {
            background: linear-gradient(135deg,rgb(49, 53, 74) 0%,rgb(52, 53, 79) 100%);
            border-radius: 20px;
            padding: 20px;
            color: white;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          }
          
          .no-radios {
            text-align: center;
            padding: 40px 20px;
          }
          
          .radio-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 16px;
            opacity: 0.7;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="radio-player-container">
      <audio ref={audioRef} preload="none" />
      
      {/* Header */}
      <div className="radio-header">
        <div className="radio-info">
          <Radio className="radio-main-icon" />
          <div className="radio-details">
            <h3 className="radio-title">إذاعة القرآن الكريم</h3>
            <p className="radio-subtitle">استمع للقرآن الكريم مباشرة</p>
          </div>
        </div>
        
        <div className="radio-actions">
          <button 
            className={`favorite-btn ${favorites.includes(currentRadio?.id) ? 'active' : ''}`}
            onClick={toggleFavorite}
            title="إضافة للمفضلة"
          >
            <Heart />
          </button>
          <button className="share-btn" title="مشاركة">
            <Share />
          </button>
        </div>
      </div>

      {/* Current Radio Display */}
      <div className="current-radio">
        <div className="radio-wave-animation">
          <div className={`wave ${isPlaying ? 'active' : ''}`}></div>
          <div className={`wave ${isPlaying ? 'active' : ''}`}></div>
          <div className={`wave ${isPlaying ? 'active' : ''}`}></div>
        </div>
        
        <div className="radio-name">
          <h4>{currentRadio?.name || 'اختر إذاعة'}</h4>
          {isConnecting && <span className="connecting">جاري الاتصال...</span>}
          {isPlaying && !isConnecting && <span className="live">● مباشر</span>}
        </div>
      </div>

      {/* Radio Selector Dropdown */}
      <div className="radio-selector" ref={dropdownRef}>
        <button 
          className="dropdown-trigger"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span>اختر إذاعة أخرى</span>
          <ChevronDown className={`chevron ${isDropdownOpen ? 'open' : ''}`} />
        </button>
        
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-header">
              <h5>الإذاعات المتاحة ({radios.length})</h5>
            </div>
            <div className="dropdown-list">
              {radios.map((radio) => (
                <button
                  key={radio.id}
                  className={`dropdown-item ${currentRadio?.id === radio.id ? 'active' : ''}`}
                  onClick={() => handleRadioChange(radio)}
                >
                  <Radio className="item-icon" />
                  <span className="item-name">{radio.name}</span>
                  {favorites.includes(radio.id) && (
                    <Heart className="item-favorite" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-display">
          <p>{error}</p>
          <button className="retry-btn" onClick={retry}>
            <RotateCcw />
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="radio-controls">
        <div className="main-controls">
          <button className="control-btn secondary" onClick={playPrevious}>
            <SkipForward style={{ transform: 'scaleX(-1)' }} />
          </button>
          
          <button 
            className={`play-btn ${isLoading ? 'loading' : ''}`}
            onClick={togglePlay}
            disabled={isLoading || !currentRadio}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : isPlaying ? (
              <Pause />
            ) : (
              <Play />
            )}
          </button>
          
          <button className="control-btn secondary" onClick={playNext}>
            <SkipBack style={{ transform: 'scaleX(-1)' }} />
          </button>
        </div>

        {/* Volume Control */}
        <div className="volume-control">
          <button className="volume-btn" onClick={toggleMute}>
            {isMuted || volume === 0 ? <VolumeX /> : <Volume2 />}
          </button>
          <div className="volume-slider-container">
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume * 100}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
          <span className="volume-text">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Progress Info */}
      {isPlaying && (
        <div className="progress-info">
          <span className="time-current">{formatTime(currentTime)}</span>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <span className="time-total">مباشر</span>
        </div>
      )}

      <style jsx>{`
        .radio-player-container {
          background: linear-gradient(135deg,rgb(90, 97, 132) 0%,rgb(53, 56, 115) 100%);
          border-radius: 20px;
          padding: 24px;
          color: white;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          max-width: 450px;
          margin: 0 auto;
        }

        .radio-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .radio-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .radio-main-icon {
          width: 32px;
          height: 32px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .radio-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          font-family: 'Cairo', sans-serif;
        }

        .radio-subtitle {
          font-size: 14px;
          opacity: 0.8;
          margin: 0;
        }

        .radio-actions {
          display: flex;
          gap: 8px;
        }

        .favorite-btn, .share-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 10px;
          padding: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .favorite-btn:hover, .share-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .favorite-btn.active {
          background: rgba(255, 255, 255, 0.3);
          color: #ff6b6b;
        }

        .current-radio {
          text-align: center;
          margin-bottom: 24px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
        }

        .radio-wave-animation {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 3px;
          margin-bottom: 12px;
          height: 30px; /* Fixed height to prevent movement */
        }

        .wave {
          width: 3px;
          height: 16px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 2px;
          animation: wave 1.5s ease-in-out infinite;
          transition: all 0.3s ease;
        }

        .wave:nth-child(2) {
          animation-delay: 0.2s;
        }

        .wave:nth-child(3) {
          animation-delay: 0.4s;
        }

        .wave.active {
          background: #4ade80;
          box-shadow: 0 0 8px rgba(74, 222, 128, 0.4);
        }

        @keyframes wave {
          0%, 100% { 
            height: 16px; 
            transform: scaleY(1);
          }
          50% { 
            height: 24px; 
            transform: scaleY(1.5);
          }
        }

        .radio-name h4 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px 0;
          font-family: 'Cairo', sans-serif;
        }

        .connecting, .live {
          font-size: 12px;
          opacity: 0.8;
        }

        .live {
          color: #4ade80;
        }

        .radio-selector {
          position: relative;
          margin-bottom: 20px;
        }

        .dropdown-trigger {
          width: 100%;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
          font-family: 'Cairo', sans-serif;
        }

        .dropdown-trigger:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .chevron {
          transition: transform 0.3s ease;
        }

        .chevron.open {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          max-height: 300px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .dropdown-header {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
        }

        .dropdown-header h5 {
          margin: 0;
          font-size: 14px;
          color: #333;
          font-weight: 600;
        }

        .dropdown-list {
          max-height: 240px;
          overflow-y: auto;
        }

        .dropdown-item {
          width: 100%;
          background: none;
          border: none;
          padding: 12px 16px;
          text-align: right;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: background 0.2s ease;
          color: #333;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .dropdown-item.active {
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
        }

        .item-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .item-name {
          flex: 1;
          text-align: right;
          font-family: 'Cairo', sans-serif;
        }

        .item-favorite {
          width: 16px;
          height: 16px;
          color: #ff6b6b;
        }

        .error-display {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 16px;
          text-align: center;
        }

        .retry-btn {
          background: rgba(239, 68, 68, 0.3);
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 8px auto 0;
          transition: background 0.3s ease;
        }

        .retry-btn:hover {
          background: rgba(239, 68, 68, 0.5);
        }

        .radio-controls {
          margin-bottom: 16px;
        }

        .main-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .control-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 12px;
          width: 48px;
          height: 48px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .control-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .play-btn {
          background: rgba(255, 255, 255, 0.3);
          border: none;
          border-radius: 50%;
          width: 64px;
          height: 64px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .play-btn:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: scale(1.05);
        }

        .play-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
        }

        .volume-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.3s ease;
        }

        .volume-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .volume-slider-container {
          flex: 1;
          max-width: 120px;
        }

        .volume-slider {
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.3);
          outline: none;
          cursor: pointer;
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        .volume-text {
          font-size: 12px;
          opacity: 0.8;
          min-width: 35px;
        }

        .progress-info {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          opacity: 0.8;
        }

        .progress-bar {
          flex: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #4ade80;
          width: 100%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .radio-player-container {
            padding: 20px;
            margin: 0 16px;
          }

          .radio-header {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }

          .radio-actions {
            justify-content: center;
          }

          .main-controls {
            gap: 12px;
          }

          .control-btn {
            width: 44px;
            height: 44px;
          }

          .play-btn {
            width: 56px;
            height: 56px;
          }

          .volume-control {
            flex-direction: column;
            gap: 8px;
          }

          .volume-slider-container {
            max-width: 200px;
          }
        }

        @media (max-width: 480px) {
          .radio-title {
            font-size: 16px;
          }

          .radio-subtitle {
            font-size: 12px;
          }

          .current-radio {
            padding: 16px;
          }

          .dropdown-menu {
            max-height: 250px;
          }
        }
      `}</style>
    </div>
  );
};

export default RadioAudioPlayer;