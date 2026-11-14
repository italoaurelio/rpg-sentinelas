import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  BookOpen,
  CheckCircle2,
  Crown,
  Dices,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { CHAPTERS, EPILOGUE_NARRATION, type ChoiceKey } from '../data/story';
import {
  calculateRoundPoints,
  generateRoomCode,
  getEpilogue,
  rollBiasedDie,
  sanitizeChapterForPlayer,
  sortLeaderboard,
  type PlayerRecord,
} from '../lib/gameEngine';
import {
  createHostChannel,
  makeMsgId,
  type ConnectionStatus,
  type GamePhase,
  type HostChannel,
  type PlayerPublicSnapshot,
  type PlayerToHostMessage,
  type RevealPayload,
  type RoomStateMessage,
} from '../lib/realtime';

interface HostViewProps {
  onSwitchToPlayer: (roomCode: string) => void;
}

const STORAGE_KEY = 'sentinelas_host_session_v1';

interface PersistedHost {
  roomCode: string;
  phase: GamePhase;
  chapterIndex: number;
  players: Record<string, PlayerRecord>;
}

function loadInitialHost(): PersistedHost {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedHost;
      if (parsed && parsed.roomCode && typeof parsed.chapterIndex === 'number') {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return {
    roomCode: generateRoomCode(),
    phase: 'LOBBY',
    chapterIndex: 0,
    players: {},
  };
}

export function HostView({ onSwitchToPlayer }: HostViewProps) {
  const initial = useMemo(() => loadInitialHost(), []);
  const [roomCode, setRoomCode] = useState(initial.roomCode);
  const [phase, setPhase] = useState<GamePhase>(initial.phase);
  const [chapterIndex, setChapterIndex] = useState(initial.chapterIndex);
  const [players, setPlayers] = useState<Record<string, PlayerRecord>>(initial.players);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');

  const channelRef = useRef<HostChannel | null>(null);
  const stateRef = useRef({ roomCode, phase, chapterIndex, players });
  stateRef.current = { roomCode, phase, chapterIndex, players };

  const currentChapter = CHAPTERS[chapterIndex] ?? CHAPTERS[0];
  const playerList = useMemo(() => Object.values(players), [players]);
  const sortedPlayers = useMemo(() => sortLeaderboard(playerList), [playerList]);

  const buildSnapshot = useCallback(
    (
      code: string,
      nextPhase: GamePhase,
      nextChapterIdx: number,
      nextPlayers: Record<string, PlayerRecord>,
    ): RoomStateMessage => {
      const ch = CHAPTERS[nextChapterIdx] ?? CHAPTERS[0];
      const publicChapter =
        nextPhase === 'READING' || nextPhase === 'VOTING' || nextPhase === 'REVEAL'
          ? sanitizeChapterForPlayer(ch)
          : null;

      let reveal: RevealPayload | null = null;
      if (nextPhase === 'REVEAL') {
        const all = Object.values(nextPlayers);
        const countA = all.filter((p) => p.rounds[ch.id]?.choice === 'A').length;
        const countB = all.filter((p) => p.rounds[ch.id]?.choice === 'B').length;
        reveal = {
          chapterId: ch.id,
          catholicRef: ch.catholicRef,
          countA,
          countB,
          optionAOutcome: ch.options[0].outcomeText,
          optionBOutcome: ch.options[1].outcomeText,
        };
      }

      const playerStates: Record<string, PlayerPublicSnapshot> = {};
      for (const p of Object.values(nextPlayers)) {
        const round = p.rounds[ch.id];
        playerStates[p.id] = {
          name: p.name,
          score: p.score,
          lastChapterId: round?.chapterId,
          lastChoice: round?.choice,
          lastDieValue: round?.dieValue,
          lastPointsDelta: round?.pointsDelta,
          finalMemoryDie: p.finalMemoryDie,
          epilogueId:
            nextPhase === 'EPILOGUE' || nextPhase === 'PODIUM' ? getEpilogue(p.score).id : undefined,
        };
      }

      const leaderboard = sortLeaderboard(Object.values(nextPlayers)).map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
      }));

      return {
        type: 'ROOM_STATE',
        msgId: makeMsgId(),
        roomCode: code,
        phase: nextPhase,
        chapterIndex: nextChapterIdx,
        totalChapters: CHAPTERS.length,
        publicChapter,
        reveal,
        epilogueNarration:
          nextPhase === 'EPILOGUE' || nextPhase === 'PODIUM' ? EPILOGUE_NARRATION : null,
        playerStates,
        leaderboard,
        updatedAt: Date.now(),
      };
    },
    [],
  );

  // Persist locally so accidental refresh keeps scores
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ roomCode, phase, chapterIndex, players }),
      );
    } catch {
      // ignore storage errors
    }
  }, [roomCode, phase, chapterIndex, players]);

  // Broadcast updated state whenever room state changes
  useEffect(() => {
    channelRef.current?.publishState(buildSnapshot(roomCode, phase, chapterIndex, players));
  }, [roomCode, phase, chapterIndex, players, buildSnapshot]);

  const handlePlayerMessage = useCallback((msg: PlayerToHostMessage) => {
    const snap = stateRef.current;

    if (msg.type === 'JOIN') {
      setPlayers((prev) => {
        const existing = prev[msg.playerId];
        if (existing) {
          return {
            ...prev,
            [msg.playerId]: { ...existing, name: msg.name.trim() || existing.name },
          };
        }
        return {
          ...prev,
          [msg.playerId]: {
            id: msg.playerId,
            name: msg.name.trim() || 'Sentinela',
            score: 0,
            connectedAt: msg.joinedAt,
            rounds: {},
          },
        };
      });
      return;
    }

    if (msg.type === 'SUBMIT_ACTION') {
      const ch = CHAPTERS[snap.chapterIndex];
      if (!ch || ch.id !== msg.chapterId || snap.phase !== 'VOTING') return;

      setPlayers((prev) => {
        const player = prev[msg.playerId];
        if (!player || player.rounds[ch.id]) return prev;

        const chosenOpt = ch.options.find((o) => o.key === msg.choice);
        if (!chosenOpt) return prev;

        const dieValue = rollBiasedDie(chosenOpt.kind);
        const pointsDelta = calculateRoundPoints(chosenOpt, dieValue);

        return {
          ...prev,
          [msg.playerId]: {
            ...player,
            score: player.score + pointsDelta,
            rounds: {
              ...player.rounds,
              [ch.id]: {
                chapterId: ch.id,
                choice: msg.choice,
                kind: chosenOpt.kind,
                dieValue,
                pointsDelta,
              },
            },
          },
        };
      });
      return;
    }

    if (msg.type === 'ROLL_MEMORY_DIE') {
      if (snap.phase !== 'EPILOGUE') return;
      setPlayers((prev) => {
        const player = prev[msg.playerId];
        if (!player || player.finalMemoryDie !== undefined) return prev;
        const epilogue = getEpilogue(player.score);
        const dieBias = epilogue.id === 'shortcuts' ? 'world' : 'god';
        const dieValue = rollBiasedDie(dieBias);
        return {
          ...prev,
          [msg.playerId]: {
            ...player,
            finalMemoryDie: dieValue,
          },
        };
      });
    }
  }, []);

  useEffect(() => {
    const ch = createHostChannel(roomCode, handlePlayerMessage, setStatus);
    channelRef.current = ch;
    const snap = stateRef.current;
    ch.publishState(buildSnapshot(roomCode, snap.phase, snap.chapterIndex, snap.players));
    return () => {
      ch.close();
      channelRef.current = null;
    };
  }, [roomCode, handlePlayerMessage, buildSnapshot]);

  const joinUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/jogar?sala=${roomCode}` : '';

  const votedCount = playerList.filter((p) => Boolean(p.rounds[currentChapter.id])).length;
  const memoryRolledCount = playerList.filter((p) => p.finalMemoryDie !== undefined).length;

  const countChoice = (choice: ChoiceKey) =>
    playerList.filter((p) => p.rounds[currentChapter.id]?.choice === choice).length;

  function startNewRoom() {
    const nextCode = generateRoomCode();
    setRoomCode(nextCode);
    setPhase('LOBBY');
    setChapterIndex(0);
    setPlayers({});
  }

  function resetCurrentGame() {
    setPhase('LOBBY');
    setChapterIndex(0);
    setPlayers((prev) => {
      const reset: Record<string, PlayerRecord> = {};
      for (const p of Object.values(prev)) {
        reset[p.id] = { ...p, score: 0, rounds: {}, finalMemoryDie: undefined };
      }
      return reset;
    });
  }

  return (
    <div className="host-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-badge">RPG Cataguases</span>
          <h1>As Pontes do Rio Pomba</h1>
        </div>

        <div className="topbar-meta">
          <span className={`status-pill ${status === 'online' ? 'is-online' : 'is-local'}`}>
            {status === 'online' ? <Wifi size={15} /> : <WifiOff size={15} />}
            {status === 'online' ? 'Sincronizado (Online)' : 'Modo Local'}
          </span>

          <span className="pin-pill">
            Sala <strong>{roomCode}</strong>
          </span>

          <span className="players-pill">
            <Users size={15} /> {playerList.length}
          </span>

          {phase !== 'LOBBY' && (
            <button
              type="button"
              className="btn-ghost"
              onClick={resetCurrentGame}
              title="Reiniciar história mantendo a sala"
            >
              <RotateCcw size={16} /> Reiniciar
            </button>
          )}
        </div>
      </header>

      <main className="host-main">
        {phase === 'LOBBY' && (
          <section className="lobby-grid">
            <div className="card qr-card">
              <p className="eyebrow">Entre pelo celular</p>
              <h2>Escaneie o QR Code</h2>
              <div className="qr-frame">
                <QRCodeSVG value={joinUrl || roomCode} size={220} includeMargin />
              </div>
              <div className="pin-hero">
                <span>PIN da Sala</span>
                <strong>{roomCode}</strong>
              </div>
              <p className="join-link">{joinUrl}</p>
              <div className="lobby-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => window.open(`/jogar?sala=${roomCode}`, '_blank')}
                >
                  <ExternalLink size={16} /> Testar jogador em outra aba
                </button>
                <button type="button" className="btn-ghost" onClick={() => onSwitchToPlayer(roomCode)}>
                  Abrir tela do celular aqui
                </button>
              </div>
            </div>

            <div className="card roster-card">
              <div className="roster-header">
                <div>
                  <p className="eyebrow">Grupo conectado</p>
                  <h2>Personagens em Cataguases ({playerList.length})</h2>
                </div>
                <button type="button" className="btn-ghost" onClick={startNewRoom}>
                  Novo PIN
                </button>
              </div>

              {playerList.length === 0 ? (
                <div className="empty-roster">
                  <p>Aguardando os jovens escanearem o QR Code e batizarem seus personagens...</p>
                  <p className="muted">
                    Quem estiver sem celular pode entrar em dupla no celular ao lado.
                  </p>
                </div>
              ) : (
                <ul className="player-chips">
                  {playerList.map((p) => (
                    <li key={p.id} className="player-chip">
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}

              <div className="card-footer">
                <button
                  type="button"
                  className="btn-primary btn-lg"
                  onClick={() => {
                    setChapterIndex(0);
                    setPhase('READING');
                  }}
                >
                  <BookOpen size={20} /> Começar História (Cap. 1 de {CHAPTERS.length})
                </button>
              </div>
            </div>
          </section>
        )}

        {(phase === 'READING' || phase === 'VOTING' || phase === 'REVEAL') && (
          <section className="chapter-stage">
            <div className="chapter-header">
              <div>
                <span className="act-tag">{currentChapter.act}</span>
                <span className="age-tag">{currentChapter.ageLabel}</span>
              </div>
              <span className="progress-tag">
                Capítulo {currentChapter.id} / {CHAPTERS.length}
              </span>
            </div>

            <article className="card story-card">
              <h2>{currentChapter.title}</h2>
              <p className="narration-text">{currentChapter.narration}</p>

              {phase === 'READING' && (
                <div className="stage-controls">
                  <button
                    type="button"
                    className="btn-primary btn-lg"
                    onClick={() => setPhase('VOTING')}
                  >
                    <Dices size={20} /> Liberar Escolhas e Dado no Celular
                  </button>
                </div>
              )}

              {phase === 'VOTING' && (
                <div className="voting-section">
                  <div className="options-preview">
                    {currentChapter.options.map((opt) => (
                      <div key={opt.key} className="option-preview-card">
                        <span className="option-badge">{opt.key}</span>
                        <p>{opt.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="vote-bar-wrap">
                    <div className="vote-bar-header">
                      <span>
                        <Dices size={16} /> Jovens que já escolheram e rolaram o dado:
                      </span>
                      <strong>
                        {votedCount} / {playerList.length}
                      </strong>
                    </div>
                    <div className="vote-track">
                      <div
                        className="vote-fill"
                        style={{
                          width: `${
                            playerList.length > 0 ? Math.round((votedCount / playerList.length) * 100) : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="stage-controls">
                    <button
                      type="button"
                      className="btn-primary btn-lg"
                      onClick={() => setPhase('REVEAL')}
                    >
                      <CheckCircle2 size={20} /> Revelar Desfechos
                    </button>
                  </div>
                </div>
              )}

              {phase === 'REVEAL' && (
                <div className="reveal-section">
                  <div className="reveal-grid">
                    {currentChapter.options.map((opt) => (
                      <div
                        key={opt.key}
                        className={`reveal-card ${opt.kind === 'god' ? 'is-god' : 'is-world'}`}
                      >
                        <div className="reveal-card-top">
                          <span className="option-badge">{opt.key}</span>
                          <span className="vote-count-pill">
                            {countChoice(opt.key)} jovem(ns)
                          </span>
                        </div>
                        <p className="reveal-choice-summary">{opt.label}</p>
                        <p className="reveal-outcome">{opt.outcomeText}</p>
                      </div>
                    ))}
                  </div>

                  <div className="catholic-ref-banner">
                    <Sparkles size={18} />
                    <span>{currentChapter.catholicRef}</span>
                  </div>

                  <div className="stage-controls">
                    {chapterIndex < CHAPTERS.length - 1 ? (
                      <button
                        type="button"
                        className="btn-primary btn-lg"
                        onClick={() => {
                          setChapterIndex((i) => i + 1);
                          setPhase('READING');
                        }}
                      >
                        Próximo Capítulo ({chapterIndex + 2} / {CHAPTERS.length}) →
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-primary btn-lg"
                        onClick={() => setPhase('EPILOGUE')}
                      >
                        Ir para o Epílogo às Margens do Rio Pomba →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </article>
          </section>
        )}

        {phase === 'EPILOGUE' && (
          <section className="chapter-stage">
            <div className="chapter-header">
              <span className="act-tag">Epílogo Único • 75 anos</span>
              <span className="progress-tag">Encerramento da Travessia</span>
            </div>
            <article className="card story-card">
              <h2>A Ponte às Margens do Rio Pomba</h2>
              <p className="narration-text">{EPILOGUE_NARRATION}</p>

              <div className="vote-bar-wrap">
                <div className="vote-bar-header">
                  <span>
                    <Dices size={16} /> Jovens que já rolaram o Dado da Memória:
                  </span>
                  <strong>
                    {memoryRolledCount} / {playerList.length}
                  </strong>
                </div>
                <div className="vote-track">
                  <div
                    className="vote-fill"
                    style={{
                      width: `${
                        playerList.length > 0
                          ? Math.round((memoryRolledCount / playerList.length) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="stage-controls">
                <button
                  type="button"
                  className="btn-primary btn-lg"
                  onClick={() => setPhase('PODIUM')}
                >
                  <Crown size={20} /> Abrir Pódio e Partilha Final
                </button>
              </div>
            </article>
          </section>
        )}

        {phase === 'PODIUM' && (
          <section className="podium-stage">
            <div className="card podium-card">
              <p className="eyebrow">Resultado da Travessia</p>
              <h2>Pódio e Legado Final</h2>

              {sortedPlayers.length > 0 ? (
                <div className="podium-list">
                  {sortedPlayers.map((p, idx) => {
                    const ep = getEpilogue(p.score);
                    return (
                      <div key={p.id} className={`podium-row rank-${idx + 1}`}>
                        <span className="rank-num">#{idx + 1}</span>
                        <div className="rank-info">
                          <strong>{p.name}</strong>
                          <small>
                            {ep.title} ({ep.reference})
                          </small>
                        </div>
                        <span className="rank-score">{p.score} pts</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="muted">Nenhum jogador pontuou nesta sala.</p>
              )}
            </div>

            <div className="card debrief-card">
              <p className="eyebrow">Partilha do Grupo (5–8 min)</p>
              <h3>Perguntas para abrir a roda</h3>
              <ol className="debrief-questions">
                <li>
                  Para quem ficou no Top 3: em qual capítulo você teve medo de sair perdendo por
                  escolher o caminho certo?
                </li>
                <li>
                  Para quem foi pelo atalho em alguma fase (IA no Cap. 1, currículo no Cap. 6,
                  domingo no Cap. 8): o que fez aquela escolha parecer a mais inteligente na hora?
                </li>
                <li>
                  Qual dessas 16 cenas está acontecendo na sua vida hoje aqui em Cataguases?
                </li>
              </ol>
              <p className="catholic-ref-banner">
                <Sparkles size={18} />
                <span>
                  Oração final: Mt 6,33 • Intercessão de Santa Rita de Cássia, São Carlo Acutis e
                  São Pier Giorgio Frassati.
                </span>
              </p>

              <div className="stage-controls">
                <button type="button" className="btn-primary" onClick={resetCurrentGame}>
                  <RotateCcw size={18} /> Jogar Novamente
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
