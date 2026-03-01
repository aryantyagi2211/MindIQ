// Deno type definitions for IDE support
// These are automatically available in Deno runtime

declare namespace Deno {
  export function env(key: string): string | undefined;
  export namespace env {
    export function get(key: string): string | undefined;
  }
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: {
      port?: number;
      hostname?: string;
      signal?: AbortSignal;
    }
  ): void;
}
