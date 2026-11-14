import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Crown,
  Dices,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Trophy,
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
import { AvatarView } from './AvatarView';

interface HostViewProps {
  onSwitchToPlayer: (roomCode: string) => void;
}

const STORAGE_KEY = 'sentinelas_host_session_v2';
const TIMER_OPTIONS = [
  { value: 30, label: '30 seg' },
  { value: 45, label: '45 seg' },
  { value: 60, label: '60 seg' },
  { value: 0, label: 'Sem limite' },
];

interface PersistedHost {
  roomCode: string;
  phase: GamePhase;
  chapterIndex: number;
  votingDurationSec: number;
  votingEndsAt: number | null;
  players: Record<string, PlayerRecord>;
}

function loadInitialHost(): PersistedHost {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedHost;
      if (parsed && parsed.roomCode && typeof parsed.chapterIndex === 'number') {
        return {
          ...parsed,
          votingDurationSec: parsed.votingDurationSec ?? 45,
          votingEndsAt: parsed.votingEndsAt ?? null,
        };
      }
    }
  } catch {
    // ignore storage errors
  }
  return {
    roomCode: generateRoomCode(),
    phase: 'LOBBY',
    chapterIndex: 0,
    votingDurationSec: 45,
    votingEndsAt: null,
    players: {},
  };
}

