import React, { useState, createContext, useContext } from "react";
import { Chess } from "chess.js";

const ChessStudyContext = createContext();

export function ChessStudyProvider({ children }) {
  const [render, setRender] = useState(0); // Used to trigger a re-render after mutating the state
  const [game, setGame] = useState(new Chess());

  const [glossaryId, setGlossaryId] = useState(null);

  function tryAddMove(move) {
    try {
      game.move({
        from: move.sourceSquare,
        to: move.targetSquare,
        promotion: "q", // Always promote to queen for simplicity
      });
    } catch (err) {
      return false; // Invalid move
    }

    setRender(render + 1);
    return true;
  }

  return (
    <ChessStudyContext.Provider
      value={{ game, tryAddMove, glossaryId, setGlossaryId }}
    >
      {children}
    </ChessStudyContext.Provider>
  );
}

export function useChessStudyContext() {
  return useContext(ChessStudyContext);
}
