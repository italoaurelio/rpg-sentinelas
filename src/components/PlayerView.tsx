import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Award, Clock, Dices, Sparkles, Trophy, Wifi, WifiOff } from 'lucide-react';
import { EPILOGUE_TIERS, type ChoiceKey } from '../data/story';
import { randomAvatarConfig, type AvatarConfig } from '../lib/avatar';
import {
  createPlayerChannel,
  makeMsgId,
  type ConnectionStatus,
  type PlayerChannel,
  type RoomStateMessage,
} from '../lib/realtime';
import { AvatarBuilder } from './AvatarBuilder';
import { AvatarView } from './AvatarView';
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

function loadSavedAvatar(): AvatarConfig {
  try {
    const raw = sessionStorage.getItem('sentinelas_player_avatar_v1');
    if (raw) return JSON.parse(raw) as AvatarConfig;
  } catch {
    // ignore
  }
  return randomAvatarConfig();
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
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => loadSavedAvatar());
  const [activeRoom, setActiveRoom] = useState(initialRoomCode ? initialRoomCode : '');
  const [joinedName, setJoinedName] = useState('');
  const [roomState, setRoomState] = useState<RoomStateMessage | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const [selectedChoice, setSelectedChoice] = useState<ChoiceKey | null>(null);
  const [rollingChapterId, setRollingChapterId] = useState<number | null>(null);
  const [rollingMemory, setRollingMemory] = useState(false);

  const channelRef = useRef<PlayerChannel | null>(null);

  const connectAndJoin = useCallback(
    (code: string, charName: string, avatar: AvatarConfig) => {
      const cleanCode = code.trim();
      const cleanName = charName.trim();
      if (!cleanCode || !cleanName) return;

      try {
        sessionStorage.setItem('sentinelas_player_name_v1', cleanName);
        sessionStorage.setItem('sentinelas_player_avatar_v1', JSON.stringify(avatar));
      } catch {
        // ignore
      }

      setJoinedName(cleanName);
      setActiveRoom(cleanCode);
    },
    [],
  );

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
        avatar: avatarConfig,
        joinedAt: Date.now(),
      });

    sendJoin();
    const retryTimer = window.setTimeout(sendJoin, 1500);

    return () => {
      window.clearTimeout(retryTimer);
      ch.close();
      channelRef.current = null;
    };
  }, [activeRoom, joinedName, playerId, avatarConfig]);

  const myState = roomState?.playerStates[playerId];
  const currentChapter = roomState?.publicChapter ?? null;
  const currentChapterId = currentChapter?.id ?? null;

  useEffect(() => {
    setSelectedChoice(null);
    setRollingChapterId(null);
  }, [currentChapterId]);

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

  // Countdown tick synced with roomState.votingEndsAt
  useEffect(() => {
    if (roomState?.phase !== 'VOTING' || !roomState.votingEndsAt) {
      setSecondsLeft(null);
      return;
    }
    const endsAt = roomState.votingEndsAt;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 300);
    return () => window.clearInterval(id);
  }, [roomState?.phase, roomState?.votingEndsAt]);

  function handleJoinSubmit(e: FormEvent) {
    e.preventDefault();
    connectAndJoin(roomInput, nameInput, avatarConfig);
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
          <div className="player-hero-crest">
            <img
              src="/sentinelas-logo.png"
              alt="Logo Sentinelas"
              width={903}
              height={1024}
              className="sentinelas-logo-lg"
            />
            <div className="player-hero-copy">
              <span className="hero-eyebrow">Grupo de Jovens • N. Sra. do Rosário</span>
              <h1>Por amor, por querer, a decisão de se doar</h1>
            </div>
          </div>
          <p className="muted">
            Personalize seu personagem, dê um nome e entre com o PIN exibido no telão.
          </p>

          <form onSubmit={handleJoinSubmit} className="join-form">
            <AvatarBuilder
              value={avatarConfig}
              onChange={setAvatarConfig}
              previewName={nameInput}
            />

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
  const timeExpired = secondsLeft === 0;
  const myRank = roomState
    ? roomState.leaderboard.findIndex((item) => item.id === playerId) + 1
    : 0;

  return (
    <div className="player-shell">
      <header className="player-topbar">
        <div className="player-identity-row">
          <AvatarView config={avatarConfig} name={joinedName} size={40} />
          <div className="player-identity">
            <strong>{joinedName}</strong>
            <small>Sala {activeRoom}</small>
          </div>
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
            <AvatarView config={avatarConfig} name={joinedName} size={88} />
            <span className="brand-badge">Personagem pronto</span>
            <h2>{joinedName} chegou em Cataguases!</h2>
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
              <div>
                <span>Cap. {currentChapter.id}</span>
                <strong>{currentChapter.title}</strong>
              </div>
              {secondsLeft !== null && (
                <span className={`player-timer-pill ${timeExpired ? 'is-expired' : ''}`}>
                  <Clock size={14} /> {secondsLeft}s
                </span>
              )}
            </div>

            {!hasRolledThisChapter ? (
              timeExpired ? (
                <div className="dice-action-box centered">
                  <h2>Tempo esgotado!</h2>
                  <p className="muted">Aguarde o Mestre revelar os desfechos desta cena.</p>
                </div>
              ) : (
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
                        <span className={`option-badge badge-${opt.key.toLowerCase()}`}>
                          {opt.key}
                        </span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  {selectedChoice && (
                    <div className="dice-action-box">
                      <p className="prompt-label">2. Agora jogue o dado para agir!</p>
                      <Dice3D
                        value={
                          myState?.lastChapterId === currentChapter.id
                            ? myState.lastDieValue ?? null
                            : null
                        }
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
              )
            ) : (
              <div className="dice-action-box centered">
                <Dice3D
                  value={myState?.lastDieValue ?? 1}
                  rolling={rollingChapterId === currentChapter.id}
                />
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
                  {roomState.reveal.outcomes[myState.lastChoice]}
                </p>
              </>
            ) : (
              <>
                <h2>Tempo encerrado neste capítulo</h2>
                <p className="muted">Acompanhe o desfecho no telão para a próxima rodada.</p>
              </>
            )}

            <div className="catholic-ref-mini">
              <Sparkles size={15} />
              <span>{roomState.reveal.catholicRef}</span>
            </div>
          </section>
        )}

        {roomState && phase === 'LEADERBOARD' && (
          <section className="card player-card centered">
            <Trophy size={36} className="podium-icon" />
            <AvatarView config={avatarConfig} name={joinedName} size={76} />
            <span className="act-tag">Placar da Rodada</span>
            <h2>
              {myRank > 0 ? `${myRank}º lugar` : 'No placar'} de {roomState.leaderboard.length}
            </h2>
            <span className="score-hero">{myState?.score ?? 0} pontos</span>
            {myState?.lastChapterId === currentChapterId && myState.lastPointsDelta !== undefined && (
              <span
                className={`delta-badge ${
                  myState.lastPointsDelta >= 0 ? 'is-positive' : 'is-negative'
                }`}
              >
                Última rodada:{' '}
                {myState.lastPointsDelta >= 0
                  ? `+${myState.lastPointsDelta} pts`
                  : `${myState.lastPointsDelta} pts`}
              </span>
            )}
            <p className="muted">Prepare-se para o próximo capítulo!</p>
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
            <AvatarView config={avatarConfig} name={joinedName} size={80} />
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
