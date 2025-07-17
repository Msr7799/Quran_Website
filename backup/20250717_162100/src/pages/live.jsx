import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import ReactAudioPlayer from 'react-audio-player';
import styles from '../styles/Live.module.css';
import { useTheme } from '@mui/material/styles';
import { PlayArrow, Pause, VolumeUp, VolumeOff } from '@mui/icons-material';

// Custom audio player component
const CustomAudioPlayer = ({ src, isPlaying, onPlayPause, onEnded, onNext, onPrevious }) => {
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.7);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.audioEl.current.play().catch(e => console.error('Error playing audio:', e));
      } else {
        audioRef.current.audioEl.current.pause();
      }
    }
  }, [isPlaying, src]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.audioEl.current.volume = isMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      // Unmute and restore previous volume
      setIsMuted(false);
      if (volume === 0) {
        setVolume(previousVolume || 0.7);
      }
    } else {
      // Mute and remember current volume
      setPreviousVolume(volume);
      setIsMuted(true);
    }
  };

  return (
    <div className={styles.audioPlayerContainer}>
      <ReactAudioPlayer
        ref={audioRef}
        src={src}
        autoPlay={isPlaying}
        controls={false}
        onEnded={onEnded}
        volume={isMuted ? 0 : volume}
      />
      <div className={styles.controls}>
        <button 
          onClick={onPrevious}
          className={styles.navButton}
          aria-label="القناة السابقة"
        >
          <span className={styles.arrowRight}>&#9654;</span> {/* Right arrow */}
        </button>
        
        <button 
          onClick={onPlayPause} 
          className={styles.playButton}
          aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </button>
        
        <button 
          onClick={onNext}
          className={styles.navButton}
          aria-label="القناة التالية"
        >
          <span className={`${styles.arrowRight} ${styles.arrowLeft}`}>&#9654;</span> {/* Left arrow */}
        </button>
        
        <div className={styles.volumeControl}>
          <button 
            onClick={toggleMute} 
            className={styles.muteButton}
            aria-label={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeOff /> : <VolumeUp />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
          />
        </div>
      </div>
    </div>
  );
};

const radioStations = [
  {
    id: 1,
    name: 'الإذاعة العامه للقرآن الكريم ',
    url: 'https://backup.qurango.net/radio/mix',
    description: 'بث مباشر لمختلف القرآء'
  },
  {
    id: 2,
    name: 'إذاعة تفسير القرآن الكريم',
    url: "https://backup.qurango.net/radio/mukhtasartafsir",
    description: 'المختصر في تفسير القرآن الكريم'
  },
  {
    id:3,
    name: 'إذاعة صحيح بخاري',
    url: 'https://backup.qurango.net/radio/saheh-bokharee',
    description: 'صحيح بخاري'
  },
  {
    id: 4,
    name: 'صحيح مسلم',
    url: 'https://backup.qurango.net/radio/saheh-muslim ',
    description: ' صحيح مسلم'
  },
  {
    id: 5,
    name: 'قصص الأنبياء',
    url: 'https://backup.qurango.net/radio/alanbiya',
    description: 'قصص الأنبياء'
  },
  
  {
    id: 6,
    name: 'إذاعة صور من حيات الصحابه والتابعين',
    url: 'https://backup.qurango.net/radio/sahabah',
    description: 'صور من حياة الصحابه'
  },
  
  {
    id: 7,
    name: 'إذاعة تلاوات خاشعه',
    url: 'https://backup.qurango.net/radio/salma',
    description: 'تلاوات خاشعه'
  }


];

