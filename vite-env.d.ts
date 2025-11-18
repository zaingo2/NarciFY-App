
// This augments the NodeJS namespace to add type definitions for environment
// variables accessed via `process.env`. This is the standard and robust way
// to make TypeScript aware of variables injected by the execution environment
// without causing redeclaration errors.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly VITE_API_KEY: string;
    readonly VITE_PAYPAL_CLIENT_ID: string;
  }
}
