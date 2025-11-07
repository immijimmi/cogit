import React, { useState, useRef, createContext, useContext } from "react";
import { Chess } from "chess.js";

const ChessStudyContext = createContext();

export function ChessStudyProvider({ children }) {
  const [game, setGame] = useState(new Chess());
  const [gameRender, setGameRender] = useState(0); // Used to trigger a re-render after mutating the game state

  const [glossaryId, setGlossaryId] = useState(null);

  const undoHistory = useRef([]);

  function addMove(move, doRender = true) {
    let moveResult;
    // Move data is a SAN string
    if (typeof move === "string") {
      moveResult = game.move(move);
    }
    // Move data is a react-chessboard object
    else {
      moveResult = game.move({
        from: move.sourceSquare,
        to: move.targetSquare,
        promotion: "q", // Always promote to queen for simplicity
      });
    }

    // Modify undo history accordingly
    if (undoHistory.current[0] == moveResult.san) {
      undoHistory.current.shift();
    } else {
      undoHistory.current.length = 0;
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

    // Add full game history into undo history and reset game state
    undoHistory.current = game.history().concat(undoHistory.current);
    game.reset();

    for (const move of moves) {
      addMove(move, false);
    }

    if (doRender) setGameRender(gameRender + 1);
  }

  function undoMove(doRender = true) {
    let undoResult = game.undo();
    if (undoResult) undoHistory.current.unshift(undoResult.san);

    if (doRender) setGameRender(gameRender + 1);
  }

  function redoMove(doRender = true) {
    addMove(undoHistory.current[0], doRender);
  }

  return (
    <ChessStudyContext.Provider
      value={{
        game,
        gameRender,
        undoHistory,
        addMove,
        tryAddMove,
        setMoves,
        undoMove,
        redoMove,
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
