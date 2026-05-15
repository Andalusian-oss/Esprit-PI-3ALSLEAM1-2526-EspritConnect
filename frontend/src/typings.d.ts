// Type declaration for sockjs-client (no @types package available for this version)
declare module 'sockjs-client' {
  class SockJS {
    constructor(url: string, _reserved?: unknown, options?: object);
    close(code?: number, reason?: string): void;
    send(data: string): void;
    onopen: (() => void) | null;
    onmessage: ((e: { data: string }) => void) | null;
    onclose: ((e: { code: number; reason: string; wasClean: boolean }) => void) | null;
    readyState: number;
    static CONNECTING: number;
    static OPEN: number;
    static CLOSING: number;
    static CLOSED: number;
  }
  export = SockJS;
}
