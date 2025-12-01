import React from "react";
import { Chessboard } from "react-chessboard";
import { useChessStudyContext } from "./ChessStudyProvider";
import moveInfo from "../data/moveInfo.json";

function ChessBoard() {
  const { 
      game,
      gameUndoHistoryRef,
      tryAddMove,
      undoMove,
      redoMove,
      boardHighlights,
      boardArrows
    } = useChessStudyContext();

  // Format highlighted squares data
  const squareStyles = {}
  for (const squareSan in boardHighlights) {
    squareStyles[squareSan] = { backgroundColor: boardHighlights[squareSan] }
  }

  // Format arrows data
  const arrows = []
  for (const arrowData of boardArrows) {
    arrows.push({
      startSquare: arrowData[0],
      endSquare: arrowData[1],
      color: arrowData[2] ?? "var(--board-arrows-default-color)"
    })
  }

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
          options={{
            position: game.fen(),
            onPieceDrop: tryAddMove,
            arrows: arrows,
            squareStyles: squareStyles,

            // Static styles
            animationDurationInMs: 200,
            arrowOptions: {
              color: "var(--board-arrows-default-color)",
              secondaryColor: "var(--board-arrows-good-color)",
              tertiaryColor: "var(--board-arrows-threat-color)",
              arrowLengthReducerDenominator: 10,
              sameTargetArrowLengthReducerDenominator: 5,
              arrowWidthDenominator: 4,
              activeArrowWidthMultiplier: 1,
              opacity: 0.75,
              activeOpacity: 0.5
            }
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          className="symbol-button chessboard-button"
          style={{ paddingBottom: "3px" }}
          disabled={game.history().length == 0}
          onClick={undoMove}
        >
          {"<"}
        </button>
        <button
          className="symbol-button chessboard-button"
          style={{ paddingBottom: "3px" }}
          disabled={gameUndoHistoryRef.current.length == 0}
          onClick={redoMove}
        >
          {">"}
        </button>
      </div>
    </div>
  );
}

export default ChessBoard;
