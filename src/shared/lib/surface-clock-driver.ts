import { createSurfaceClock, type SurfaceGeometry } from './surface-clock';

/** Browser-independent ports make scheduling observable without DOM or ambient time. Reads precede publication. */
export interface SurfaceClockEnvironment {
  readGeometry(): SurfaceGeometry;
  readPosition(): number;
  frame(run: () => void): number;
  cancelFrame(id: number): void;
  timer(run: () => void, delay: number): number;
  cancelTimer(id: number): void;
}

/** One driver per page. Resize holds the cache until 500ms quiet; layout and controlled CSS edits request refresh. */
class SurfaceDriver {
  private disposed = false;
  private dirty = true;
  private resizing = false;
  private frame: number | undefined;
  private timer: number | undefined;
  readonly clock = createSurfaceClock(() => {
    this.dirty = true;
    this.scroll();
  });
  constructor(private readonly environment: SurfaceClockEnvironment) {
    this.scroll();
  }
  private update = () => {
    this.frame = undefined;
    if (this.disposed) return;
    const position = this.environment.readPosition();
    const geometry = this.dirty && !this.resizing ? this.environment.readGeometry() : undefined;
    if (geometry) {
      this.dirty = false;
      this.clock.setGeometry(geometry, position);
    }
    this.clock.setPosition(position);
  };
  scroll = () => {
    if (!this.disposed && this.frame === undefined) this.frame = this.environment.frame(this.update);
  };
  resize = () => {
    if (this.disposed) return;
    this.resizing = true;
    this.dirty = true;
    if (this.timer !== undefined) this.environment.cancelTimer(this.timer);
    this.timer = this.environment.timer(() => {
      this.timer = undefined;
      this.resizing = false;
      this.scroll();
    }, 500);
  };
  dispose() {
    this.disposed = true;
    this.clock.dispose();
    if (this.frame !== undefined) this.environment.cancelFrame(this.frame);
    if (this.timer !== undefined) this.environment.cancelTimer(this.timer);
  }
}
export function driveSurfaceClock(environment: SurfaceClockEnvironment) {
  return new SurfaceDriver(environment);
}
