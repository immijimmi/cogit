import React, { useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { useChessStudyContext } from "./providers/ChessStudyProvider";
import { ReactComponent as FlipBoardIcon } from "../res/Flip Board.svg";
import { ReactComponent as StartIcon } from "../res/Start.svg";
import { ReactComponent as BackIcon } from "../res/Left Triangle.svg";
import { ReactComponent as ForwardIcon } from "../res/Right Triangle.svg";
import { ReactComponent as EndIcon } from "../res/End.svg";
import moveSfxUrl from "../res/Light Wood Doubletap.wav";
import captureSfxUrl from "../res/Finger Snap + Light Wood Doubletap.wav";

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
    gameRender,
    gameUndoHistoryRef,
    tryAddMove,
    undoMove,
    redoMove,
    setMoves,
    boardHighlights,
    boardArrows,
    isBoardFlipped,
    flipBoard,
  } = useChessStudyContext();

  const moveSfxRef = useRef(new Audio(moveSfxUrl));
  moveSfxRef.current.preload = "auto";
  moveSfxRef.current.loop = false;
  moveSfxRef.current.volume = 0.35;

  const captureSfxRef = useRef(new Audio(captureSfxUrl));
  captureSfxRef.current.preload = "auto";
  captureSfxRef.current.loop = false;
  captureSfxRef.current.volume = 0.45;

  const pageLoadAudioBufferRef = useRef(null);
  useEffect(() => {
    if (pageLoadAudioBufferRef.current === null) {
      pageLoadAudioBufferRef.current = false;
      // Timeout is added to the end of the current synchronous call stack, so only executed after the page finishes loading
      setTimeout(() => {
        pageLoadAudioBufferRef.current = true;
      }, 0);
    }
  }, []);

  useEffect(() => {
    const lastMove = game.history()?.pop();
    if (lastMove) {
      if (!pageLoadAudioBufferRef.current) {
        return;
      }

      moveSfxRef.current.currentTime = 0;
      captureSfxRef.current.currentTime = 0;

      if (lastMove.includes("x")) {
        captureSfxRef.current.play().catch(() => {});
      } else {
        moveSfxRef.current.play().catch(() => {});
      }
    }
  }, [game, gameRender]);

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
        <div style={{ display: "flex", gap: "var(--spacing-tiny)" }}>
          <button
            className="chessboard-button centred-content"
            onClick={() => setMoves([])}
            disabled={game.history().length === 0}
          >
            <StartIcon
              style={{
                height: "var(--inline-icon-height-small)",

                marginTop: "-1px",
                marginLeft: "-1px",
              }}
            />
          </button>
          <button
            className="chessboard-button centred-content"
            onClick={undoMove}
            disabled={game.history().length === 0}
          >
            <BackIcon
              style={{
                height: "var(--inline-icon-height-small)",

                marginTop: "-1px",
                marginLeft: "-1px",
              }}
            />
          </button>
        </div>
        <button
          className="chessboard-button centred-content"
          onClick={flipBoard}
        >
          <FlipBoardIcon
            style={{
              height: "var(--inline-icon-height-large)",
            }}
          />
        </button>
        <div style={{ display: "flex", gap: "var(--spacing-tiny)" }}>
          <button
            className="chessboard-button centred-content"
            onClick={redoMove}
            disabled={gameUndoHistoryRef.current.length === 0}
          >
            <ForwardIcon
              style={{
                height: "var(--inline-icon-height-small)",

                marginTop: "-1px",
                marginLeft: "1px",
              }}
            />
          </button>
          <button
            className="chessboard-button centred-content"
            onClick={() =>
              setMoves(game.history().concat(gameUndoHistoryRef.current))
            }
            disabled={gameUndoHistoryRef.current.length === 0}
          >
            <EndIcon
              style={{
                height: "var(--inline-icon-height-small)",

                marginTop: "-1px",
                marginLeft: "1px",
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChessBoard;
