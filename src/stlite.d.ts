declare interface Window {
  stlite: {
    mount: (options: any, el: HTMLElement) => void;
  };
}

declare module '@stlite/mountable' {
  export interface MountOptions {
    requirements?: string[];
    entrypoint?: string;
    files?: Record<string, string | Uint8Array>;
    /**
     * @deprecated Use 'files' instead.
     */
    streamlitConfig?: Record<string, any>;
  }

  export function mount(options: MountOptions, el: HTMLElement): void;
}
