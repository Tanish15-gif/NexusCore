import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5066"
).replace(/\/$/, "");

type TransferNotificationListener = (amount: number) => void | Promise<void>;

let connection: HubConnection | null = null;
let startPromise: Promise<void> | null = null;

const transferListeners = new Set<TransferNotificationListener>();

function createConnection(): HubConnection {
  const hubConnection = new HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/notificationHub`, {
      accessTokenFactory: () => localStorage.getItem("nexus_token") ?? "",
    })
    .withAutomaticReconnect([0, 2_000, 10_000, 30_000])
    .configureLogging(
      import.meta.env.DEV ? LogLevel.Information : LogLevel.Warning,
    )
    .build();

  hubConnection.on(
    "ReceiveTransferNotification",
    (rawAmount: number | string) => {
      const amount = Number(rawAmount);

      if (!Number.isFinite(amount)) {
        return;
      }

      transferListeners.forEach((listener) => {
        void listener(amount);
      });
    },
  );

  hubConnection.onreconnecting((error) => {
    console.warn("NexusCore realtime connection reconnecting.", error);
  });

  hubConnection.onreconnected(() => {
    console.info("NexusCore realtime connection restored.");
  });

  hubConnection.onclose((error) => {
    if (error) {
      console.error("NexusCore realtime connection closed.", error);
    }
  });

  return hubConnection;
}

export async function startNotificationHub(): Promise<void> {
  const token = localStorage.getItem("nexus_token");

  if (!token) {
    return;
  }

  if (!connection) {
    connection = createConnection();
  }

  if (
    connection.state === HubConnectionState.Connected ||
    connection.state === HubConnectionState.Connecting ||
    connection.state === HubConnectionState.Reconnecting
  ) {
    return;
  }

  if (startPromise) {
    return startPromise;
  }

  startPromise = connection
    .start()
    .then(() => {
      console.info("NexusCore realtime notifications connected.");
    })
    .catch((error: unknown) => {
      console.error("SignalR connection failed.", error);
    })
    .finally(() => {
      startPromise = null;
    });

  return startPromise;
}

export async function stopNotificationHub(): Promise<void> {
  if (!connection) {
    return;
  }

  if (connection.state !== HubConnectionState.Disconnected) {
    await connection.stop();
  }

  connection = null;
  startPromise = null;
}

export function subscribeToTransferNotifications(
  listener: TransferNotificationListener,
): () => void {
  transferListeners.add(listener);

  return () => {
    transferListeners.delete(listener);
  };
}
