'use client';

import { Suspense, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { CreatorProfilePage, type TabKey } from '@/components/pose-app/creator-profile/CreatorProfilePage';
import { usePoseSession } from '@/lib/pose-app/session';

const TAB_KEYS: TabKey[] = ['feed', 'photos', 'buzzs', 'liked', 'stories'];

/**
 * Another creator's profile, at its own shareable address.
 *
 * The legacy app opened `#forYouProfilePageModal` as an overlay on top of the
 * feed (`openForYouProfilePage()` @66391), and it had no URL — a profile could
 * not be linked to. The port gives it a route, which is also what the share
 * sheet has been mailing out as `/u/<uid>`.
 *
 * `?tab=` carries the landing tab `openProfileFromSearch()` @79600 used to apply
 * after opening — Buzz search sends people here with `?tab=buzzs`.
 */
export default function CreatorProfileRoute() {
  return (
    <Suspense fallback={null}>
      <CreatorProfile />
    </Suspense>
  );
}

function CreatorProfile() {
  const router = useRouter();
  const params = useParams<{ uid: string }>();
  const searchParams = useSearchParams();
  const { user } = usePoseSession();
  const uid = typeof params.uid === 'string' ? decodeURIComponent(params.uid) : '';
  const viewerUid = user?.uid ?? null;

  const requested = searchParams.get('tab');
  const landingTab = TAB_KEYS.find((key) => key === requested);

  // `openForYouProfilePage()` sent you to your own profile when the id matched
  // the signed-in user. Yours lives in the shell behind the profile icon, so the
  // route hands back over to it rather than rendering a second copy.
  const isSelf = Boolean(viewerUid && uid && viewerUid === uid);
  useEffect(() => {
    if (isSelf) router.replace('/');
  }, [isSelf, router]);

  if (!uid || isSelf) return null;

  return (
    <CreatorProfilePage
      uid={uid}
      viewerUid={viewerUid}
      displayName={user?.displayName ?? ''}
      email={user?.email ?? ''}
      landingTab={landingTab}
    />
  );
}
