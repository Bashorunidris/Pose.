import { LOADER, LOADER_BAR, LOADER_FILL, LOADER_GONE, LOADER_ICON, cx } from './styles';

/** `#loader` @111. The legacy node was removed after the fade; here `done` just fades it out. */
export function Loader({ done }: { done: boolean }) {
  return (
    <div className={cx(LOADER, done && LOADER_GONE)} aria-hidden>
      <div className={LOADER_ICON}>
        <i className="fa-solid fa-satellite-dish" />
      </div>
      <div className={LOADER_BAR}>
        <div className={LOADER_FILL} />
      </div>
    </div>
  );
}
