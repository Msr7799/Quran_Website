
// ===================================
// src/pages/live.jsx - Fixed Live TV Page
// ===================================

import React, { useState, useEffect, useRef } from 'react';
import SeoHead from '../components/SeoHead';
import RadioAudioPlayer from '../components/AudioPlayer/RadioAudioPlayer';
import { Play, Pause, Volume2, VolumeX, Radio, Signal, AlertCircle } from 'lucide-react';

const LivePage = () => {
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [mounted, setMounted] = useState(false);
  const [radios, setRadios] = useState([]);
  const [radioLoading, setRadioLoading] = useState(true);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  

  // Component mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // متابعة تغييرات الثيم
  useEffect(() => {
    if (!mounted) return;
    
    // متابعة تغييرات الثيم من localStorage
    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem('theme');
      if (currentTheme) {
        setIsDarkMode(currentTheme === 'dark');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // متابعة تغييرات data-theme attribute
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const theme = document.documentElement.getAttribute('data-theme');
          setIsDarkMode(theme === 'dark');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      observer.disconnect();
    };
  }, [mounted]);
  // Load radio stations
  useEffect(() => {
    const loadRadios = async () => {
      try {
        setRadioLoading(true);
        const response = await fetch('/json/radios.json');
        const radioData = await response.json();
        
        // Extract radios array from the JSON object
        const radiosArray = radioData.radios || [];
        
        // Add IDs to radio objects if they don't have them
        const radiosWithIds = radiosArray.map((radio, index) => ({
          id: radio.id || index + 1,
          name: radio.name || `إذاعة ${index + 1}`,
          url: radio.url
        }));

        
        setRadios(radiosWithIds);
      } catch (error) {
        console.error('Error loading radios:', error);
        // Set fallback radios
        setRadios([
          {
            id: 1,
            name: "إذاعة القرآن الكريم",
            url: "https://radio.quran.islamway.net/live"
          },
          {
            id: 2,
            name: "إذاعة السنة النبوية",
            url: "https://radio.sunnah.islamway.net/live"
          }
        ]);
      } finally {
        setRadioLoading(false);
      }
    };

    if (mounted) {
      loadRadios();
    }
  }, [mounted]);

  // Load live TV channels
  useEffect(() => {
    const loadChannels = async () => {
      try {
        setIsLoading(true);
        
        // استخدام YouTube للبث المباشر
        const youtubeChannels = [
          {
            id: 1,
            name: "البث المباشر - القرآن الكريم",
            url: "https://www.youtube.com/embed/AdAmNe2OQbI?autoplay=1&mute=0",
            type: "youtube"
          },
          {
            id: 2,
            name: "قناة القرآن الكريم - احتياطي",
            url: "https://www.youtube.com/embed/7opN4Gopoio?autoplay=1&mute=0",
            type: "youtube"
          }
        ];
        setChannels(youtubeChannels);
        setCurrentChannel(youtubeChannels[0]);
        
        setError(null);
      } catch (err) {
        console.error('Error loading channels:', err);
        setError(`خطأ في تحميل القنوات: ${err.message}`);
        
        // Use fallback channels on error
        const fallbackChannels = [
          {
            id: 3,
            name: "قناة القرآن الكريم",
            url: "https://win.holol.com/live/quran/playlist.m3u8"
          },
          {
            id: 4,
            name: "قناة السنة النبوية",
            url: "https://win.holol.com/live/sunnah/playlist.m3u8"
          }
        ];
        setChannels(fallbackChannels);
        setCurrentChannel(fallbackChannels[0]);
      } finally {
        setIsLoading(false);
      }
    };

    if (mounted) {
      loadChannels();
    }
  }, [mounted]);

  // Initialize HLS player
  useEffect(() => {
    if (!currentChannel || !videoRef.current || !mounted) return;

    const initializePlayer = async () => {
      try {
        setConnectionStatus('connecting');
        
        // Check if HLS is supported
        if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          videoRef.current.src = currentChannel.url;
          setConnectionStatus('connected');
        } else {
          // Use HLS.js for other browsers
          const { default: Hls } = await import('hls.js');
          
          if (Hls.isSupported()) {
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }
            
            const hls = new Hls({
              enableWorker: false,
              lowLatencyMode: true,
              backBufferLength: 10
            });
            
            hls.loadSource(currentChannel.url);
            hls.attachMedia(videoRef.current);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setConnectionStatus('connected');
              setError(null);
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error('HLS Error:', data);
              setError(`خطأ في الاتصال: ${data.details}`);
              setConnectionStatus('error');
            });
            
            hlsRef.current = hls;
          } else {
            setError('المتصفح غير مدعوم للبث المباشر');
            setConnectionStatus('error');
          }
        }
      } catch (err) {
        console.error('Error initializing player:', err);
        setError(`خطأ في تشغيل القناة: ${err.message}`);
        setConnectionStatus('error');
      }
    };

    initializePlayer();

    // Cleanup function
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentChannel, mounted]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        console.error('Play error:', err);
        setError(`خطأ في التشغيل: ${err.message}`);
      });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const switchChannel = (channel) => {
    setCurrentChannel(channel);
    setIsPlaying(false);
    setError(null);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4caf50';
      case 'connecting': return '#ff9800';
      case 'error': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'متصل';
      case 'connecting': return 'جاري الاتصال...';
      case 'error': return 'خطأ في الاتصال';
      default: return 'غير متصل';
    }
  };

  if (!mounted) {
    return null; // Prevent SSR mismatch
  }

  return (
    <>
      <SeoHead
        title="البث المباشر - قنوات القرآن الكريم"
        description="استمع للبث المباشر لقنوات القرآن الكريم والسنة النبوية على مدار الساعة"
        keywords="البث المباشر, قنوات القرآن, قناة القرآن الكريم, قناة السنة النبوية"
        url={`${process.env.NEXT_PUBLIC_BASE_URL}/live`}
      />
      
      <div className="live-container">
        <div className="live-header">
          <h1>
            <Radio className="header-icon" />
            البث المباشر
          </h1>
          <p>قنوات القرآن الكريم والسنة النبوية</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="live-content">
          {/* YouTube Player */}
          <div className="video-container">
            {currentChannel && currentChannel.type === 'youtube' ? (
              <iframe
                className="video-player youtube-player"
                src={currentChannel.url}
                title={currentChannel.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => {
                  setIsLoading(false);
                  setConnectionStatus('connected');
                }}
                onError={() => {
                  setError('خطأ في تحميل البث المباشر');
                  setConnectionStatus('error');
                }}
              />
            ) : (
              <video
                ref={videoRef}
                className="video-player"
                controls={false}
                autoPlay={false}
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadStart={() => setIsLoading(true)}
                onLoadedData={() => setIsLoading(false)}
                onError={(e) => {
                  console.error('Video error:', e);
                  setError('خطأ في تشغيل الفيديو');
                  setConnectionStatus('error');
                }}
              />
            )}
            
            {isLoading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>جاري التحميل...</p>
              </div>
            )}
          </div>

          {/* Channel Info */}
          <div className="channel-info">
            <div className="channel-details">
              <h2>{currentChannel?.name}</h2>
              <div className="status-indicator">
                <div 
                  className="status-dot"
                  style={{ backgroundColor: getStatusColor() }}
                ></div>
                <span>{getStatusText()}</span>
              </div>
            </div>
            
            <div className="connection-quality">
              <Signal size={16} />
              <span>جودة الاتصال: {connectionStatus === 'connected' ? 'ممتاز' : 'منخفض'}</span>
            </div>
          </div>


          {/* Channel List */}
          <div className="channels-list">
            <h3>القنوات المتاحة</h3>
            <div className="channels-grid">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  className={`channel-btn ${currentChannel?.id === channel.id ? 'active' : ''}`}
                  onClick={() => switchChannel(channel)}
                >
                  <Radio size={16} />
                  <span>{channel.name}</span>
                  {currentChannel?.id === channel.id && (
                    <div className="playing-indicator">
                      <div className="wave"></div>
                      <div className="wave"></div>
                      <div className="wave"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Radio Player Section */}
        <div className="radio-section">
          <div className="radio-section-header">
            <h2>
              <Radio className="section-icon" />
              مشغل الإذاعة المباشر
            </h2>
            <p>استمع إلى إذاعات القرآن الكريم والبرامج الإسلامية</p>
          </div>

          {radioLoading ? (
            <div className="radio-loading">
              <div className="loading-spinner"></div>
              <p>جاري تحميل الإذاعات...</p>
            </div>
          ) : (
            <RadioAudioPlayer radios={radios} />
          )}
        </div>
      </div>

      <style jsx>{`
        .live-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          direction: rtl;
          font-family: 'Cairo', sans-serif;
        }

        .live-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }

        .live-header h1 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 2.5rem;
          color: #1976d2;
          margin-bottom: 10px;
        }

        .header-icon {
          color: #dc004e;
        }

        .live-header p {
          font-size: 1.2rem;
          color: #666;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-left: 4px solid #c62828;
        }

        .live-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
        }

        .video-container {
          position: relative;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        .video-player {
          width: 100%;
          height: 400px;
          object-fit: cover;
        }

        .youtube-player {
          width: 100%;
          height: 400px;
          border: none;
          border-radius: 12px;
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          gap: 15px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top: 4px solid #1976d2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .small-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid #1976d2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .channel-info {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .channel-details h2 {
          font-size: 1.5rem;
          color: #1976d2;
          margin-bottom: 8px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #666;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .connection-quality {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 0.9rem;
        }


        .channels-list {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .channels-list h3 {
          margin-bottom: 20px;
          color: #1976d2;
          font-size: 1.3rem;
        }

        .channels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 15px;
        }

        .channel-btn {
          background: white;
          border: 2px solid #e0e0e0;
          color: black;
          padding: 15px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1rem;
          position: relative;
        }

        .channel-btn:hover {
          border-color: #1976d2;
          background: #f5f5f5;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .channel-btn.active {
          border-color: #1976d2;
          background: #e3f2fd;
          color: #1976d2;
        }

        .playing-indicator {
          position: absolute;
          left: 15px;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .wave {
          width: 3px;
          height: 12px;
          background: #1976d2;
          border-radius: 2px;
          animation: wave 1s ease-in-out infinite;
        }

        .wave:nth-child(2) {
          animation-delay: 0.1s;
        }

        .wave:nth-child(3) {
          animation-delay: 0.2s;
        }

        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.5); }
        }

        /* Radio Section Styles */
        .radio-section {
          margin-top: 40px;
          padding-top: 40px;
          border-top: 2px solid #e0e0e0;
        }

        .radio-section-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .radio-section-header h2 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 2rem;
          color: #1976d2;
          margin-bottom: 10px;
          font-family: 'Cairo', sans-serif;
        }

        .section-icon {
          color: #667eea;
        }

        .radio-section-header p {
          font-size: 1.1rem;
          color: #666;
          margin: 0;
        }

        .radio-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          text-align: center;
        }

        .radio-loading .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e0e0e0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        .radio-loading p {
          color: #666;
          font-size: 1rem;
          margin: 0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .live-container {
            padding: 15px;
          }

          .live-header h1 {
            font-size: 2rem;
          }

          .video-player,
          .youtube-player {
            height: 300px;
          }

          .channel-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }


          .channels-grid {
            grid-template-columns: 1fr;
          }

          .radio-section {
            margin-top: 30px;
            padding-top: 30px;
          }

          .radio-section-header h2 {
            font-size: 1.8rem;
            flex-direction: column;
            gap: 8px;
          }

          .radio-section-header p {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .live-header h1 {
            font-size: 1.5rem;
          }

          .video-player,
          .youtube-player {
            height: 250px;
          }

          .channel-info {
            text-align: center;
          }


          .radio-section {
            margin-top: 20px;
            padding-top: 20px;
          }

          .radio-section-header h2 {
            font-size: 1.5rem;
          }

          .radio-section-header p {
            font-size: 0.9rem;
          }

          .radio-loading {
            padding: 40px 15px;
          }
        }
      `}</style>
    </>
  );
};

export default LivePage;
