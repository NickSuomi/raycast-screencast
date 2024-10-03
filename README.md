# Video Compression with FFmpeg and Progress Bar

This project compresses a video using FFmpeg and provides a real-time progress bar in the terminal. It uses `ffprobe` to get the total duration of the video and `cli-progress` to display the progress. Additionally, it prompts the user to delete the original video and open the compressed video in Arc Browser.

## Requirements

- Node.js
- Bun (optional)
- TypeScript
- FFmpeg
- ffprobe

Ensure that `ffmpeg` and `ffprobe` are installed and available in your system's PATH.

## Installation

1. Clone the repository:

   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

## Usage

To compress a video, run the script with the following command:

```sh
npx ts-node index.ts <inputPath> <quality>
```

OR

```sh
bun run index.ts <inputPath> <quality>
```

- `<inputPath>`: The path to your input video file.
- `<quality>`: The desired quality of the output video (`bad`, `ok`, `good`). This parameter is optional and defaults to `ok`.

Example:

```sh
npx ts-node index.ts video.mp4 good
```

This will compress `video.mp4` to a file named `video_compressed.mp4` with high quality.

## Code Explanation

### `index.ts`

- **Imports**:
  - `fs`: Interacts with the file system.
  - `compressVideo` from `./compressVideo`: The function that handles video compression.

- **Enum and Type Definitions**:
  - `VideoCompressionQualityEnum`: Enum defining video quality options (`bad`, `ok`, `good`).
  - `VideoCompressionOptions`: Type for video compression options.

- **`main` Function**:
  - Parses command-line arguments to get the input video path and quality.
  - Checks if the input video path is provided.
  - Checks if the input file exists.
  - Validates the quality parameter.
  - Constructs the output file path by appending `_compressed.mp4` to the input file name.
  - Calls `compressVideo` with the parsed parameters.

### `compressVideo.ts`

- **Imports**:
  - `spawn` from `child_process`: Executes external commands like FFmpeg and ffprobe.
  - `fs`: Interacts with the file system.
  - `SingleBar` and `Presets` from `cli-progress`: Creates and manages a progress bar in the terminal.
  - `Video

CompressionQualityEnum`: Enum for specifying video compression quality.

- `readline`: Used for interactive prompts in the terminal.

- **`compressVideo` Function**:
  - **Parameters**:
    - `inputPath`: Path to the input video file.
    - `outputPath`: Path to save the compressed video file.
    - `quality`: Desired quality of the output video (`bad`, `ok`, `good`).

  - **Determine CRF (Constant Rate Factor)**:
    - Sets the CRF value based on the `quality` parameter.

  - **Get Video Duration with `ffprobe`**:
    - Uses `ffprobe` to get the total duration of the input video.

  - **Create and Start Progress Bar**:
    - Creates a progress bar using `cli-progress`.

  - **Spawn FFmpeg Process**:
    - Runs FFmpeg to compress the video.
    - FFmpeg's stderr is piped to capture the progress of the video compression.

  - **Update Progress Bar**:
    - Extracts the current processing time from FFmpeg's stderr output.
    - Calculates the percentage of completion based on the total video duration.
    - Updates the progress bar with the calculated percentage.

  - **Handle FFmpeg Process Completion**:
    - Stops the progress bar when FFmpeg completes.
    - Calculates the sizes of the input and output files in megabytes and determines the compression percentage.
    - Logs a success message with the output file size and compression percentage.
    - Prompts the user to delete the original video file and open the compressed video in Arc Browser.

- **`askToDeleteOriginalVideo` Function**:
  - Prompts the user with a `y/n` question to delete the original video file.
  - Deletes the original video file if the user responds with `y`.
  - Calls `askToOpenInArcBrowser` after handling the user's response.

- **`askToOpenInArcBrowser` Function**:
  - Prompts the user with a `y/n` question to open the compressed video in Arc Browser.
  - Opens the compressed video in Arc Browser if the user responds with `y`.

## License

This project is licensed under the MIT License.
