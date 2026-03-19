/// <reference types="vite/client" />

// This tells TypeScript that .png imports are valid and return a URL string.
// Vite handles this automatically at build time.
declare module "*.png" {
  const src: string;
  export default src;
}
