import React, { useState, createContext, useContext } from "react";
import { Chess } from "chess.js";

const ChessStudyContext = createContext();

export function ChessStudyProvider({ children }) {
  const [game, setGame] = useState(new Chess());
  const [gameRender, setGameRender] = useState(0); // Used to trigger a re-render after mutating the game state

  const [glossaryId, setGlossaryId] = useState(null);

  function addMove(move, doRender = true) {
    // Move data is a SAN string
    if (typeof move === "string") {
      game.move(move);
    }
    // Move data is a react-chessboard object
    else {
      game.move({
        from: move.sourceSquare,
        to: move.targetSquare,
        promotion: "q", // Always promote to queen for simplicity
      });
    }
    if (doRender) setGameRender(gameRender + 1);
  }

  function tryAddMove(move, doRender = true) {
    try {
      addMove(move, doRender);
      return true;
    } catch (err) {
      return false;
    }
  }

  function setMoves(moves, doRender = true) {
    // Moves list is a SAN string
    if (typeof moves === "string") {
      moves = moves.split(" ");
    }

    game.reset();
    for (const move of moves) {
      addMove(move, false);
    }
    if (doRender) setGameRender(gameRender + 1);
  }

  return (
    <ChessStudyContext.Provider
      value={{
        game,
        gameRender,
        addMove,
        tryAddMove,
        setMoves,
        glossaryId,
        setGlossaryId,
      }}
    >
      {children}
    </ChessStudyContext.Provider>
  );
}

export function useChessStudyContext() {
  return useContext(ChessStudyContext);
}
