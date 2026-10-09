import type { InboxMessage } from './types';

/** `renderInboxList()` from the legacy script — same markup, same classes. */
export function inboxListHtml(messages: InboxMessage[]): string {
  if (!messages.length) {
    return `<div style="text-align:center;padding:36px 12px;color:var(--gray-400);font-size:13px;">
          <i class="fas fa-inbox" style="font-size:28px;display:block;margin-bottom:10px;opacity:.4;"></i>
          No messages yet
        </div>`;
  }
  return messages
    .map((message) => {
      const created = message.createdAt as { toDate?: () => Date } | string | number | undefined;
      let date: Date | null = null;
      if (created && typeof created === 'object' && typeof created.toDate === 'function') {
        date = created.toDate();
      } else if (typeof created === 'string' || typeof created === 'number') {
        date = new Date(created);
      }
      const dateStr = date && !Number.isNaN(date.getTime())
        ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        : '';
      return `
          <div class="inbox-item ${message.read ? '' : 'unread'}" onclick="markInboxRead('${message.id}')">
            <div class="inbox-item-top">
              <div style="display:flex;align-items:center;gap:8px;">
                ${message.read ? '' : '<span class="inbox-unread-dot"></span>'}
                <span class="inbox-item-subject">${message.subject || 'Message from Pose'}</span>
              </div>
              <span class="inbox-item-date">${dateStr}</span>
            </div>
            <div class="inbox-item-msg">${message.message || ''}</div>
          </div>`;
    })
    .join('');
}
