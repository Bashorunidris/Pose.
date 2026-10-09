import { AMBIENT, GRID_TEX, ORB, ORB_1, ORB_2, ORB_3, cx } from './styles';

/** `.ambient` @69 and `.grid-tex` @79 — the drifting orbs behind every page. */
export function Ambient() {
  return (
    <>
      <div className={AMBIENT} aria-hidden>
        <div className={cx(ORB, ORB_1)} />
        <div className={cx(ORB, ORB_2)} />
        <div className={cx(ORB, ORB_3)} />
      </div>
      <div className={GRID_TEX} aria-hidden />
    </>
  );
}
