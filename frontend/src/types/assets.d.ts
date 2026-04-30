// Ambient module declarations for non-code assets imported as side effects.
// Next.js compiles these via PostCSS at build time; this file just keeps the
// TypeScript language server happy for path-aliased side-effect imports.
declare module '*.css';
declare module '@/styles/twin.css';
declare module '@/styles/globals.css';
