import React from "react";
import { Chessboard } from "react-chessboard";
import { useChessStudyContext } from "./ChessStudyProvider";

function ChessBoard() {
  const { game, undoHistory, tryAddMove, undoMove, redoMove } =
    useChessStudyContext();

  return (
    <div
      style={{
        padding: "var(--spacing-medium)",
        maxWidth: "450px",

        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-small)",
      }}
    >
      <div
        style={{
          overflow: "hidden",
          borderRadius: "var(--border-radius-medium)",
        }}
      >
        <Chessboard
          options={{ position: game.fen(), onPieceDrop: tryAddMove }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          className="symbol-button-base chessboard-button"
          onClick={undoMove}
          disabled={game.history().length == 0}
        >
          {"<"}
        </button>
        <button
          className="symbol-button-base chessboard-button"
          onClick={redoMove}
          disabled={undoHistory.current.length == 0}
        >
          {">"}
        </button>
      </div>
    </div>
  );
}

export default ChessBoard;
