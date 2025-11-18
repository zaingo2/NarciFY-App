/// <reference types="vite/client" />

// Fix: The variable `process` is already declared, likely by `@types/node`.
// This change augments the existing `NodeJS.ProcessEnv` interface to add
// custom environment variables, resolving the "Cannot redeclare" error.
declare namespace NodeJS {
    interface ProcessEnv {
        API_KEY?: string;
        VITE_PAYPAL_CLIENT_ID?: string;
    }
}
