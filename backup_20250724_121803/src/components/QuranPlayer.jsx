// ===================================
// src/components/QuranPlayer.jsx - Comprehensive Quran Player with Ayat Timing
// ===================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward, Download, BookOpen, Heart, Share2 } from 'lucide-react';

const QuranPlayer = ({ surahNumber = 1, initialReciter = 5 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(0);
  const [highlightedAyah, setHighlightedAyah] = useState(null);
  const [ayatTiming, setAyatTiming] = useState([]);
  const [verses, setVerses] = useState([]);
  const [audioData, setAudioData] = useState([]);
  const [currentReciter, setCurrentReciter] = useState(initialReciter);
  const [surahInfo, setSurahInfo] = useState(null);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  
  const audioRef = useRef(null);
  const svgRef = useRef(null);
  const progressRef = useRef(null);

  // Load surah metadata
  useEffect(() => {
    const loadSurahData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load surah metadata
        const metadataResponse = await fetch('/json/metadata.json');
        const metadata = await metadataResponse.json();
        const surahData = metadata.find(s => s.number === surahNumber);
        setSurahInfo(surahData);
        
        // Load audio data for this surah
        const audioResponse = await fetch(`/json/audio/audio_surah_${surahNumber}.json`);
        const audioList = await audioResponse.json();
        setAudioData(audioList);
        
        // Load verses for this surah
        const versesData = [];
        for (let i = 1; i <= surahData.verses; i++) {
          try {
            const verseResponse = await fetch(`/json/verses/${String(surahNumber).padStart(3, '0')}_${String(i).padStart(3, '0')}.json`);
            const verseData = await verseResponse.json();
            versesData.push(verseData);
          } catch (err) {
            console.warn(`Failed to load verse ${i} for surah ${surahNumber}:`, err);
          }
        }
        setVerses(versesData);
        
        // Load ayat timing data
        const timingResponse = await fetch(`https://mp3quran.net/api/v3/ayat_timing?surah=${surahNumber}&read=${currentReciter}`);
        const timingData = await timingResponse.json();
        setAyatTiming(timingData);
        
        // Load SVG page if available
        if (timingData.length > 0 && timingData[1]?.page) {
          const svgResponse = await fetch(timingData[1].page);
          const svgText = await svgResponse.text();
          setSvgContent(svgText);
        }
        
      } catch (err) {
        setError(`خطأ في تحميل البيانات: ${err.message}`);
        console.error('Error loading surah data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSurahData();
  }, [surahNumber, currentReciter]);

  // Update current ayah based on audio time
  useEffect(() => {
    if (ayatTiming.length > 0 && currentTime > 0) {
      const currentAyahData = ayatTiming.find((ayah, index) => {
        const nextAyah = ayatTiming[index + 1];
        return currentTime >= ayah.start_time / 1000 && 
               (!nextAyah || currentTime < nextAyah.start_time / 1000);
      });
      
      if (currentAyahData) {
        setCurrentAyah(currentAyahData.ayah);
        setHighlightedAyah(currentAyahData.ayah);
        
        // Highlight ayah on SVG
        if (svgRef.current && currentAyahData.polygon) {
          highlightAyahOnSVG(currentAyahData.polygon, currentAyahData.ayah);
        }
      }
    }
  }, [currentTime, ayatTiming]);

  const highlightAyahOnSVG = useCallback((polygon, ayahNumber) => {
    if (!svgRef.current) return;
    
    // Remove previous highlights
    const previousHighlights = svgRef.current.querySelectorAll('.ayah-highlight');
    previousHighlights.forEach(el => el.remove());
    
    // Create new highlight
    if (polygon) {
      const svgElement = svgRef.current.querySelector('svg');
      if (svgElement) {
        const highlightElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        highlightElement.setAttribute('points', polygon);
        highlightElement.setAttribute('class', 'ayah-highlight');
        highlightElement.setAttribute('fill', 'rgba(255, 235, 59, 0.4)');
        highlightElement.setAttribute('stroke', '#FFC107');
        highlightElement.setAttribute('stroke-width', '2');
        highlightElement.setAttribute('data-ayah', ayahNumber);
        
        svgElement.appendChild(highlightElement);
      }
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        setError(`خطأ في التشغيل: ${err.message}`);
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((e) => {
    if (!audioRef.current || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const skipToAyah = useCallback((ayahNumber) => {
    const ayahData = ayatTiming.find(a => a.ayah === ayahNumber);
    if (ayahData && audioRef.current) {
      audioRef.current.currentTime = ayahData.start_time / 1000;
      setCurrentTime(ayahData.start_time / 1000);
      setCurrentAyah(ayahNumber);
    }
  }, [ayatTiming]);

  const changeReciter = useCallback((reciterId) => {
    setCurrentReciter(reciterId);
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const toggleFavorite = useCallback((ayahNumber) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(ayahNumber)) {
      newFavorites.delete(ayahNumber);
    } else {
      newFavorites.add(ayahNumber);
    }
    setFavorites(newFavorites);
    
    // Save to localStorage
    localStorage.setItem('quran_favorites', JSON.stringify([...newFavorites]));
  }, [favorites]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('quran_favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentAudio = audioData.find(a => a.id === currentReciter);

  return (
    <div className="quran-player">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={currentAudio?.link}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={(e) => setError(`خطأ في تحميل الصوت: ${e.message}`)}
        preload="metadata"
      />

      {/* Header */}
      <div className="player-header">
        <div className="surah-info">
          <h1>{surahInfo?.name_ar || `سورة ${surahNumber}`}</h1>
          <p>{surahInfo?.name_en} - {surahInfo?.verses} آية</p>
        </div>
        <div className="reciter-selector">
          <select 
            value={currentReciter} 
            onChange={(e) => changeReciter(parseInt(e.target.value))}
            className="reciter-select"
          >
            {audioData.map(reciter => (
              <option key={reciter.id} value={reciter.id}>
                {reciter.reciter.ar}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="player-content">
        {/* SVG Quran Page */}
        <div className="quran-page-container">
          <div 
            className="quran-page"
            ref={svgRef}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>

        {/* Verses List */}
        <div className="verses-container">
          <h3>الآيات</h3>
          <div className="verses-list">
            {verses.map((verse, index) => (
              <div
                key={index}
                className={`verse-item ${highlightedAyah === verse.number ? 'highlighted' : ''}`}
                onClick={() => skipToAyah(verse.number)}
              >
                <div className="verse-number">{verse.number}</div>
                <div className="verse-text">
                  <p className="arabic-text">{verse.text.ar}</p>
                  <p className="english-text">{verse.text.en}</p>
                </div>
                <div className="verse-actions">
                  <button
                    className={`favorite-btn ${favorites.has(verse.number) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(verse.number);
                    }}
                  >
                    <Heart size={16} />
                  </button>
                  <button className="share-btn">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player Controls */}
      <div className="player-controls">
        <div className="progress-container">
          <div 
            className="progress-bar"
            ref={progressRef}
            onClick={handleSeek}
          >
            <div 
              className="progress-fill"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="control-buttons">
          <button className="control-btn" onClick={() => skipToAyah(Math.max(1, currentAyah - 1))}>
            <SkipBack size={20} />
          </button>
          
          <button 
            className="play-btn"
            onClick={togglePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner" />
            ) : isPlaying ? (
              <Pause size={24} />
            ) : (
              <Play size={24} />
            )}
          </button>
          
          <button className="control-btn" onClick={() => skipToAyah(Math.min(verses.length, currentAyah + 1))}>
            <SkipForward size={20} />
          </button>
        </div>

        <div className="volume-control">
          <Volume2 size={16} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => {
              const vol = parseFloat(e.target.value);
              setVolume(vol);
              if (audioRef.current) {
                audioRef.current.volume = vol;
              }
            }}
            className="volume-slider"
          />
        </div>
      </div>

      <style jsx>{`
        .quran-player {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          direction: rtl;
          font-family: 'Amiri', 'Cairo', sans-serif;
        }

        .player-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }

        .surah-info h1 {
          font-size: 2.5rem;
          color: #1976d2;
          margin-bottom: 5px;
        }

        .surah-info p {
          color: #666;
          font-size: 1.1rem;
        }

        .reciter-select {
          padding: 10px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
          color: #333;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .reciter-select:hover {
          border-color: #1976d2;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #c62828;
        }

        .player-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        .quran-page-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .quran-page {
          width: 100%;
          height: 600px;
          overflow: auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }

        .verses-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .verses-container h3 {
          margin-bottom: 20px;
          color: #1976d2;
          font-size: 1.5rem;
        }

        .verses-list {
          max-height: 600px;
          overflow-y: auto;
        }

        .verse-item {
          display: flex;
          align-items: flex-start;
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e0e0e0;
        }

        .verse-item:hover {
          background: #f5f5f5;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .verse-item.highlighted {
          background: #fff3e0;
          border-color: #ff9800;
          box-shadow: 0 0 10px rgba(255, 152, 0, 0.3);
        }

        .verse-number {
          background: #1976d2;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-left: 15px;
          flex-shrink: 0;
        }

        .verse-text {
          flex: 1;
        }

        .arabic-text {
          font-size: 1.4rem;
          line-height: 1.8;
          color: #333;
          margin-bottom: 8px;
          font-family: 'Amiri', serif;
        }

        .english-text {
          font-size: 1rem;
          color: #666;
          font-style: italic;
        }

        .verse-actions {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .favorite-btn, .share-btn {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #666;
        }

        .favorite-btn:hover, .share-btn:hover {
          background: #f0f0f0;
          color: #1976d2;
        }

        .favorite-btn.active {
          color: #e91e63;
        }

        .player-controls {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .progress-container {
          margin-bottom: 20px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #1976d2;
          transition: width 0.1s ease;
        }

        .time-display {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: #666;
        }

        .control-buttons {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .control-btn, .play-btn {
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

        .control-btn:hover, .play-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .control-btn:disabled, .play-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #ffffff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
        }

        .volume-slider {
          width: 100px;
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          outline: none;
          -webkit-appearance: none;
        }

        .volume-slider::-webkit-slider-thumb {
          width: 16px;
          height: 16px;
          background: #1976d2;
          border-radius: 50%;
          cursor: pointer;
          -webkit-appearance: none;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .player-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .player-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .quran-page {
            height: 400px;
          }

          .verses-list {
            max-height: 400px;
          }

          .verse-item {
            flex-direction: column;
            text-align: center;
          }

          .verse-number {
            margin: 0 0 10px 0;
          }

          .verse-actions {
            flex-direction: row;
            justify-content: center;
            margin-top: 10px;
          }
        }

        @media (max-width: 480px) {
          .quran-player {
            padding: 10px;
          }

          .surah-info h1 {
            font-size: 2rem;
          }

          .control-buttons {
            gap: 10px;
          }

          .control-btn, .play-btn {
            padding: 10px;
          }

          .play-btn {
            padding: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default QuranPlayer;