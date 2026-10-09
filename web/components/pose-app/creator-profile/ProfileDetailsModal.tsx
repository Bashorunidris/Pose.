'use client';

import {
  ABOUT_BIO,
  ABOUT_CLOSE,
  ABOUT_HEADER,
  ABOUT_LINKS,
  ABOUT_LINKS_TITLE,
  ABOUT_OVERLAY,
  ABOUT_SHEET,
  ABOUT_TITLE,
  LINK_CHIP,
} from './creator-profile-ui';

type Props = {
  bio: string;
  links: { title: string; url: string }[];
  onClose: () => void;
};

/**
 * `#profileDetailsModal` @90647 and `openProfileDetailsModal()` @90597 — the
 * "About" sheet behind the profile's See more button. Unlike the inline links
 * row, which shows three chips and a `+N More`, this one lists every link.
 */
export function ProfileDetailsModal({ bio, links, onClose }: Props) {
  return (
    <div
      className={ABOUT_OVERLAY}
      onClick={(event) => {
        // The legacy overlay only closed on a direct backdrop click.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={ABOUT_SHEET}>
        <div className={ABOUT_HEADER}>
          <h3 className={ABOUT_TITLE}>About</h3>
          <button type="button" className={ABOUT_CLOSE} onClick={onClose} aria-label="Close">
            <i className="fas fa-times" />
          </button>
        </div>
        <p className={ABOUT_BIO}>{bio || 'No bio added yet'}</p>
        {links.length > 0 && (
          <>
            <p className={ABOUT_LINKS_TITLE}>Links</p>
            <div className={ABOUT_LINKS}>
              {links.map((link) => (
                <a
                  key={`${link.title}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={LINK_CHIP}
                >
                  <i className="fas fa-link text-[10px]" />
                  <span>{link.title}</span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
