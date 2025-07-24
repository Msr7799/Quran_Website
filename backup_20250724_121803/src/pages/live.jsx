
// ===================================
// src/pages/live.jsx - Fixed Live TV Page
// ===================================

import React, { useState, useEffect, useRef } from 'react';
import SeoHead from '../components/SeoHead';
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

  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  // Component mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load live TV channels
  useEffect(() => {
    const loadChannels = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://mp3quran.net/api/v3/live-tv');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.livetv && Array.isArray(data.livetv)) {
          setChannels(data.livetv);
          if (data.livetv.length > 0) {
            setCurrentChannel(data.livetv[0]);
          }
        } else {
          // Fallback data
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
        }
        
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
          {/* Video Player */}
          <div className="video-container">
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

          {/* Controls */}
          <div className="controls-container">
            <div className="playback-controls">
              <button 
                className="control-btn play-btn"
                onClick={togglePlayPause}
                disabled={isLoading || connectionStatus === 'error'}
              >
                {isLoading ? (
                  <div className="small-spinner"></div>
                ) : isPlaying ? (
                  <Pause size={24} />
                ) : (
                  <Play size={24} />
                )}
              </button>
            </div>

            <div className="volume-controls">
              <button className="control-btn" onClick={toggleMute}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
              <span className="volume-value">{Math.round(volume * 100)}%</span>
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

        .controls-container {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .playback-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .control-btn {
          background: none;
          border: 2px solid #1976d2;
          color: #1976d2;
          padding: 12px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .play-btn {
          background: #1976d2;
          color: white;
          padding: 16px;
        }

        .control-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .volume-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .volume-slider {
          width: 100px;
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          outline: none;
          -webkit-appearance: none;
          cursor: pointer;
        }

        .volume-slider::-webkit-slider-thumb {
          width: 16px;
          height: 16px;
          background: #1976d2;
          border-radius: 50%;
          cursor: pointer;
          -webkit-appearance: none;
        }

        .volume-value {
          font-size: 0.9rem;
          color: #666;
          min-width: 40px;
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .live-container {
            padding: 15px;
          }

          .live-header h1 {
            font-size: 2rem;
          }

          .video-player {
            height: 300px;
          }

          .channel-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .controls-container {
            flex-direction: column;
            gap: 20px;
          }

          .volume-controls {
            width: 100%;
            justify-content: center;
          }

          .channels-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .live-header h1 {
            font-size: 1.5rem;
          }

          .video-player {
            height: 250px;
          }

          .channel-info {
            text-align: center;
          }

          .volume-slider {
            width: 150px;
          }
        }
      `}</style>
    </>
  );
};

export default LivePage;
