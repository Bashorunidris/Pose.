'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import { LIVE_FEED_HREF, readRoomConfig, type RoomConfig } from '@/lib/pose-live/room';
import { useHostRoom } from '@/lib/pose-live/use-host-room';
import { ChatPanel } from '@/components/pose-live/room/ChatPanel';
import { ControlsPanel } from '@/components/pose-live/room/ControlsPanel';
import { GiftsPanel } from '@/components/pose-live/room/GiftsPanel';
import { BottomTabs, RoomHeader } from '@/components/pose-live/room/RoomHeader';
import {
  ActionSheet,
  Ambient,
  Announcements,
  ConfirmModal,
  GiftCanvas,
  Toast,
} from '@/components/pose-live/room/RoomOverlays';

export default function PoseLiveRoomPage() {
  return (
    <Suspense fallback={<div className="pose-room" />}>
      <RoomFromParams />
    </Suspense>
  );
}

/** The setup page writes every room setting as a query param (see `launchLive`). */
function RoomFromParams() {
  const searchParams = useSearchParams();
  const config = useMemo<RoomConfig>(() => readRoomConfig(searchParams.toString()), [searchParams]);
  return <HostRoom config={config} />;
}

function HostRoom({ config }: { config: RoomConfig }) {
  const room = useHostRoom(config);

  function goBack() {
    if (window.confirm('Leave? Your stream will keep running for 5 minutes. You can return to resume.')) {
      window.location.href = LIVE_FEED_HREF;
    }
  }

  return (
    <div className="pose-room">
      <div id="root">
        <Ambient />

        <RoomHeader
          roomName={room.roomName}
          roomTitle={room.roomTitle}
          privacy={config.privacy}
          viewerCount={room.viewerCount}
          msgCount={room.messages.length}
          giftCount={room.gifts.length}
          timerLabel={room.timerLabel}
          timerLow={room.timerLow}
          leaderboard={room.leaderboard}
          joinRequests={room.joinRequests}
          onBack={goBack}
          onEnd={() => room.setConfirmOpen(true)}
          onReview={() => room.setTab('controls')}
          onOpenGifts={() => room.setTab('gifts')}
        />

        <div id="body">
          <ChatPanel
            active={room.tab === 'chat'}
            messages={room.messages}
            chatLocked={room.chatLocked}
            slowMode={room.slowMode}
            pinned={room.pinned}
            allowImages={room.allowImages}
            allowVideos={room.allowVideos}
            hostPhoto={room.hostPhoto}
            onSend={(text) => void room.sendMessage(text)}
            onToggleLock={room.toggleLock}
            onToggleSlow={room.toggleSlow}
            onQuickPin={(text) => {
              if (!text.trim()) {
                room.showToast('Type a message to pin');
                return;
              }
              room.pin(text.trim());
              room.showToast('Message pinned');
            }}
            onUnpin={room.unpin}
            onOpenSheet={room.setSheetFor}
          />
          <GiftsPanel
            active={room.tab === 'gifts'}
            leaderboard={room.leaderboard}
            gifts={room.gifts}
            donations={room.donations}
            subs={room.subs}
            subAmount={config.subAmount}
          />
          <ControlsPanel
            active={room.tab === 'controls'}
            slide={room.slide}
            slideType={room.slideType}
            chatLocked={room.chatLocked}
            slowMode={room.slowMode}
            autoMod={room.autoMod}
            allowImages={room.allowImages}
            allowVideos={room.allowVideos}
            privacy={config.privacy}
            joinRequests={room.joinRequests}
            onSlideType={room.setSlideType}
            onPushSlide={room.pushSlide}
            onClearSlide={room.clearSlide}
            onToggleLock={room.toggleLock}
            onToggleSlow={room.toggleSlow}
            onSetting={room.updateRoomSetting}
            onApprove={(request) => void room.approveJoin(request)}
            onDeny={(request) => void room.denyJoin(request)}
            onEnd={() => room.setConfirmOpen(true)}
          />
        </div>

        <BottomTabs tab={room.tab} onTab={room.setTab} notify={room.notify} />
      </div>

      <ActionSheet
        message={room.sheetFor}
        onClose={() => room.setSheetFor(null)}
        onPin={(message) => {
          room.pin(message.text);
          room.setSheetFor(null);
        }}
        onDelete={(message) => {
          void room.deleteMessage(message);
          room.setSheetFor(null);
        }}
        onMute={(message) => {
          room.muteUser(message);
          room.setSheetFor(null);
        }}
        onBan={(message) => {
          void room.banUser(message);
          room.setSheetFor(null);
        }}
      />
      <GiftCanvas signal={room.giftSignal} />
      <Announcements announcement={room.announcement} />
      <ConfirmModal
        open={room.confirmOpen}
        onCancel={() => room.setConfirmOpen(false)}
        onConfirm={() => void room.endStream()}
      />
      <Toast toast={room.toast} />
    </div>
  );
}
