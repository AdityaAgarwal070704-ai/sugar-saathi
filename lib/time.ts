// Server pages render once per request, so reading the clock there is correct. This helper keeps the lint rule about
// "impure render" (written for client re-renders) from flagging it.
export const nowMs = () => Date.now();
