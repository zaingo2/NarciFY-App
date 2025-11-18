// This file provides type definitions for environment variables
// accessed via `process.env`. This is necessary because the hosting
// environment injects variables into `process.env` at runtime,
// even in a Vite project structure. This setup prevents TypeScript
// errors about 'process' not being defined in a browser context.

// Fix: Use namespace augmentation to add types to the existing
// global `process.env` type. This avoids redeclaring the `process`
// variable, which can cause conflicts with types from other packages
// (like @types/node) and fixes the "Cannot redeclare" error.
declare namespace NodeJS {
  interface ProcessEnv {
    VITE_API_KEY?: string;
    VITE_PAYPAL_CLIENT_ID?: string;
  }
}
