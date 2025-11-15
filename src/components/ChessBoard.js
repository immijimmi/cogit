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
          style={{ paddingBottom: "3px" }}
          disabled={game.history().length == 0}
          onClick={undoMove}
        >
          {"<"}
        </button>
        <button
          className="symbol-button-base chessboard-button"
          style={{ paddingBottom: "3px" }}
          disabled={undoHistory.current.length == 0}
          onClick={redoMove}
        >
          {">"}
        </button>
      </div>
    </div>
  );
}

export default ChessBoard;
