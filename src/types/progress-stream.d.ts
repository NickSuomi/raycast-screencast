declare module 'progress-stream' {
  import { Stream } from 'stream';

  interface ProgressOptions {
    length: number;
    time: number;
  }

  interface ProgressData {
    percentage: number;
    transferred: number;
    length: number;
    remaining: number;
    eta: number;
    runtime: number;
    delta: number;
    speed: number;
  }

  interface ProgressStream extends Stream {
    on(event: 'progress', listener: (progress: ProgressData) => void): this;
  }

  function progress(options: ProgressOptions): ProgressStream;

  export = progress;
}
