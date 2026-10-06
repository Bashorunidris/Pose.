'use client';

import { COUNTRY_FILTERS, GENRE_TABS } from '@/lib/pose-music/data';
import { TR } from './styles';

type Props = {
  genre: string;
  country: string;
  onGenre: (genre: string) => void;
  onCountry: (country: string) => void;
};

const LABEL =
  'block text-[10.5px] font-semibold tracking-[.8px] uppercase text-music-ink-muted mb-[5px]';

export function Filters({ genre, country, onGenre, onCountry }: Props) {
  return (
    <section className="pt-0 pb-[18px] px-[28px] max-[900px]:px-[14px] max-[900px]:pb-[14px] max-[600px]:px-[12px] max-[600px]:pb-[12px]">
      <div className="flex flex-col gap-[11px]">
        <div>
          <span className={LABEL}>
            <i className="fas fa-music mr-[5px]" />
            Genre
          </span>
          <div className="flex gap-[7px] flex-wrap">
            {GENRE_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onGenre(tab)}
                className={`py-[6px] px-[15px] rounded-[20px] font-body text-[12px] cursor-pointer ${TR} ${
                  tab === genre
                    ? 'bg-music-green border border-music-green text-black font-bold'
                    : 'bg-music-surface border border-music-hair text-music-ink-soft font-medium hover:border-music-ink-muted hover:text-music-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className={LABEL}>
            <i className="fas fa-globe mr-[5px]" />
            Country
          </span>
          <select
            value={country}
            onChange={(event) => onCountry(event.target.value)}
            className="bg-music-surface border border-music-hair text-music-ink-soft py-[7px] px-[13px] rounded-[20px] text-[12px] font-body cursor-pointer outline-none min-w-[170px] hover:border-music-ink-muted hover:text-music-ink transition-all duration-[220ms]"
          >
            {COUNTRY_FILTERS.map((option) => (
              <option key={option.value} value={option.value} className="music-select-option">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
