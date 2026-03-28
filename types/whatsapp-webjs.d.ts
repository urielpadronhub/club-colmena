declare module 'whatsapp-web.js' {
  export interface ClientOptions {
    authStrategy: AuthStrategy;
    puppeteer?: PuppeteerOptions;
  }

  export interface PuppeteerOptions {
    headless?: boolean;
    args?: string[];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface AuthStrategy {
    // LocalAuth and other strategies
  }

  export class LocalAuth implements AuthStrategy {
    constructor(options?: { dataPath?: string });
  }

  export class Client {
    constructor(options: ClientOptions);
    initialize(): Promise<void>;
    destroy(): Promise<void>;
    on(event: 'qr', listener: (qr: string) => void): this;
    on(event: 'ready', listener: () => void): this;
    on(event: 'authenticated', listener: () => void): this;
    on(event: 'auth_failure', listener: (msg: string) => void): this;
    on(event: 'disconnected', listener: (reason: string) => void): this;
    on(event: 'change_state', listener: (state: string) => void): this;
    on(event: 'message', listener: (message: Message) => void): this;
    on(event: 'message_create', listener: (message: Message) => void): this;
  }

  export interface Message {
    from: string;
    fromMe: boolean;
    to: string;
    body: string;
    hasMedia: boolean;
    timestamp: number;

    getContact(): Promise<Contact>;
    getChat(): Promise<Chat>;
    reply(content: string): Promise<Message>;
    downloadMedia(): Promise<Media | undefined>;
  }

  export interface Contact {
    id: string;
    name?: string;
    pushname?: string;
    number: string;
    isMe: boolean;
    isGroup: boolean;
    isWAContact: boolean;
  }

  export interface Chat {
    id: string;
    name: string;
    isGroup: boolean;
    isReadOnly: boolean;
    unreadCount: number;
    timestamp: number;

    sendSeen(): Promise<void>;
    sendMessage(content: string): Promise<Message>;
    markRead(): Promise<void>;
  }

  export interface Media {
    mimetype: string;
    data: string; // base64
    filename?: string;
    filesize?: number;
  }
}

declare module 'qrcode-terminal' {
  export function generate(input: string, options?: { small?: boolean }): void;
}
