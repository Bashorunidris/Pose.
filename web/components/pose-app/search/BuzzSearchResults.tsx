'use client';

import { Empty, SectionHeader, TagRows, TrendingList } from './SearchResults';
import * as UI from './search-ui';
import { initials } from '@/lib/pose-app/format';
import type { BuzzPerson, BuzzTrendingData } from '@/lib/pose-app/search';
import type { BuzzPost } from '@/lib/pose-app/types';

/** The author avatars these rows show, with the ported initials fallback. */
function RowAvatar({ src, name }: { src: string; name: string }) {
  return (
    <div className={UI.BUZZ_ROW_AVATAR} style={src ? { backgroundImage: `url('${src}')` } : undefined}>
      {src ? '' : initials(name)}
    </div>
  );
}

/**
 * `buildBuzzTrendingTabHtml()` @80184's three blocks. The legacy section headers
 * were emoji; the ported overlays use Font Awesome throughout, so these do too.
 * The hashtag block is the same list `TrendingList` already renders for For You.
 */
export function BuzzTrendingSection({
  data,
  onOpenPerson,
  onOpenPost,
  onSelectTag,
}: {
  data: BuzzTrendingData;
  onOpenPerson: (person: BuzzPerson) => void;
  onOpenPost: (post: BuzzPost) => void;
  onSelectTag: (tag: string) => void;
}) {
  return (
    <>
      {data.people.length > 0 && (
        <div className={UI.SECTION}>
          <SectionHeader>
            <i className="fas fa-fire mr-[6px]" />
            Trending Users
          </SectionHeader>
          <div className={UI.TRENDING_LIST}>
            {data.people.map((person) => (
              <div key={person.uid} className={UI.TRENDING_ITEM} onClick={() => onOpenPerson(person)}>
                <RowAvatar src={person.avatar} name={person.name} />
                <div>
                  <div className={UI.TRENDING_NAME}>{person.name}</div>
                  <div className={UI.TRENDING_COUNT}>{Math.round(person.score)} engagements</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.posts.length > 0 && (
        <div className={UI.SECTION}>
          <SectionHeader>
            <i className="fas fa-fire mr-[6px]" />
            Trending Posts
          </SectionHeader>
          <div className={UI.BUZZ_ROWS}>
            {data.posts.map(({ post, score }) => (
              <TrendingPostRow key={post.id} post={post} score={score} onOpen={onOpenPost} />
            ))}
          </div>
        </div>
      )}

      <div className={UI.SECTION}>
        <SectionHeader>
          <i className="fas fa-fire mr-[6px]" />
          Trending Hashtags
        </SectionHeader>
        {data.hashtags.length === 0 ? (
          <Empty>No buzz data yet</Empty>
        ) : (
          <TrendingList
            items={data.hashtags.map((entry) => ({ tag: entry.tag, posts: String(entry.count) }))}
            onSelect={onSelectTag}
          />
        )}
      </div>
    </>
  );
}

/** A Trending-tab post row, which carries its engagement score. */
function TrendingPostRow({
  post,
  score,
  onOpen,
}: {
  post: BuzzPost;
  score: number;
  onOpen: (post: BuzzPost) => void;
}) {
  const name = post.userName || post.name || 'User';
  return (
    <div className={UI.BUZZ_ROW} onClick={() => onOpen(post)}>
      <RowAvatar src={post.userProfilePic ?? ''} name={name} />
      <div className={UI.BUZZ_ROW_BODY}>
        <div className={UI.BUZZ_ROW_NAME}>{name}</div>
        <div className={UI.BUZZ_ROW_TEXT}>{post.text?.slice(0, 200)}</div>
        <div className={UI.BUZZ_ROW_SCORE}>
          <i className="fas fa-fire" /> {Math.round(score)} engagement
        </div>
      </div>
    </div>
  );
}

/**
 * The All tab's Users block @80395 — the thin people stubs derived from buzz
 * authors, distinct from the dedicated Users tab, which reads the `users`
 * collection through `queryUsers()`.
 */
export function BuzzPeopleRows({
  people,
  onOpen,
}: {
  people: BuzzPerson[];
  onOpen: (person: BuzzPerson) => void;
}) {
  if (!people.length) return null;
  return (
    <div className={UI.SECTION}>
      <SectionHeader>Users ({people.length})</SectionHeader>
      <div className={UI.TRENDING_LIST}>
        {people.slice(0, 8).map((person) => (
          <div key={person.uid} className={UI.TRENDING_ITEM} onClick={() => onOpen(person)}>
            <RowAvatar src={person.avatar} name={person.name} />
            <div>
              <div className={UI.TRENDING_NAME}>{person.name}</div>
              <div className={UI.TRENDING_COUNT}>{(person.bio || '').slice(0, 40)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The All tab's Posts block @80480 — trimmed text-preview rows, unlike the
 * dedicated Posts tab, which lays out real `BuzzCard`s.
 */
export function BuzzPostRows({
  posts,
  onOpen,
}: {
  posts: BuzzPost[];
  onOpen: (post: BuzzPost) => void;
}) {
  if (!posts.length) return null;
  return (
    <div className={UI.SECTION}>
      <SectionHeader>Posts ({posts.length})</SectionHeader>
      <div className={UI.BUZZ_ROWS}>
        {posts.slice(0, 30).map((post) => {
          const name = post.userName || post.name || 'User';
          return (
            // The whole row opens the post in the Buzz feed, no exceptions — to
            // reach the author, use the Users tab.
            <div key={post.id} className={UI.BUZZ_ROW} onClick={() => onOpen(post)}>
              <RowAvatar src={post.userProfilePic ?? ''} name={name} />
              <div className={UI.BUZZ_ROW_BODY}>
                <div className={UI.BUZZ_ROW_NAME}>{name}</div>
                <div className={UI.BUZZ_ROW_TEXT}>{post.text?.slice(0, 200)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** The All tab's Hashtags block @80472. */
export function BuzzTagRows({
  tags,
  onSelect,
}: {
  tags: { tag: string; count: number }[];
  onSelect: (tag: string) => void;
}) {
  if (!tags.length) return null;
  return (
    <div className={UI.SECTION}>
      <SectionHeader>Hashtags</SectionHeader>
      <TagRows tags={tags} onSelect={onSelect} />
    </div>
  );
}
