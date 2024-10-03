import * as fs from 'fs';
import { compressVideo } from './compressVideo';

export enum VideoCompressionQualityEnum {
  BAD = 'bad',
  OK = 'ok',
  GOOD = 'good',
}

export type VideoCompressionOptions = {
  inputPath: string;
  outputPath: string;
  quality: VideoCompressionQualityEnum;
};

const main = (): void => {
  try {
    const [, , inputPath, qualityArg] = process.argv;

    if (!inputPath) {
      console.error('Usage: ts-node compressVideo.ts <inputPath> <quality>');
      process.exit(1);
    }

    if (!fs.existsSync(inputPath)) {
      console.error(`Input file does not exist: ${inputPath}`);
      process.exit(1);
    }

    const quality = qualityArg as VideoCompressionQualityEnum;
    if (qualityArg && !Object.values(VideoCompressionQualityEnum).includes(quality)) {
      console.error('Invalid quality parameter. Use "bad", "ok", or "good".');
      process.exit(1);
    }

    const outputPath = inputPath.replace(/\.[^.]+$/, '') + '_compressed.mp4';

    compressVideo(inputPath, outputPath, quality || VideoCompressionQualityEnum.OK);
  } catch (error) {
    console.error('Failed to compress video:', error);
  }
};

main();
