import { spawn } from 'child_process';
import * as fs from 'fs';
import { SingleBar, Presets } from 'cli-progress';
import { VideoCompressionQualityEnum } from '.';
import readline from 'readline';

/**
 * Compresses a video using FFmpeg.
 * @param {string} inputPath - Path to the input video file.
 * @param {string} outputPath - Path to save the compressed video file.
 * @param {VideoCompressionQualityEnum} quality - Desired quality of the output video ('bad', 'ok', 'good').
 */
export function compressVideo(inputPath: string, outputPath: string, quality: VideoCompressionQualityEnum): void {
  let crf: string;
  switch (quality) {
    case VideoCompressionQualityEnum.BAD:
      crf = '35';
      break;
    case VideoCompressionQualityEnum.OK:
      crf = '28';
      break;
    case VideoCompressionQualityEnum.GOOD:
      crf = '23';
      break;
    default:
      crf = '28';
  }

  // Get the total duration of the video using ffprobe
  const ffprobe = spawn('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    inputPath,
  ]);

  let totalDuration = 0;
  ffprobe.stdout.on('data', (data) => {
    totalDuration = parseFloat(data.toString());
  });

  ffprobe.on('close', (code) => {
    if (code !== 0 || totalDuration === 0) {
      console.error('Failed to retrieve video duration.');
      return;
    }

    // CLI Greetings
    const rocketAscii = String.fromCodePoint(0x1f680);
    console.log(`\n${rocketAscii} Compressing video: ${inputPath}\n`);

    // Create a CLI progress bar
    const progressBar = new SingleBar({}, Presets.shades_classic);
    progressBar.start(100, 0); // Start the progress bar with a range of 0 to 100%

    /**
     * Spawn the FFmpeg process to compress the video.
     */
    const ffmpeg = spawn('ffmpeg', [
      '-i',
      inputPath, // Input file
      '-vcodec',
      'libx264', // Video codec
      '-crf',
      crf, // Constant Rate Factor (0-51, 0 - lossless, 23 - default, 51 - worst)
      '-preset',
      'fast', // Compression speed
      '-y', // Overwrite output file if exists
      outputPath, // Output file
    ]);

    ffmpeg.stderr.on('data', (data) => {
      const output = data.toString();
      const timeMatch = output.match(/time=\d+:\d+:\d+\.\d+/);
      if (timeMatch) {
        const timeStr = timeMatch[0].split('=')[1];
        const timeParts = timeStr.split(':').map(parseFloat);
        const currentTime = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
        const percentage = (currentTime / totalDuration) * 100;
        progressBar.update(percentage);
      }
    });

    ffmpeg.on('close', () => {
      progressBar.update(100); // Update the progress bar to 100% when FFmpeg process ends
      progressBar.stop(); // Stop the progress bar when FFmpeg process ends

      const inputFileSize = fs.statSync(inputPath).size;
      const inputFileSizeMB = (inputFileSize / 1024 / 1024).toFixed(2);
      const outputFileSizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
      const percentage = ((+inputFileSizeMB / +outputFileSizeMB) * 100).toFixed(2);
      const arrowAscii = String.fromCodePoint(0x27ad);
      const checkMarkAscii = String.fromCodePoint(0x2713);

      // CLI Success message
      console.log(
        `\n${checkMarkAscii} Video compressed successfully: ${outputPath}\n${arrowAscii} Size: ${inputFileSizeMB} MB => ${outputFileSizeMB} MB\n${arrowAscii} Compression: ${percentage}%\n`
      );

      askToDeleteOriginalVideo(inputPath, outputPath);
    });
  });
}

/**
 * Asks the user if they want to delete the original video file.
 * @param {string} inputPath - Path to the original input video file.
 * @param {string} outputPath - Path to the compressed output video file.
 */
function askToDeleteOriginalVideo(inputPath: string, outputPath: string): void {
  const questionMarkAscii = String.fromCodePoint(0x003f);
  const checkMarkAscii = String.fromCodePoint(0x2713);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Ask the user if they want to delete the original video file with y | n prompt
  rl.question(`${questionMarkAscii} Do you want to delete the original video file? (y/n): `, (answer) => {
    if (answer.toLowerCase() === 'y') {
      fs.unlink(inputPath, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`${checkMarkAscii} Deleted original video file: ${inputPath}\n`);
        }
        rl.close();
        askToOpenInArcBrowser(outputPath);
      });
    } else {
      rl.close();
      askToOpenInArcBrowser(outputPath);
    }
  });
}

/**
 * Asks the user if they want to view the compressed video in Arc Browser.
 * @param {string} outputPath - Path to the compressed output video file.
 */
function askToOpenInArcBrowser(outputPath: string): void {
  const questionMarkAscii = String.fromCodePoint(0x003f);
  const checkMarkAscii = String.fromCodePoint(0x2713);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Ask the user if they want to view the compressed video in Arc Browser with y | n prompt
  rl.question(`${questionMarkAscii} Do you want to view the compressed video in Arc Browser? (y/n): `, (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log(`${checkMarkAscii} Starting Arc Browser...\n`);
      try {
        const arcCommand = spawn('open -a "Arc"', [outputPath], { shell: true });
        arcCommand.on('error', (err) => {
          console.error(err);
        });
      } catch (err) {
        console.error(err);
      }
    }
    rl.close();
  });
}
