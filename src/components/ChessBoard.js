import React from "react";
import { Chessboard } from "react-chessboard";
import { useChessStudyContext } from "./ChessStudyProvider";
import { ReactComponent as FlipBoardIcon } from "../res/Flip Board.svg";

const DARK_SQUARES_SHINE_GRADIENT =
  "linear-gradient(to bottom right, transparent 0%, var(--very-light-glare-color) 75%, transparent 100%)";
const LIGHT_SQUARES_SHINE_GRADIENT =
  "linear-gradient(to bottom right, transparent -50%, var(--very-light-glare-color) 25%, transparent 50%, " +
  "var(--very-light-glare-color) 125%)";
const COMMON_NOTATION_STYLE = {
  color: "var(--chessboard-accent-color)",
  fontFamily: "inherit",
  fontSize: "15px",
  fontWeight: "bold",
  textShadow: "2px 2px 1px var(--light-shade-color)",
};

function ChessBoard() {
  const {
    game,
    gameUndoHistoryRef,
    tryAddMove,
    undoMove,
    redoMove,
    boardHighlights,
    boardArrows,
    isBoardFlipped,
    flipBoard,
  } = useChessStudyContext();

  // Format highlighted squares data
  const squareStyles = {};
  for (const squareSan in boardHighlights) {
    squareStyles[squareSan] = {
      backgroundImage: `radial-gradient(${boardHighlights[squareSan]}, transparent)`,
    };
  }

  // Format arrows data
  const arrows = [];
  for (const arrowData of boardArrows) {
    arrows.push({
      startSquare: arrowData[0],
      endSquare: arrowData[1],
      color: arrowData[2] ?? "var(--board-arrows-default-color)",
    });
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
            boardOrientation: isBoardFlipped ? "black" : "white",
            position: game.fen(),
            onPieceDrop: tryAddMove,
            arrows: arrows,
            squareStyles: squareStyles,

            // Static styles
            animationDurationInMs: 200,
            arrowOptions: {
              color: "var(--board-arrows-default-color)",
              secondaryColor: "var(--board-arrows-color3)",
              tertiaryColor: "var(--board-arrows-color2)",
              arrowLengthReducerDenominator: 10,
              sameTargetArrowLengthReducerDenominator: 5,
              arrowWidthDenominator: 4.5,
              activeArrowWidthMultiplier: 1,
              opacity: 0.45,
              activeOpacity: 0.3,
            },
            lightSquareStyle: {
              backgroundColor: "var(--very-light-shade-color)",
              backgroundImage: LIGHT_SQUARES_SHINE_GRADIENT,
              border: "outset 2px var(--light-shade-color)",
            },
            darkSquareStyle: {
              backgroundColor: "var(--medium-shade-color)",
              backgroundImage: DARK_SQUARES_SHINE_GRADIENT,
              border: "outset 2px var(--light-shade-color)",
            },
            numericNotationStyle: {
              ...COMMON_NOTATION_STYLE,
              position: "absolute",
              top: -4,
              left: 2,
            },
            alphaNotationStyle: {
              ...COMMON_NOTATION_STYLE,
              position: "absolute",
              bottom: -4,
              right: 2,
            },
            dropSquareStyle: {
              border:
                "solid 2px color-mix(in srgb, var(--chessboard-accent-color) 100%, var(--translucent-mixin))",
              boxShadow:
                "inset 0 0 3px 1px color-mix(in srgb, var(--chessboard-accent-color) 100%, var(--translucent-mixin))",
            },
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
          disabled={game.history().length === 0}
          onClick={undoMove}
        >
          <span style={{ marginLeft: "-1px" }}>{"<"}</span>
        </button>
        <button
          className="chessboard-button"
          style={{
            paddingTop: "4px",

            paddingLeft: "var(--spacing-medium)",
            paddingRight: "var(--spacing-medium)",
          }}
          onClick={flipBoard}
        >
          <FlipBoardIcon
            style={{
              height: "var(--inline-icon-height)",
              width: "var(--inline-icon-height)",
            }}
          />
        </button>
        <button
          className="symbol-button chessboard-button"
          style={{ paddingBottom: "3px" }}
          disabled={gameUndoHistoryRef.current.length === 0}
          onClick={redoMove}
        >
          <span style={{ marginLeft: "1px" }}>{">"}</span>
        </button>
      </div>
    </div>
  );
}

export default ChessBoard;
