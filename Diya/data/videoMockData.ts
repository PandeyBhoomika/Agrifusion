// videoMockData.ts
// Re-exports from videoService so both import paths keep working.
// Previously the screen imported VideoModule from here — this file keeps that working.

export type { VideoModule } from './videoService';
export { mockVideos } from './videoService';
