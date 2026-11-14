import mqtt, { type MqttClient } from 'mqtt';
import type { ChoiceKey, EpilogueTier, PublicChapter } from '../data/story';
import type { AvatarConfig } from './avatar';

export type GamePhase =
  | 'LOBBY'
  | 'READING'
  | 'VOTING'
  | 'REVEAL'
  | 'LEADERBOARD'
  | 'EPILOGUE'
  | 'PODIUM';

export interface RevealPayload {
  chapterId: number;
  catholicRef: string;
  counts: Record<ChoiceKey, number>;
  outcomes: Record<ChoiceKey, string>;
}

export interface PlayerPublicSnapshot {
  name: string;
  avatar: AvatarConfig;
  score: number;
  lastChapterId?: number;
  lastChoice?: ChoiceKey;
  lastDieValue?: number;
  lastPointsDelta?: number;
  finalMemoryDie?: number;
  epilogueId?: EpilogueTier['id'];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: AvatarConfig;
  score: number;
  lastDelta?: number;
}

export interface RoomStateMessage {
  type: 'ROOM_STATE';
  msgId: string;
  roomCode: string;
  phase: GamePhase;
  chapterIndex: number;
  totalChapters: number;
  votingDurationSec: number;
  votingEndsAt: number | null;
  publicChapter: PublicChapter | null;
  reveal: RevealPayload | null;
  epilogueNarration: string | null;
  playerStates: Record<string, PlayerPublicSnapshot>;
  leaderboard: LeaderboardEntry[];
  updatedAt: number;
}

export type PlayerToHostMessage =
  | {
      type: 'JOIN';
      msgId: string;
      playerId: string;
      name: string;
      avatar: AvatarConfig;
      joinedAt: number;
    }
  | {
      type: 'SUBMIT_ACTION';
      msgId: string;
      playerId: string;
      chapterId: number;
      choice: ChoiceKey;
    }
  | {
      type: 'ROLL_MEMORY_DIE';
      msgId: string;
      playerId: string;
    };

export type ConnectionStatus = 'connecting' | 'online' | 'local-only';

const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';

export function makeMsgId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface HostChannel {
  publishState: (state: RoomStateMessage) => void;
  close: () => void;
}

export interface PlayerChannel {
  sendToHost: (msg: PlayerToHostMessage) => void;
  close: () => void;
}

export function createHostChannel(
  roomCode: string,
  onPlayerMessage: (msg: PlayerToHostMessage) => void,
  onStatusChange: (status: ConnectionStatus) => void,
): HostChannel {
  const seenIds = new Set<string>();
  const stateTopic = `sentinelas/rio-pomba/${roomCode}/state`;
  const inboxTopic = `sentinelas/rio-pomba/${roomCode}/to-host`;

  let bc: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    bc = new BroadcastChannel(`sentinelas-${roomCode}`);
    bc.onmessage = (event) => {
      const data = event.data as PlayerToHostMessage | undefined;
      if (!data || !data.msgId || seenIds.has(data.msgId)) return;
      if (data.type === 'JOIN' || data.type === 'SUBMIT_ACTION' || data.type === 'ROLL_MEMORY_DIE') {
        seenIds.add(data.msgId);
        onPlayerMessage(data);
      }
    };
  }

  onStatusChange('connecting');
  let client: MqttClient | null = null;
  try {
    client = mqtt.connect(MQTT_BROKER_URL, {
      clientId: `mestre-${roomCode}-${Math.random().toString(36).slice(2, 7)}`,
      clean: true,
      reconnectPeriod: 3000,
      connectTimeout: 8000,
    });

    client.on('connect', () => {
      onStatusChange('online');
      client?.subscribe(inboxTopic, { qos: 1 });
    });

    client.on('offline', () => onStatusChange('local-only'));
    client.on('error', () => onStatusChange('local-only'));

    client.on('message', (topic, payload) => {
      if (topic !== inboxTopic) return;
      try {
        const data = JSON.parse(payload.toString()) as PlayerToHostMessage;
        if (!data || !data.msgId || seenIds.has(data.msgId)) return;
        seenIds.add(data.msgId);
        onPlayerMessage(data);
      } catch {
        // Ignore malformed payloads
      }
    });
  } catch {
    onStatusChange('local-only');
  }

  return {
    publishState(state: RoomStateMessage) {
      bc?.postMessage(state);
      if (client?.connected) {
        client.publish(stateTopic, JSON.stringify(state), { qos: 1, retain: true });
      }
    },
    close() {
      bc?.close();
      client?.end(true);
    },
  };
}

export function createPlayerChannel(
  roomCode: string,
  onRoomState: (state: RoomStateMessage) => void,
  onStatusChange: (status: ConnectionStatus) => void,
): PlayerChannel {
  const seenIds = new Set<string>();
  const stateTopic = `sentinelas/rio-pomba/${roomCode}/state`;
  const inboxTopic = `sentinelas/rio-pomba/${roomCode}/to-host`;

  let bc: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    bc = new BroadcastChannel(`sentinelas-${roomCode}`);
    bc.onmessage = (event) => {
      const data = event.data as RoomStateMessage | undefined;
      if (!data || data.type !== 'ROOM_STATE' || seenIds.has(data.msgId)) return;
      seenIds.add(data.msgId);
      onRoomState(data);
    };
  }

  onStatusChange('connecting');
  let client: MqttClient | null = null;
  try {
    client = mqtt.connect(MQTT_BROKER_URL, {
      clientId: `jovem-${roomCode}-${Math.random().toString(36).slice(2, 7)}`,
      clean: true,
      reconnectPeriod: 3000,
      connectTimeout: 8000,
    });

    client.on('connect', () => {
      onStatusChange('online');
      client?.subscribe(stateTopic, { qos: 1 });
    });

    client.on('offline', () => onStatusChange('local-only'));
    client.on('error', () => onStatusChange('local-only'));

    client.on('message', (topic, payload) => {
      if (topic !== stateTopic) return;
      try {
        const data = JSON.parse(payload.toString()) as RoomStateMessage;
        if (!data || data.type !== 'ROOM_STATE' || seenIds.has(data.msgId)) return;
        seenIds.add(data.msgId);
        onRoomState(data);
      } catch {
        // Ignore malformed payloads
      }
    });
  } catch {
    onStatusChange('local-only');
  }

  return {
    sendToHost(msg: PlayerToHostMessage) {
      bc?.postMessage(msg);
      if (client?.connected) {
        client.publish(inboxTopic, JSON.stringify(msg), { qos: 1 });
      }
    },
    close() {
      bc?.close();
      client?.end(true);
    },
  };
}
