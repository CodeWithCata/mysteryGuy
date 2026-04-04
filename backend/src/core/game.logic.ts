import { Player } from "@/schemas/player.schema";
import { GameWord } from "@/schemas/word.schema";

// ─── Setup ────────────────────────────────────────────────────────────────────

export const setupGameRound = (players: Player[], wordData: GameWord) => {
  const impostorIndex = Math.floor(Math.random() * players.length);
  const impostorId    = players[impostorIndex].id;

  const updatedPlayers = players.map((player) => {
    const isImpostor = player.id === impostorId;
    return {
      ...player,
      isImpostor,
      assignedWord: isImpostor ? wordData.category : wordData.word,
    };
  });

  return {
    players:    updatedPlayers,
    impostorId,
    secretWord: wordData.word,
  };
};

// ─── Votes ────────────────────────────────────────────────────────────────────

export interface VoteResult {
  allVoted:    boolean;
  eliminatedId: string | null;
}

export const processVotes = (players: Player[]): VoteResult => {
  // Only online players are required to vote
  const eligible = players.filter((p) => p.online);
  if (eligible.length === 0) return { allVoted: false, eliminatedId: null };

  const allVoted = eligible.every((p) => p.votedFor !== null);
  if (!allVoted) return { allVoted: false, eliminatedId: null };

  // Tally ALL votes ever cast, including from players who later went offline
  const tally: Record<string, number> = {};
  players.forEach((p) => {
    if (p.votedFor) tally[p.votedFor] = (tally[p.votedFor] || 0) + 1;
  });

  const maxVotes      = Math.max(...Object.values(tally));
  const topCandidates = Object.keys(tally).filter((id) => tally[id] === maxVotes);

  if (topCandidates.length > 1) return { allVoted: true, eliminatedId: null };
  return { allVoted: true, eliminatedId: topCandidates[0] };
};

// ─── Guess ────────────────────────────────────────────────────────────────────

export const resolveGuess = (guessedWord: string, secretWord: string): boolean => {
  return guessedWord.toLowerCase().trim() === secretWord.toLowerCase().trim();
};

// ─── Scores ───────────────────────────────────────────────────────────────────

export type ScoreReason = "vote" | "correct_guess" | "time_up";

export interface ScoreContext {
  reason:       ScoreReason;
  eliminatedId: string | null;
}

export const calculateScores = (
  players: Player[],
  impostorId: string,
  context: ScoreContext,
  scoreMultiplier: number
): Player[] => {
  return players.map((p) => {
    let points = 0;

    if (context.reason === "correct_guess") {
      // Impostor guessed the word — only they score
      if (p.id === impostorId) points = Math.round(3 * scoreMultiplier);

    } else if (context.reason === "vote") {
      if (context.eliminatedId === impostorId) {
        // Citizens win — reward those who voted correctly
        if (!p.isImpostor && p.votedFor === impostorId)
          points = Math.round(1 * scoreMultiplier);
      } else {
        // Impostor survives (tie or wrong person eliminated)
        if (p.id === impostorId) points = Math.round(2 * scoreMultiplier);
      }

    } else if (context.reason === "time_up") {
      // Voting timer ran out — impostor survives by default
      if (p.id === impostorId) points = Math.round(2 * scoreMultiplier);
    }

    return { ...p, score: p.score + points };
  });
};

// ─── Reset ────────────────────────────────────────────────────────────────────

export const resetPlayers = (players: Player[]): Player[] => {
  return players.map((p) => ({
    ...p,
    isImpostor: false,
    votedFor:   null,
    online:     true, // bring everyone back online for the new round
  }));
};

// ─── Hints ────────────────────────────────────────────────────────────────────

export const selectHint = (hints: string[]): string => {
  return hints[0];
};