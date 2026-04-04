import { Player } from "@/schemas/player.schema";
import { GameWord } from "@/schemas/word.schema";
// This defines the shape of the data you just pulled from MongoDB


export const setupGameRound = (players: Player[], wordData: GameWord) => {
  // 1. Pick a random index for the Impostor
  const impostorIndex = Math.floor(Math.random() * players.length);
  const impostorId = players[impostorIndex].id;

  // 2. Loop through all players and assign their specific data
  const updatedPlayers = players.map((player) => {
    const isImpostor = player.id === impostorId;

    return {
      ...player,
      isImpostor: isImpostor,
      
      // The Core Mechanic:
      // If they are the Impostor, give them the category as a hint (e.g., "Fruit").
      // If they are a Citizen, give them the exact word (e.g., "Apple").
      assignedWord: isImpostor ? wordData.category : wordData.word,
    };
  });

  return {
    players: updatedPlayers,
    impostorId: impostorId,
    secretWord: wordData.word // The server needs to remember the real word!
  };
};

export interface VoteResult {
  allVoted: boolean;
  eliminatedId: string | null; // null for tie or not everyone voted
}

export const processVotes = (players: Player[]): VoteResult => {
  const allVoted = players.every((p) => p.votedFor !== null);
  if (!allVoted) return { allVoted: false, eliminatedId: null };

  const tally: Record<string, number> = {};
  players.forEach((p) => {
    if (p.votedFor) {
      tally[p.votedFor] = (tally[p.votedFor] || 0) + 1;
    }
  });

  const maxVotes = Math.max(...Object.values(tally));
  const topCandidates = Object.keys(tally).filter(id => tally[id] === maxVotes);

  // Tie logic
  if (topCandidates.length > 1) return { allVoted: true, eliminatedId: null };

  return { allVoted: true, eliminatedId: topCandidates[0] };
};