import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Award, Dices, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { EPILOGUE_TIERS, type ChoiceKey } from '../data/story';
import {
  createPlayerChannel,
  makeMsgId,
  type ConnectionStatus,
  type PlayerChannel,
  type RoomStateMessage,
} from '../lib/realtime';
import { Dice3D } from './Dice3D';

interface PlayerViewProps {
  initialRoomCode: string;
  onSwitchToHost: () => void;
}

function getOrCreatePlayerId(): string {
  const key = 'sentinelas_player_id_v1';
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const fresh = `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    sessionStorage.setItem(key, fresh);
    return fresh;
  } catch {
    return `p-${Math.random().toString(36).slice(2, 9)}`;
  }
}

export function PlayerView({ initialRoomCode, onSwitchToHost }: PlayerViewProps) {
  const playerId = useMemo(() => getOrCreatePlayerId(), []);
  const [roomInput, setRoomInput] = useState(initialRoomCode);
  const [nameInput, setNameInput] = useState(() => {
    try {
      return sessionStorage.getItem('sentinelas_player_name_v1') || '';
    } catch {
      return '';
    }
  });
  const [activeRoom, setActiveRoom] = useState(initialRoomCode ? initialRoomCode : '');
  const [joinedName, setJoinedName] = useState('');
  const [roomState, setRoomState] = useState<RoomStateMessage | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');

  const [selectedChoice, setSelectedChoice] = useState<ChoiceKey | null>(null);
  const [rollingChapterId, setRollingChapterId] = useState<number | null>(null);
  const [rollingMemory, setRollingMemory] = useState(false);

  const channelRef = useRef<PlayerChannel | null>(null);

  const connectAndJoin = useCallback(
    (code: string, charName: string) => {
      const cleanCode = code.trim();
      const cleanName = charName.trim();
      if (!cleanCode || !cleanName) return;

      try {
        sessionStorage.setItem('sentinelas_player_name_v1', cleanName);
      } catch {
        // ignore
      }

      setJoinedName(cleanName);
      setActiveRoom(cleanCode);
    },
    [],
  );

  // Auto-join only if both room code and previous session name exist? No — let youth confirm name first!
  useEffect(() => {
    if (!activeRoom || !joinedName) return;

    const ch = createPlayerChannel(activeRoom, setRoomState, setStatus);
    channelRef.current = ch;

    const sendJoin = () =>
      ch.sendToHost({
        type: 'JOIN',
        msgId: makeMsgId(),
        playerId,
        name: joinedName,
        joinedAt: Date.now(),
      });

    sendJoin();
    const retryTimer = window.setTimeout(sendJoin, 1500);

    return () => {
      window.clearTimeout(retryTimer);
      ch.close();
      channelRef.current = null;
    };
  }, [activeRoom, joinedName, playerId]);

  const myState = roomState?.playerStates[playerId];
  const currentChapter = roomState?.publicChapter ?? null;
  const currentChapterId = currentChapter?.id ?? null;

  // Reset local choice state when moving to a new chapter
  useEffect(() => {
    setSelectedChoice(null);
    setRollingChapterId(null);
  }, [currentChapterId]);

  // Stop rolling animation once Host sends back our die result
  useEffect(() => {
    if (
      currentChapterId &&
      myState?.lastChapterId === currentChapterId &&
      myState.lastDieValue !== undefined
    ) {
      const t = window.setTimeout(() => setRollingChapterId(null), 550);
      return () => window.clearTimeout(t);
    }
  }, [currentChapterId, myState?.lastChapterId, myState?.lastDieValue]);

  useEffect(() => {
    if (myState?.finalMemoryDie !== undefined) {
      const t = window.setTimeout(() => setRollingMemory(false), 550);
      return () => window.clearTimeout(t);
    }
  }, [myState?.finalMemoryDie]);

  function handleJoinSubmit(e: FormEvent) {
    e.preventDefault();
    connectAndJoin(roomInput, nameInput);
  }

  function handleRollForChapter() {
    if (!currentChapter || !selectedChoice) return;
    setRollingChapterId(currentChapter.id);
    channelRef.current?.sendToHost({
      type: 'SUBMIT_ACTION',
      msgId: makeMsgId(),
      playerId,
      chapterId: currentChapter.id,
      choice: selectedChoice,
    });
  }

  function handleRollMemoryDie() {
    setRollingMemory(true);
    channelRef.current?.sendToHost({
      type: 'ROLL_MEMORY_DIE',
      msgId: makeMsgId(),
      playerId,
    });
  }

  if (!activeRoom || !joinedName) {
    return (
      <main className="player-shell">
        <section className="card join-card">
          <span className="brand-badge">RPG Cataguases</span>
          <h1>As Pontes do Rio Pomba</h1>
          <p className="muted">
            Digite o PIN da sala e dê um nome para o seu personagem viver essa história.
          </p>

          <form onSubmit={handleJoinSubmit} className="join-form">
            <label className="field">
              <span>PIN da Sala</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Ex: 4829"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Nome do seu Personagem</span>
              <input
                type="text"
                maxLength={24}
                placeholder="Ex: Lucas, Maria, Gabriel..."
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
              />
            </label>

            <button type="submit" className="btn-primary btn-lg">
              Entrar na História
            </button>
          </form>

          <button type="button" className="btn-link" onClick={onSwitchToHost}>
            Sou o Mestre (abrir tela do notebook)
          </button>
        </section>
      </main>
    );
  }

  const phase = roomState?.phase ?? 'LOBBY';
  const hasRolledThisChapter = Boolean(
    currentChapter && myState?.lastChapterId === currentChapter.id && myState.lastDieValue,
  );
  const myRank = roomState
    ? roomState.leaderboard.findIndex((item) => item.id === playerId) + 1
    : 0;

  return (
    <div className="player-shell">
      <header className="player-topbar">
        <div className="player-identity">
          <strong>{joinedName}</strong>
          <small>Sala {activeRoom}</small>
        </div>

        <div className="player-score-group">
          <span className="score-pill">{myState?.score ?? 0} pts</span>
          <span className={`status-dot ${status === 'online' ? 'is-online' : 'is-local'}`} title={status}>
            {status === 'online' ? <Wifi size={14} /> : <WifiOff size={14} />}
          </span>
        </div>
      </header>

      <main className="player-main">
        {!roomState && (
          <section className="card player-card centered">
            <h2>Conectando na sala {activeRoom}...</h2>
            <p className="muted">Se demorar, confira se o PIN no telão é {activeRoom}.</p>
          </section>
        )}

        {roomState && phase === 'LOBBY' && (
          <section className="card player-card centered">
            <span className="brand-badge">Personagem pronto</span>
            <h2>{joinedName} entrou em Cataguases!</h2>
            <p className="muted">
              Olhe para o telão e aguarde o Mestre iniciar o Capítulo 1.
            </p>
          </section>
        )}

        {roomState && phase === 'READING' && currentChapter && (
          <section className="card player-card centered">
            <span className="act-tag">{currentChapter.act}</span>
            <h2>
              Cap. {currentChapter.id}: {currentChapter.title}
            </h2>
            <p className="muted">Acompanhe a narração do Mestre no telão...</p>
          </section>
        )}

        {roomState && phase === 'VOTING' && currentChapter && (
          <section className="card player-card">
            <div className="player-chapter-mini">
              <span>Cap. {currentChapter.id}</span>
              <strong>{currentChapter.title}</strong>
            </div>

            {!hasRolledThisChapter ? (
              <>
                <p className="prompt-label">1. Escolha o caminho do seu personagem:</p>
                <div className="choice-stack">
                  {currentChapter.options.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={`choice-btn ${selectedChoice === opt.key ? 'is-selected' : ''}`}
                      onClick={() => setSelectedChoice(opt.key)}
                      disabled={rollingChapterId === currentChapter.id}
                    >
                      <span className="option-badge">{opt.key}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>

                {selectedChoice && (
                  <div className="dice-action-box">
                    <p className="prompt-label">2. Agora jogue o dado para agir!</p>
                    <Dice3D
                      value={myState?.lastChapterId === currentChapter.id ? myState.lastDieValue ?? null : null}
                      rolling={rollingChapterId === currentChapter.id}
                    />
                    <button
                      type="button"
                      className="btn-primary btn-lg"
                      onClick={handleRollForChapter}
                      disabled={rollingChapterId === currentChapter.id}
                    >
                      <Dices size={20} />
                      {rollingChapterId === currentChapter.id ? 'Rolando...' : 'Jogar Dado!'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="dice-action-box centered">
                <Dice3D value={myState?.lastDieValue ?? 1} rolling={rollingChapterId === currentChapter.id} />
                <h2>Você tirou {myState?.lastDieValue}!</h2>
                <p className="muted">
                  Escolha <strong>{myState?.lastChoice}</strong> registrada. Aguarde o Mestre
                  revelar o desfecho no telão.
                </p>
              </div>
            )}
          </section>
        )}

        {roomState && phase === 'REVEAL' && currentChapter && roomState.reveal && (
          <section className="card player-card centered">
            {myState?.lastChapterId === currentChapter.id && myState.lastChoice ? (
              <>
                <Dice3D value={myState.lastDieValue ?? 1} rolling={false} size="md" />
                <span
                  className={`delta-badge ${
                    (myState.lastPointsDelta ?? 0) >= 0 ? 'is-positive' : 'is-negative'
                  }`}
                >
                  {(myState.lastPointsDelta ?? 0) >= 0
                    ? `+${myState.lastPointsDelta} pts`
                    : `${myState.lastPointsDelta} pts`}
                </span>
                <h2>
                  Você escolheu {myState.lastChoice} (Dado: {myState.lastDieValue})
                </h2>
                <p className="outcome-copy">
                  {myState.lastChoice === 'A'
                    ? roomState.reveal.optionAOutcome
                    : roomState.reveal.optionBOutcome}
                </p>
              </>
            ) : (
              <>
                <h2>Tempo encerrado neste capítulo</h2>
                <p className="muted">Acompanhe o desfecho no telão para o próximo capítulo.</p>
              </>
            )}

            <div className="catholic-ref-mini">
              <Sparkles size={15} />
              <span>{roomState.reveal.catholicRef}</span>
            </div>
          </section>
        )}

        {roomState && phase === 'EPILOGUE' && (
          <section className="card player-card centered">
            <span className="act-tag">Epílogo • 75 anos</span>
            <h2>A Ponte às Margens do Rio Pomba</h2>

            {myState?.finalMemoryDie === undefined ? (
              <div className="dice-action-box">
                <Dice3D value={null} rolling={rollingMemory} />
                <button
                  type="button"
                  className="btn-primary btn-lg"
                  onClick={handleRollMemoryDie}
                  disabled={rollingMemory}
                >
                  <Dices size={20} />
                  {rollingMemory ? 'Girando memória...' : 'Rolar Dado da Memória'}
                </button>
              </div>
            ) : (
              <div className="dice-action-box">
                <Dice3D value={myState.finalMemoryDie} rolling={rollingMemory} size="md" />
                {myState.epilogueId && (
                  <>
                    <h3>{EPILOGUE_TIERS[myState.epilogueId].title}</h3>
                    <span className="act-tag">{EPILOGUE_TIERS[myState.epilogueId].reference}</span>
                    <p className="outcome-copy">{EPILOGUE_TIERS[myState.epilogueId].description}</p>
                  </>
                )}
              </div>
            )}
          </section>
        )}

        {roomState && phase === 'PODIUM' && (
          <section className="card player-card centered">
            <Award size={40} className="podium-icon" />
            <span className="act-tag">Fim da Jornada</span>
            <h2>
              {myRank > 0 ? `${myRank}º lugar` : 'Jornada concluída'} • {myState?.score ?? 0} pts
            </h2>
            {myState?.epilogueId && (
              <>
                <h3>{EPILOGUE_TIERS[myState.epilogueId].title}</h3>
                <p className="outcome-copy">{EPILOGUE_TIERS[myState.epilogueId].description}</p>
              </>
            )}
            <p className="muted">Participe da partilha na roda com o grupo!</p>
          </section>
        )}
      </main>
    </div>
  );
}
