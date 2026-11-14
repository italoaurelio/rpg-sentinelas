import { useState } from 'react';
import { HostView } from './components/HostView';
import { PlayerView } from './components/PlayerView';

function parseRoute(): { mode: 'host' | 'player'; roomCode: string } {
  if (typeof window === 'undefined') return { mode: 'host', roomCode: '' };
  const params = new URLSearchParams(window.location.search);
  const sala = params.get('sala') ?? '';
  const isPlayerPath = window.location.pathname.startsWith('/jogar') || Boolean(sala);
  return { mode: isPlayerPath ? 'player' : 'host', roomCode: sala };
}

export function App() {
  const initial = parseRoute();
  const [mode, setMode] = useState<'host' | 'player'>(initial.mode);
  const [roomCode, setRoomCode] = useState(initial.roomCode);

  function switchToPlayer(code: string) {
    setRoomCode(code);
    setMode('player');
    if (typeof window !== 'undefined') {
      const target = code ? `/jogar?sala=${code}` : '/jogar';
      window.history.pushState({}, '', target);
    }
  }

  function switchToHost() {
    setMode('host');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
  }

  return mode === 'player' ? (
    <PlayerView initialRoomCode={roomCode} onSwitchToHost={switchToHost} />
  ) : (
    <HostView onSwitchToPlayer={switchToPlayer} />
  );
}

export default App;
