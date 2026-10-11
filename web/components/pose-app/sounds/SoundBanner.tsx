'use client';

import { useEffect, useState } from 'react';

import { SOUND_BANNER_ADS } from '@/lib/pose-app/sounds';

/**
 * `initializeBannerAds()` @59064 and `startBannerAutoScroll()` @59109 — the four
 * slides, advancing every four seconds, with the dot strip `goToBannerSlide()`
 * @59117 painted.
 */
export function SoundBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % SOUND_BANNER_ADS.length),
      4000,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="sound-banner-ads">
      <div className="banner-ads-slider" style={{ transform: `translateX(-${index * 100}%)` }}>
        {SOUND_BANNER_ADS.map((ad) => (
          <div className="banner-ad-item" key={ad.title}>
            {ad.type === 'image' ? (
              <img src={ad.url} alt={ad.title} />
            ) : (
              <video src={ad.url} autoPlay muted loop playsInline />
            )}
            <div className="banner-ad-overlay">
              <div className="banner-ad-title">
                <i className={`fas ${ad.icon}`} /> {ad.title}
              </div>
              <div className="banner-ad-subtitle">{ad.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="banner-indicators">
        {SOUND_BANNER_ADS.map((ad, position) => (
          <button
            type="button"
            key={ad.title}
            className={`banner-indicator${position === index ? ' active' : ''}`}
            onClick={() => setIndex(position)}
            aria-label={`Show ${ad.title}`}
          />
        ))}
      </div>
    </div>
  );
}
