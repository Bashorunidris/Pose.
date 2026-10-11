/**
 * The gift catalogue `#giftPopupOverlay` @27371 sold, and the shapes the comment
 * composer carries once a gift is attached.
 *
 * The forty-two entries are the legacy `GPO_GIFTS` array @89956 verbatim, prices
 * in Pose Coins. Nothing here reads Firestore: the balance check is against
 * `loadWalletProfile()`'s `pCoinBalance`, and the spend itself happens when the
 * comment is posted, which is why an attached gift posts as `giftStatus:
 * 'unclaimed'` (`cleanMedia()` @70853 in the comment path).
 */
import type { CommentMedia } from './comments';

export type GiftTag = 'popular' | 'new' | 'special';

export type GiftItem = {
  id: string;
  name: string;
  /** Price in Pose Coins, per one gift. */
  price: number;
  tags: GiftTag[];
  img: string;
};

export const GIFT_CATALOGUE: GiftItem[] = [
  { id: 'thumbsup', name: 'Thumbs Up', price: 1, tags: ['popular'], img: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHF0d2ZkbmhtZGpnd3V4MmNibWZqcmEwanoxYTBlcnN5bzl4NmRmcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/i99VfFMRAbd1Psrteb/giphy.gif' },
  { id: 'heart', name: 'Heart', price: 5, tags: ['popular'], img: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDkzdzJwbWRqbDNlYWFvbWtzdGwyMXVnemFhbDZmenR5NmU5cmp5ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3nvMq28M5NJe4bGr06/giphy.gif' },
  { id: 'kiss', name: 'Kiss', price: 1, tags: [], img: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2dsNWYzd3NrOXBqYmF2aXE4dmUyODY5Z3B4ZnVjYWF6NXJwZmlmeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/XFFHwbd9re4PFrVV28/giphy.gif' },
  { id: 'cheers', name: 'Cheers', price: 1, tags: [], img: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2s0NWZmNHFiMDJtNnRzNzJpY3d0andwaGQ4YjZxMjU0eTdwb2t0NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9ZQ/Y00c0w6xxtLn067SUi/giphy.gif' },
  { id: 'bubbles', name: 'Bubbles', price: 1, tags: [], img: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeXFpMjJlbnBvcXhybjQ1MDAzYzcybTVjcGRkM25vMDQ4ZzY3OWp4OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/xT9IgIRD08lu3XX5D2/giphy.gif' },
  { id: 'winner', name: 'Winner', price: 5, tags: ['popular'], img: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXBuajRjNm1wNnNheG9xMzdtbXVjb3pxZzVuODNjNmtwYWRoemU4byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7aD2ml5k1Vf8g8oM/giphy.gif' },
  { id: 'splash', name: 'Splash', price: 5, tags: [], img: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3Y0bWJzeTlnNDlra21oNHJoYmMxY2drZjlvMmdlZWhvZ2hraTNlaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/dXceGHTAqyuqAZAAzh/giphy.gif' },
  { id: 'goggles', name: 'Goggles', price: 10, tags: ['new'], img: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExd21zdnBvZHJwaGY2emd1b3NodnpiMHhodmg4a3p3NHlkNmh0b2drMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/wHrlUQ4qUzEPu6lH0F/giphy.gif' },
  { id: 'spacecat', name: 'Space Cat', price: 10, tags: ['new'], img: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGxrOWs1aWxxYXQzaWwwdWhtMXFyaXBxbjNzNGlhZmUzN242bHhhdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/dWS0YNs10XAoAbhHS0/giphy.gif' },
  { id: 'visitor', name: 'Visitor', price: 10, tags: [], img: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGt2aXQ4MnZna3ZheXpvYWQxNHBrMTUyZ3RvcDQzNG82cnN4b21rMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/qlOso7alCUTiAX7aG5/giphy.gif' },
  { id: 'matchup', name: 'Matchup', price: 10, tags: [], img: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXpuNWYwMHpyOGxzY3drcWs1eG8xaWNzMmlrYW96NW04cHpyM3VmayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/pZwDFWGn5Qcoo4jN6U/giphy.gif' },
  { id: 'toast', name: 'Toast', price: 10, tags: [], img: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXhxazJlOHo2M29naTRtZGdudDM5N21uaDBmdnRmMTBtNWI1ZGhxcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9ZQ/kZil2V0A3W7ksWTuQn/giphy.gif' },
  { id: 'wig', name: 'Wig', price: 10, tags: [], img: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmZlNGpmcjdtZW4xbTRtZmVyZXRoN3FpNTlmcXE3aXNsOThjamIzaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/2gUDkkBCWHc5AyUIYi/giphy.gif' },
  { id: 'energy', name: 'Energy', price: 18, tags: ['popular'], img: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeXUwcDRmMDF4aTZoeDFtM3Fwa3ZpeXJlcjhqc2hoaHhkZGE2NWdlaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/UTLXJBHtqoiP18csEP/giphy.gif' },
  { id: 'pow', name: 'Pow', price: 20, tags: ['new'], img: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExamtycHk4Nnhva3gwYmdsbXQ0b3h0MWw5azc2eGVkbmEwMGRydW56bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3owyp7ny4lU4db5WSs/giphy.gif' },
  { id: 'congrats', name: 'Congratulation', price: 50, tags: ['popular'], img: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXAyYTRlOWJ4ZnlvZXFuYTVmZWN6Y3VtOWRqaWg1N2NmYjNmcjk4YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/IfHRQE9wOCSVVF16qA/giphy.gif' },
  { id: 'faceoff', name: 'Face Off', price: 50, tags: [], img: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTJzdXRsZWI4cWY4M2l5NW11Z28xbHF0Nmc3ZG4weHIydHl1dXpkYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/oUEb7Fk9o4Y34rb94C/giphy.gif' },
  { id: 'showlove', name: 'Show Love', price: 50, tags: ['popular'], img: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHhqZzFwbjF5d2Q3cmNxdjN4MzcxOW1ybHRjbmtyZjMxMThueWZrZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/gGU3u4pSSk1F5dqWTj/giphy.gif' },
  { id: 'twopointer', name: 'Two Pointer', price: 60, tags: [], img: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYm42eGR0eXgxNXJsZnY4bWs3ZjNnZDBwaWVzcWp3bHRydXh1cTZ1aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/53vHv50CsI2ZBkyMCO/giphy.gif' },
  { id: 'baller', name: 'Baller', price: 70, tags: ['popular'], img: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDg2NDU5NzA5czJqNHFpaXlkeThraGhhcDZmMnNzbzkydDBrdW1uYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/KQITm19UZzMGYRNBpc/giphy.gif' },
  { id: 'hugofish', name: 'Hugo Fish', price: 70, tags: [], img: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExejl3Nnh5bXQ3endjcHoxc21kdWg3cnNyODl3enBzcjA4cWFyOWNjcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3WNHBQiZ0ewEXyAie8/giphy.gif' },
  { id: 'hat', name: 'Hat', price: 100, tags: ['special'], img: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3NqNWx2cXhlajFheDVsZjYwMDdodndlN2RzeGpvemUzZmlwNTBnaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/M5EdY0nX6kShHdVG3J/giphy.gif' },
  { id: 'military', name: 'Military', price: 100, tags: ['special'], img: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExanh0cG83MjZ6YTF4djhhNGYyMmRlYmJlYzJ2anF0MmowaXhlZ214cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/HL6atEC0FTza78wCLu/giphy.gif' },
  { id: 'gta', name: 'GTA', price: 100, tags: ['popular'], img: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXdtMDlwbmZlc3llaDhkaHVpd2N3dTdmdmJ3MjJraWhiazQ5YnpwbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/PllMPq6UD5v5wtVPGZ/giphy.gif' },
  { id: 'redturtle', name: 'Red Turtles', price: 100, tags: ['popular'], img: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3BmMzJrNm14cWVieGxqOXp4d3c3NTUxMTd6MWw4ZGdvNmYyYnc1dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/xThtatg3gef6Mxtx9C/giphy.gif' },
  { id: 'silver', name: 'Silver', price: 200, tags: ['special'], img: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnZ3a2ZwaHd0a282bXI0bDEzeWgwenJqdTB3MHJiYTk1OHdxYXExYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/YWMYIoTQfI5t2chkSZ/giphy.gif' },
  { id: 'baggy', name: 'Baggy', price: 200, tags: [], img: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDYxajdhbmRyNDg5OW5wdHJrcWVuY2c2M3pvMXQwbTl5cGRxbTN3aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/D8ANaAuXwrL2h7j121/giphy.gif' },
  { id: 'hugocrab', name: 'Hugo Crab', price: 250, tags: [], img: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExaW53cGF0NWMxbXZycWg3bXU0emkyaWlnaHNiNHJhcmhyOGltdXp1ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/VaRPzJt2JN7JSADxeO/giphy.gif' },
  { id: 'blueturtle', name: 'Blue Turtles', price: 400, tags: ['popular'], img: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXJ0eHBjZHd4bTAwZ3RxNWRlNjV1c3diengyNGdzY2lkdGJuc3Z6YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l0NgQrE8D1xMtaDpm/giphy.gif' },
  { id: 'anthem', name: 'Anthem', price: 500, tags: ['new'], img: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXRiYWtvZW92ajhjM2NqNGh5Yjc4aGJzOGZqbTByM3hlZWxubW92byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3IUZ6PDXlVcmjl0hQT/giphy.gif' },
  { id: 'spending', name: 'Spending', price: 500, tags: ['special'], img: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExejR6ODBmb3h4dGUxcjI3Ym81aGgxazZuamRna2duanpjNTB5NzN0ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/2Nw04Wv0XyqJKOIKOx/giphy.gif' },
  { id: 'masha', name: 'Masha', price: 500, tags: ['new'], img: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHliMjE0bjRuMHVxZG40NWpveWVjeHkxMTNpZ2U0MDA5eWgxemVhdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/qfLVkAWJ1hlAfxdNEQ/giphy.gif' },
  { id: 'dancebear', name: 'Dance Bear', price: 500, tags: [], img: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjE5NnEwdmh1cWgwdmRtb21uOGI2bTJrZzFlM2tmcnlueHdqbm5ldCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/e0vAqhhYCdwa8yt4Me/giphy.gif' },
  { id: 'bird', name: 'Bird', price: 800, tags: [], img: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjhodnZyb2o4YXp1a2w5bTJmOHpicGR1aXI2NmJhOGNyY2psd3E1byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/xUA7aN9pkDyCAvTqCI/giphy.gif' },
  { id: 'lavsh', name: 'Lavsh', price: 1000, tags: ['new'], img: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMW9xZzBreTNxcGo3ajc4amFxZWh3eGZ3eG1iYXkwZzF2ZTF6MTZkbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3d4Ict80VKePAxVJTN/giphy.gif' },
  { id: 'tushi', name: 'Tushi', price: 1000, tags: [], img: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWxlNHY1NzF6ZGtxa3M4NTN2dDZwamY1eHg0eGhpZ25xemUzd3A2eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Z2saGBPiHpUkJUCuT9/giphy.gif' },
  { id: 'hugolavshfish', name: 'Hugo Lavsh Fish', price: 1500, tags: ['special'], img: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2l0amM5Nnh4emR0aWVrN3Rtcnd0ZGN6NGo4aWtib3gya3N1MHozMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/M4MFNQnyUhAh42kUIv/giphy.gif' },
  { id: 'royalty', name: 'Royalty', price: 2000, tags: ['special'], img: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmVxdWFvbG5rdGV6dWZ4aHh6ZWk1MGlqcDBpdnF5ODU4Nmc4bHlvdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/1pnye1n5EWWHTu93Ly/giphy.gif' },
  { id: 'benz', name: 'Benz Ways', price: 5000, tags: ['special'], img: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnIzczk4ejBjdnN0cjJqeDF0Z2RxaGk2cHRuaXpwcTBsMnl1cjd2bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/uZzvdIC6Q5RzkGAZWH/giphy.gif' },
  { id: 'hugolavsh', name: 'Hugo Lavsh', price: 10000, tags: ['special'], img: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeXgzNDh6bm41MzFtbXdyaHg2b3llcHJjcG84ODRnM2x0aGM2d3dhMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9dg/9q9cH3s1pfV9VT7NYO/giphy.gif' },
  { id: 'goat', name: 'G.O.A.T', price: 15000, tags: ['special'], img: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXdhOTJodWhjNWRvMXExOGZvMG45dGZranZpeWE3OXI3ZnFqMzE5bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/PbGzW5b2kTGYEmakmr/giphy.gif' },
  { id: 'eagle', name: 'Eagle', price: 30000, tags: ['special'], img: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGJxdmxmYzVjYmg0OHl1ZW1oMzNoZzMxdnJ0bngzaGNmbDFsMHVxbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/UQ1EEYdz598GeAb5RC/giphy.gif' },
];

/** `gpoFilter()` @90059 — the tabs the sheet draws, "All Gifts" first. */
export const GIFT_FILTERS: { id: 'all' | GiftTag; label: string }[] = [
  { id: 'all', label: 'All Gifts' },
  { id: 'popular', label: 'Popular' },
  { id: 'new', label: 'New' },
  { id: 'special', label: 'Special' },
];

/** One line of the basket: a gift and how many of it were picked. */
export type GiftPick = { gift: GiftItem; qty: number };

export function giftTotal(picks: GiftPick[]): number {
  return picks.reduce((sum, pick) => sum + pick.gift.price * pick.qty, 0);
}

/**
 * `_gpoDoAddToComment()` @90100's attachment record. It carries no URL — a gift
 * is a receipt the comment renders as a chip, not an upload — so every field the
 * comment path needs to settle it later (`giftStatus`, `giftDocId`) is set from
 * here.
 */
export function giftMedia(picks: GiftPick[], targetUserId: string | null): CommentMedia[] {
  return picks.map(({ gift, qty }) => {
    const item: CommentMedia = {
      type: 'gift',
      giftId: gift.id,
      name: gift.name,
      qty,
      price: gift.price,
      subtotal: gift.price * qty,
      img: gift.img,
      filename: `gift_${gift.id}_${Date.now()}`,
      giftStatus: 'unclaimed',
    };
    if (targetUserId) item.targetUserId = targetUserId;
    return item;
  });
}