export default function LivePage() {
  const theme = useTheme();
  const [selectedStation, setSelectedStation] = useState(radioStations[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const handleStationChange = (station) => {
    // إيقاف الإذاعة الحالية قبل تغيير المحطة
    if (selectedStation && selectedStation.id === station.id) {
      // إذا كانت نفس المحطة، قم بتبديل حالة التشغيل/الإيقاف
      setIsPlaying(!isPlaying);
    } else {
      // إذا كانت محطة جديدة، قم بتعيينها وشغلها
      setSelectedStation(station);
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    const currentIndex = radioStations.findIndex(station => station.id === selectedStation.id);
    const nextIndex = (currentIndex + 1) % radioStations.length;
    handleStationChange(radioStations[nextIndex]);
  };

  const handlePrevious = () => {
    const currentIndex = radioStations.findIndex(station => station.id === selectedStation.id);
    const prevIndex = (currentIndex - 1 + radioStations.length) % radioStations.length;
    handleStationChange(radioStations[prevIndex]);
  };

  // معرف قناة الحرم المكي الشريف على يوتيوب
  const makkahChannelVideoId = "hhM52oI6Id0"; // البث المباشر من الحرم المكي

  return (
    <>
      <Head>
        <title>البث المباشر - القرآن الكريم</title>
        <meta name="description" content="شاهد البث المباشر من الحرم المكي الشريف واستمع لإذاعات القرآن الكريم" />
        <meta name="keywords" content="البث المباشر, مكة المكرمة, إذاعة القرآن, الحرم المكي" />
      </Head>

      <div className={styles.liveContainer}>
        <h1 className={styles.pageTitle}
        style={{
          color: theme.palette.mode === 'dark' ? '#A3C1D4' : '#525050FF',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginTop: '90px',
          textAlign: 'center',
          margin: '20px 0',
        }}
        >البث المباشر للقرآن الكريم</h1>
        
        <div className={styles.contentGrid}>
          {/* البث المباشر من مكة - في الأعلى ويأخذ العرض الكامل */}
          <div className={`${styles.liveSection} ${styles.videoSection}`}>
            <h2 className={styles.sectionTitle}
            style={{
              // Using dark and light theme for the color
              color: theme.palette.mode === 'dark' ? '#A3C1D4' : '#525050FF',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginTop: '90px',
              textAlign: 'center',
              margin: '20px 0',
            }}
            >🕋 البث المباشر من الحرم المكي الشريف</h2>
            <div className={styles.videoContainer}>
              {!videoLoaded && (
                <div className={styles.loadingMessage}>
                  جاري تحميل البث المباشر...
                </div>
              )}
              <iframe
                src={`https://www.youtube.com/embed/${makkahChannelVideoId}?autoplay=0&mute=0`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="البث المباشر من الحرم المكي الشريف"
                onLoad={() => setVideoLoaded(true)}
              />
            </div>
          </div>

          {/* إذاعات القرآن الكريم - في الأسفل */}
          <div className={styles.liveSection}>
            <h2 className={styles.sectionTitle}
            style={{
              // Using dark and light theme for the color
              color: theme.palette.mode === 'dark' ? '#A3C1D4' : '#525050FF',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginTop: '90px',
              textAlign: 'center',
              margin: '20px 0',
            }}
            >📻 إذاعات القرآن الكريم</h2>
            
            <div className={styles.radioSection}>
              {/* مشغل الراديو */}
              <div className={styles.radioPlayer}>
                <h3 className={styles.radioTitle}>{selectedStation.name}</h3>
                <p className={styles.stationDesc}>{selectedStation.description}</p>
                <div className={styles.audioPlayer}>
                  <CustomAudioPlayer 
                    src={selectedStation.url}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    onEnded={handleEnded}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                  />
                </div>
              </div>

              {/* قائمة المحطات */}
              <div className={styles.radioStationsList}>
                <h4 className={styles.stationsListTitle}>اختر محطة راديو:</h4>
                {radioStations.map((station) => (
                  <div
                    key={station.id}
                    className={`${styles.radioStation} ${
                      selectedStation.id === station.id ? styles.active : ''
                    }`}
                    onClick={() => handleStationChange(station)}
                  >
                    <div className={styles.stationName}>{station.name}</div>
                    <div className={styles.stationDesc}>{station.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className={styles.liveSection} style={{ marginTop: '2rem' }}>
          <h2 className={styles.sectionTitle}>📖 البث المباشر للإذاعه وقناة مكة المكرمة</h2>
          <div style={{ textAlign: 'center', color: theme.palette.mode === 'dark' ? '#030303FF' : 'var(--text-color)', fontSize: '1.2rem', lineHeight: '1.8' }}>
            <p>• البث المباشر متاح على مدار الساعة</p>
            <p>• اللهم بارك لنا في هذا العمل واجعله خالصاً لوجهك الكريم</p>
          </div>
        </div>
      </div>
    </>
  );
}
