/**
 * The dashboard's hand-rolled canvas line chart.
 *
 * The legacy pages pulled in Chart.js for exactly one chart each — Studio's
 * `drawChart()` and Earnings' `renderEarningsChart()` — and both drew the same
 * thing: a smoothed, filled 6-point line on a 5-row grid. This is that drawing,
 * shared, with no chart library in the bundle.
 */

export type LineChartOptions = {
  data: number[];
  labels: string[];
  color: string;
  /** Line thickness — Studio draws 2.5, Earnings drew 3. */
  lineWidth?: number;
  /** Alpha of the fill gradient's top stop, as a hex pair (`40`, `22`). */
  fillAlpha?: string;
  /** Studio marked every point with a filled dot; Earnings drew none. */
  showPoints?: boolean;
  gridColor?: string;
  /** Rendered against the y axis; defaults to the compact `1.2K` / `3.4M` form. */
  formatYTick?: (value: number) => string;
  /** Upper bound used when every value is zero, so the line isn't flat on the axis. */
  emptyMax?: number;
};

const LABEL_FONT = '10px DM Sans, sans-serif';
const LABEL_COLOR = '#A1A1AA';
const PAD = { t: 16, r: 14, b: 30, l: 46 };

function defaultTick(value: number): string {
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
  return `${Math.round(value)}`;
}

export function drawLineChart(canvas: HTMLCanvasElement, options: LineChartOptions): void {
  const ctx = canvas.getContext('2d');
  const { data, labels, color } = options;
  if (!ctx || data.length < 2 || !canvas.offsetWidth) return;

  const lineWidth = options.lineWidth ?? 2.5;
  const fillAlpha = options.fillAlpha ?? '40';
  const formatYTick = options.formatYTick ?? defaultTick;

  const ratio = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(ratio, ratio);

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  const innerWidth = width - PAD.l - PAD.r;
  const innerHeight = height - PAD.t - PAD.b;

  const allZero = data.every((value) => value === 0);
  const minValue = allZero ? 0 : Math.min(...data) * 0.88;
  const maxValue = allZero ? (options.emptyMax ?? 10) : Math.max(...data) * 1.06;
  const range = maxValue - minValue || 1;

  const px = (index: number) => PAD.l + (index / (data.length - 1)) * innerWidth;
  const py = (value: number) => height - PAD.b - ((value - minValue) / range) * innerHeight;

  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = options.gridColor ?? '#F4F4F5';
  ctx.lineWidth = 1;
  for (let grid = 0; grid <= 4; grid++) {
    const y = PAD.t + (innerHeight * grid) / 4;
    ctx.beginPath();
    ctx.moveTo(PAD.l, y);
    ctx.lineTo(width - PAD.r, y);
    ctx.stroke();
  }

  const gradient = ctx.createLinearGradient(0, PAD.t, 0, height - PAD.b);
  gradient.addColorStop(0, `${color}${fillAlpha}`);
  gradient.addColorStop(1, `${color}00`);

  const trace = () => {
    ctx.moveTo(px(0), py(data[0] as number));
    for (let i = 1; i < data.length; i++) {
      const cx = (px(i - 1) + px(i)) / 2;
      ctx.bezierCurveTo(cx, py(data[i - 1] as number), cx, py(data[i] as number), px(i), py(data[i] as number));
    }
  };

  ctx.beginPath();
  trace();
  ctx.lineTo(px(data.length - 1), height - PAD.b);
  ctx.lineTo(px(0), height - PAD.b);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  trace();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.stroke();

  if (options.showPoints) {
    data.forEach((value, index) => {
      ctx.beginPath();
      ctx.arc(px(index), py(value), 4.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  ctx.font = LABEL_FONT;
  ctx.fillStyle = LABEL_COLOR;
  ctx.textAlign = 'center';
  labels.forEach((label, index) => ctx.fillText(label, px(index), height - 7));

  ctx.textAlign = 'right';
  for (let grid = 0; grid <= 4; grid++) {
    const value = minValue + range * (1 - grid / 4);
    const y = PAD.t + (innerHeight * grid) / 4;
    ctx.fillText(formatYTick(value), PAD.l - 5, y + 4);
  }
}
