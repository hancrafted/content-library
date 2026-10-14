// A minimal DevTools-protocol client over Node's built-in WebSocket: one
// browser-level connection, with a Send per flattened target session.
export type Send = (method: string, params?: object) => Promise<Record<string, unknown>>;
interface Message {
  id?: number;
  method?: string;
  sessionId?: string;
  result?: Record<string, unknown>;
  error?: { message: string };
}

export interface Connection {
  /** A Send for the browser itself, or for the target session given. */
  sender: (sessionId?: string) => Send;
  events: EventTarget;
  socket: WebSocket;
}

/** The event name `events` dispatches for a session's protocol event. */
export const eventName = (sessionId: string, method: string): string => `${sessionId}:${method}`;

export async function connect(port: number): Promise<Connection> {
  const version = (await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()) as {
    webSocketDebuggerUrl: string;
  };
  const socket = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', () => reject(new Error('could not connect to the browser')), { once: true });
  });
  const pending = new Map<number, (message: Message) => void>();
  const events = new EventTarget();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data)) as Message;
    if (message.id) pending.get(message.id)?.(message);
    else events.dispatchEvent(new Event(eventName(String(message.sessionId), String(message.method))));
  });
  let nextId = 0;
  const sender =
    (sessionId?: string): Send =>
    (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++nextId;
        pending.set(id, (message) =>
          message.error ? reject(new Error(message.error.message)) : resolve(message.result ?? {}),
        );
        socket.send(JSON.stringify({ id, method, params, sessionId }));
      });
  return { sender, events, socket };
}

export async function evaluate<T>(send: Send, expression: string): Promise<T> {
  const { result } = (await send('Runtime.evaluate', { expression, returnByValue: true })) as { result: { value: T } };
  return result.value;
}
