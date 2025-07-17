import React, { useEffect, useState } from 'react';

export default function MakkahLive({ apiKey, channelId }) {
  const [videoId, setVideoId] = useState(null);

  useEffect(() => {
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        const item = data.items?.[0];
        if (item) setVideoId(item.id.videoId);
      });
  }, [channelId, apiKey]);

  if (!videoId) return <p>جاري تحميل البث المباشر...</p>;

  return (
    <div style={{ margin: '2rem 0', textAlign: 'center' }}>
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="البث المباشر من مكة المكرمة"
      />
    </div>
  );
}
