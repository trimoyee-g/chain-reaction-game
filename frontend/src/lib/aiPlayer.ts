import {
  criticalMass,
  getNeighbors,
  placeOrb,
  validMoves,
} from "./gameEngine";
import type { AIDifficulty, Board, GameState, Player } from "./types";

// ─── Fast positional score (no BFS simulation) ────────────────────────────────
function scoreMove(
  board: Board,
  r: number,
  c: number,
  player: Player,
  rows: number,
  cols: number
): number {
  const cm = criticalMass(r, c, rows, cols);
  const cell = board[r][c];
  let score = 0;

  // Will this cell explode after placing?
  const willExplode = cell.count + 1 >= cm;
  if (willExplode) {
    score += 30;
    // Bonus for each neighbour that would be captured / pushed toward explosion
    for (const [nr, nc] of getNeighbors(r, c, rows, cols)) {
      const ncm = criticalMass(nr, nc, rows, cols);
      const ncell = board[nr][nc];
      if (ncell.player !== 0 && ncell.player !== player) {
        score += 10; // capture opponent
      }
      if (ncell.count + 1 >= ncm) {
        score += 8; // will cascade
      }
    }
  }

  // Corner/edge cells are easier to explode (lower cm)
  score += (4 - cm) * 4;

  // Prefer cells already loaded up
  score += cell.count * 2;

  return score;
}

// ─── Easy: random ─────────────────────────────────────────────────────────────
function randomMove(moves: [number, number][]): [number, number] {
  return moves[Math.floor(Math.random() * moves.length)];
}

// ─── Medium: fast heuristic + limited full-sim for top candidates ─────────────
function greedyMove(state: GameState): [number, number] {
  const moves = validMoves(state.board, state.currentPlayer);
  if (moves.length === 0) return [0, 0];

  // Score all moves cheaply first
  const scored = moves.map((m) => ({
    move: m,
    score: scoreMove(
      state.board,
      m[0],
      m[1],
      state.currentPlayer,
      state.rows,
      state.cols
    ) + Math.random() * 2, // tie-break noise
  }));

  scored.sort((a, b) => b.score - a.score);

  // Full-simulate only the top 6 candidates to find actual winner/chain value
  const candidates = scored.slice(0, 6);
  let bestScore = -Infinity;
  let bestMove = candidates[0].move;

  for (const { move } of candidates) {
    const { state: next } = placeOrb(state, move[0], move[1]);

    // Instant win — take it immediately
    if (next.winner === state.currentPlayer) return move;

    // Count own orbs after the move as tiebreaker
    let ownOrbs = 0;
    for (const row of next.board)
      for (const cell of row)
        if (cell.player === state.currentPlayer) ownOrbs += cell.count;

    const s = ownOrbs;
    if (s > bestScore) {
      bestScore = s;
      bestMove = move;
    }
  }

  return bestMove;
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function getAIMove(
  state: GameState,
  difficulty: AIDifficulty = "medium"
): [number, number] {
  const moves = validMoves(state.board, state.currentPlayer);
  if (moves.length === 0) return [0, 0];
  if (difficulty === "easy") return randomMove(moves);
  return greedyMove(state);
}
