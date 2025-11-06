import React from "react";
import { Chessboard } from "react-chessboard";
import { useChessStudyContext } from "./ChessStudyProvider";

function ChessBoard() {
  const { game, tryAddMove } = useChessStudyContext();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        maxWidth: "400px",
      }}
    >
      <Chessboard options={{ position: game.fen(), onPieceDrop: tryAddMove }} />
    </div>
  );
}

export default ChessBoard;