export function HostView({ onSwitchToPlayer }: HostViewProps) {
  const initial = useMemo(() => loadInitialHost(), []);
  const [roomCode, setRoomCode] = useState(initial.roomCode);
  const [phase, setPhase] = useState<GamePhase>(initial.phase);
  const [chapterIndex, setChapterIndex] = useState(initial.chapterIndex);
  const [votingDurationSec, setVotingDurationSec] = useState(initial.votingDurationSec);
  const [votingEndsAt, setVotingEndsAt] = useState<number | null>(initial.votingEndsAt);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [players, setPlayers] = useState<Record<string, PlayerRecord>>(initial.players);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');

  const confirmDialogRef = useRef<HTMLDialogElement | null>(null);
  const channelRef = useRef<HostChannel | null>(null);
  const stateRef = useRef({
    roomCode,
    phase,
    chapterIndex,
    votingDurationSec,
    votingEndsAt,
    players,
  });
  stateRef.current = {
    roomCode,
    phase,
    chapterIndex,
    votingDurationSec,
    votingEndsAt,
    players,
  };

  const currentChapter = CHAPTERS[chapterIndex] ?? CHAPTERS[0];
  const playerList = useMemo(() => Object.values(players), [players]);
  const sortedPlayers = useMemo(() => sortLeaderboard(playerList), [playerList]);

  const buildSnapshot = useCallback(
    (
      code: string,
      nextPhase: GamePhase,
      nextChapterIdx: number,
      durationSec: number,
      endsAt: number | null,
      nextPlayers: Record<string, PlayerRecord>,
    ): RoomStateMessage => {
      const ch = CHAPTERS[nextChapterIdx] ?? CHAPTERS[0];
      const publicChapter =
        nextPhase === 'READING' ||
        nextPhase === 'VOTING' ||
        nextPhase === 'REVEAL' ||
        nextPhase === 'LEADERBOARD'
          ? sanitizeChapterForPlayer(ch)
          : null;

      let reveal: RevealPayload | null = null;
      if (nextPhase === 'REVEAL' || nextPhase === 'LEADERBOARD') {
        const all = Object.values(nextPlayers);
        const countFor = (k: ChoiceKey) =>
          all.filter((p) => p.rounds[ch.id]?.choice === k).length;

        reveal = {
          chapterId: ch.id,
          catholicRef: ch.catholicRef,
          counts: {
            A: countFor('A'),
            B: countFor('B'),
            C: countFor('C'),
            D: countFor('D'),
          },
          outcomes: {
            A: ch.options[0].outcomeText,
            B: ch.options[1].outcomeText,
            C: ch.options[2].outcomeText,
            D: ch.options[3].outcomeText,
          },
        };
      }

      const playerStates: Record<string, PlayerPublicSnapshot> = {};
      for (const p of Object.values(nextPlayers)) {
        const round = p.rounds[ch.id];
        playerStates[p.id] = {
          name: p.name,
          avatar: p.avatar,
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
        avatar: p.avatar,
        score: p.score,
        lastDelta: p.rounds[ch.id]?.pointsDelta,
      }));

      return {
        type: 'ROOM_STATE',
        msgId: makeMsgId(),
        roomCode: code,
        phase: nextPhase,
        chapterIndex: nextChapterIdx,
        totalChapters: CHAPTERS.length,
        votingDurationSec: durationSec,
        votingEndsAt: nextPhase === 'VOTING' ? endsAt : null,
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
        JSON.stringify({
          roomCode,
          phase,
          chapterIndex,
          votingDurationSec,
          votingEndsAt,
          players,
        }),
      );
    } catch {
      // ignore storage errors
    }
  }, [roomCode, phase, chapterIndex, votingDurationSec, votingEndsAt, players]);

  // Broadcast updated state whenever room state changes
  useEffect(() => {
    channelRef.current?.publishState(
      buildSnapshot(roomCode, phase, chapterIndex, votingDurationSec, votingEndsAt, players),
    );
  }, [roomCode, phase, chapterIndex, votingDurationSec, votingEndsAt, players, buildSnapshot]);

  // Countdown tick during VOTING
  useEffect(() => {
    if (phase !== 'VOTING' || !votingEndsAt) {
      setSecondsLeft(null);
      return;
    }

    const updateTick = () => {
      const remaining = Math.max(0, Math.ceil((votingEndsAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };
    updateTick();
    const id = window.setInterval(updateTick, 300);
    return () => window.clearInterval(id);
  }, [phase, votingEndsAt]);

  const handlePlayerMessage = useCallback((msg: PlayerToHostMessage) => {
    const snap = stateRef.current;

    if (msg.type === 'JOIN') {
      setPlayers((prev) => {
        const existing = prev[msg.playerId];
        if (existing) {
          return {
            ...prev,
            [msg.playerId]: {
              ...existing,
              name: msg.name.trim() || existing.name,
              avatar: msg.avatar || existing.avatar,
            },
          };
        }
        return {
          ...prev,
          [msg.playerId]: {
            id: msg.playerId,
            name: msg.name.trim() || 'Sentinela',
            avatar: msg.avatar,
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
      if (snap.votingEndsAt && Date.now() > snap.votingEndsAt + 1200) return;

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
        const dieBias = epilogue.id === 'shortcuts' ? 'world' : 'god-bold';
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
    ch.publishState(
      buildSnapshot(
        roomCode,
        snap.phase,
        snap.chapterIndex,
        snap.votingDurationSec,
        snap.votingEndsAt,
        snap.players,
      ),
    );
    return () => {
      ch.close();
      channelRef.current = null;
    };
  }, [roomCode, handlePlayerMessage, buildSnapshot]);

  // Listen to native dialog close event cleanly
  useEffect(() => {
    const dlg = confirmDialogRef.current;
    if (!dlg) return;
    const onClose = () => {
      const action = dlg.returnValue;
      dlg.returnValue = '';
      if (action === 'confirm') {
        setVotingEndsAt(null);
        setPhase('REVEAL');
      }
    };
    dlg.addEventListener('close', onClose);
    return () => dlg.removeEventListener('close', onClose);
  }, []);

  const joinUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/jogar?sala=${roomCode}` : '';

  const missingPlayers = playerList.filter((p) => !p.rounds[currentChapter.id]);
  const votedCount = playerList.length - missingPlayers.length;
  const memoryRolledCount = playerList.filter((p) => p.finalMemoryDie !== undefined).length;

  const countChoice = (choice: ChoiceKey) =>
    playerList.filter((p) => p.rounds[currentChapter.id]?.choice === choice).length;

  function openVotingPhase() {
    const endsAt = votingDurationSec > 0 ? Date.now() + votingDurationSec * 1000 : null;
    setVotingEndsAt(endsAt);
    setPhase('VOTING');
  }

  function requestReveal() {
    if (missingPlayers.length > 0 && confirmDialogRef.current) {
      confirmDialogRef.current.showModal();
      return;
    }
    setVotingEndsAt(null);
    setPhase('REVEAL');
  }

  function startNewRoom() {
    const nextCode = generateRoomCode();
    setRoomCode(nextCode);
    setPhase('LOBBY');
    setChapterIndex(0);
    setVotingEndsAt(null);
    setPlayers({});
  }

  function resetCurrentGame() {
    setPhase('LOBBY');
    setChapterIndex(0);
    setVotingEndsAt(null);
    setPlayers((prev) => {
      const reset: Record<string, PlayerRecord> = {};
      for (const p of Object.values(prev)) {
        reset[p.id] = { ...p, score: 0, rounds: {}, finalMemoryDie: undefined };
      }
      return reset;
    });
  }

  const isGodOption = (kind: string) => kind === 'god' || kind === 'god-bold';

  return (
    <div className="host-shell">
      <header className="topbar">
        <div className="brand">
          <div className="logo-crest">
            <img
              src="/sentinelas-logo.png"
              alt="Logo Sentinelas"
              width={903}
              height={1024}
              className="sentinelas-logo-sm"
            />
          </div>
          <div className="brand-titles">
            <span className="brand-badge">Sentinelas • Paróquia N. Sra. do Rosário</span>
            <h1>Por amor, por querer, a decisão de se doar</h1>
          </div>
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
                <QRCodeSVG value={joinUrl || roomCode} size={210} includeMargin />
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
                  <h2>Personagens ({playerList.length})</h2>
                </div>
                <button type="button" className="btn-ghost" onClick={startNewRoom}>
                  Novo PIN
                </button>
              </div>

              <div className="timer-config-box">
                <span className="timer-config-label">
                  <Clock size={16} /> Tempo limite por pergunta:
                </span>
                <div className="chip-row">
                  {TIMER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`mini-chip ${votingDurationSec === opt.value ? 'is-active' : ''}`}
                      onClick={() => setVotingDurationSec(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {playerList.length === 0 ? (
                <div className="empty-roster">
                  <p>Aguardando os jovens escanearem o QR Code e montarem seus personagens...</p>
                  <p className="muted">
                    Quem estiver sem celular pode jogar em dupla no celular ao lado.
                  </p>
                </div>
              ) : (
                <ul className="player-chips">
                  {playerList.map((p) => (
                    <li key={p.id} className="player-chip-avatar">
                      <AvatarView config={p.avatar} name={p.name} size={36} />
                      <span>{p.name}</span>
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
                  <button type="button" className="btn-primary btn-lg" onClick={openVotingPhase}>
                    <Dices size={20} /> Liberar 4 Escolhas e Dado no Celular
                  </button>
                </div>
              )}

              {phase === 'VOTING' && (
                <div className="voting-section">
                  {secondsLeft !== null && (
                    <div className={`countdown-banner ${secondsLeft === 0 ? 'is-expired' : ''}`}>
                      <div className="countdown-row">
                        <span>
                          <Clock size={18} />{' '}
                          {secondsLeft > 0 ? 'Tempo restante:' : 'Tempo esgotado!'}
                        </span>
                        <strong>{secondsLeft}s</strong>
                      </div>
                      <div className="vote-track">
                        <div
                          className="vote-fill is-timer"
                          style={{
                            width: `${
                              votingDurationSec > 0
                                ? Math.round((secondsLeft / votingDurationSec) * 100)
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="options-preview">
                    {currentChapter.options.map((opt) => (
                      <div key={opt.key} className="option-preview-card">
                        <span className={`option-badge badge-${opt.key.toLowerCase()}`}>{opt.key}</span>
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
                    <button type="button" className="btn-primary btn-lg" onClick={requestReveal}>
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
                        className={`reveal-card ${isGodOption(opt.kind) ? 'is-god' : 'is-world'}`}
                      >
                        <div className="reveal-card-top">
                          <span className={`option-badge badge-${opt.key.toLowerCase()}`}>{opt.key}</span>
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
                    <button
                      type="button"
                      className="btn-primary btn-lg"
                      onClick={() => setPhase('LEADERBOARD')}
                    >
                      <Trophy size={20} /> Ver Placar da Rodada →
                    </button>
                  </div>
                </div>
              )}
            </article>
          </section>
        )}

        {phase === 'LEADERBOARD' && (
          <section className="chapter-stage">
            <div className="chapter-header">
              <span className="act-tag">Placar após o Capítulo {currentChapter.id}</span>
              <span className="progress-tag">
                {currentChapter.id} / {CHAPTERS.length}
              </span>
            </div>

            <article className="card podium-card">
              <h2>Classificação Parcial</h2>

              {sortedPlayers.length > 0 ? (
                <div className="podium-list">
                  {sortedPlayers.map((p, idx) => {
                    const round = p.rounds[currentChapter.id];
                    const delta = round?.pointsDelta ?? 0;
                    return (
                      <div key={p.id} className={`podium-row rank-${idx + 1}`}>
                        <span className="rank-num">#{idx + 1}</span>
                        <AvatarView config={p.avatar} name={p.name} size={44} />
                        <div className="rank-info">
                          <strong>{p.name}</strong>
                          <small>
                            {round
                              ? `Escolheu ${round.choice} • Dado ${round.dieValue}`
                              : 'Não respondeu a tempo'}
                          </small>
                        </div>
                        {round && (
                          <span className={`delta-chip ${delta >= 0 ? 'is-positive' : 'is-negative'}`}>
                            {delta >= 0 ? `+${delta}` : delta}
                          </span>
                        )}
                        <span className="rank-score">{p.score} pts</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="muted">Nenhum jogador conectado ainda.</p>
              )}

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
                        <AvatarView config={p.avatar} name={p.name} size={46} />
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
              <div className="catholic-ref-banner">
                <Sparkles size={18} />
                <span>
                  Oração final: Mt 6,33 • Sob a proteção de Nossa Senhora do Rosário, São Carlo
                  Acutis e São Pier Giorgio Frassati.
                </span>
              </div>

              <div className="stage-controls">
                <button type="button" className="btn-primary" onClick={resetCurrentGame}>
                  <RotateCcw size={18} /> Jogar Novamente
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <dialog ref={confirmDialogRef} className="confirm-dialog" aria-labelledby="confirm-reveal-title">
        <div className="confirm-dialog-body">
          <div className="confirm-dialog-header">
            <AlertTriangle size={24} className="confirm-icon" />
            <h2 id="confirm-reveal-title">Ainda há jovens sem responder</h2>
          </div>
          <p className="muted">
            Faltam <strong>{missingPlayers.length}</strong> pessoa(s) escolher e rolar o dado:{' '}
            {missingPlayers
              .slice(0, 5)
              .map((p) => p.name)
              .join(', ')}
            {missingPlayers.length > 5 ? ` e mais ${missingPlayers.length - 5}` : ''}.
          </p>
          <form method="dialog" className="confirm-dialog-actions">
            <button type="submit" value="cancel" className="btn-secondary" autoFocus>
              Esperar mais
            </button>
            <button type="submit" value="confirm" className="btn-primary">
              Sim, revelar agora
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
