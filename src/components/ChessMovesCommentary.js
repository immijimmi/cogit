import React, { useRef, useEffect } from "react";
import { useChessStudyContext } from "./providers/ChessStudyProvider";
import MoveInfoTraverser from "../cls/moveInfoTraverser.js";
import "./ChessMovesCommentary.css";
import { ReactComponent as BlunderIcon } from "../res/Blunder.svg";
import { ReactComponent as MistakeIcon } from "../res/Mistake.svg";
import { ReactComponent as InaccuracyIcon } from "../res/Inaccuracy.svg";
import { ReactComponent as DubiousIcon } from "../res/Dubious.svg";
import { ReactComponent as AcceptableIcon } from "../res/Acceptable.svg";
import { ReactComponent as AccurateIcon } from "../res/Accurate.svg";
import { ReactComponent as GreatIcon } from "../res/Great.svg";
import { ReactComponent as BrilliantIcon } from "../res/Brilliant.svg";
import { ReactComponent as MissIcon } from "../res/Miss.svg";

const ANNOTATION_ICON_STYLE = {
  height: "var(--inline-icon-height-large)",
  width: "var(--inline-icon-height-large)",
  marginBottom: "-5px",
  marginLeft: "-2px",
};

const ANNOTATION_LOOKUP = {
  "??": [
    " is a ",
    <span style={{ color: "var(--chess-blunder-color)" }}>{"blunder "}</span>,
    <BlunderIcon style={ANNOTATION_ICON_STYLE} />,
  ],
  "?": [
    " is a ",
    <span style={{ color: "var(--chess-mistake-color)" }}>{"mistake "}</span>,
    <MistakeIcon style={ANNOTATION_ICON_STYLE} />,
  ],
  "?!": [
    " is an ",
    <span style={{ color: "var(--chess-inaccuracy-color)" }}>
      {"inaccuracy "}
    </span>,
    <InaccuracyIcon style={ANNOTATION_ICON_STYLE} />,
  ],
  "~": [
    " is ",
    <span style={{ color: "var(--chess-dubious-color)" }}>{"dubious "}</span>,
    <DubiousIcon style={ANNOTATION_ICON_STYLE} />,
  ],
  "✔": [
    " is ",
    <span style={{ color: "var(--chess-acceptable-color)" }}>
      {"acceptable "}
    </span>,
    <AcceptableIcon style={ANNOTATION_ICON_STYLE} />,
  ],
  "★": [
    " is ",
    <span style={{ color: "var(--chess-accurate-color)" }}>{"accurate "}</span>,
    <AccurateIcon style={ANNOTATION_ICON_STYLE} />,
  ],
  "!": [
    " is a ",
    <span style={{ color: "var(--chess-great-color)" }}>{"great move "}</span>,
    <GreatIcon style={ANNOTATION_ICON_STYLE} />,
  ],
  "!!": [
    " is ",
    <span style={{ color: "var(--chess-brilliant-color)" }}>
      {"brilliant "}
    </span>,
    <BrilliantIcon style={ANNOTATION_ICON_STYLE} />,
  ],
  "✖": [
    " is a ",
    <span style={{ color: "var(--chess-miss-color)" }}>{"miss "}</span>,
    <MissIcon style={ANNOTATION_ICON_STYLE} />,
  ],
};

// Description data handler for 'add_moves_button'
const addMovesConverter = (
  moveIndex,
  data,
  customHandlers,
  descriptionContext,
  doCatchIncompatibleData,
  caller,
  studyContext
) => {
  let addMovesList = caller(
    data["value"],
    customHandlers,
    descriptionContext,
    false
  );

  // Coalesce string move lists into arrays
  if (typeof addMovesList === "string") {
    addMovesList = addMovesList.split(" ");
  }

  const gameHistory = studyContext.game.history();
  data["type"] = "set_moves_button";
  data["value"] = gameHistory.slice(0, moveIndex + 1).concat(addMovesList);

  return caller(
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData
  );
};

function ChessMovesCommentary() {
  const { game, gameRender, processDescriptionData } = useChessStudyContext();

  // Scroll the last header to the top of the description box each time the game's state changes
  const descriptionRef = useRef(null);
  const lastHeaderRef = useRef(null);
  useEffect(() => {
    if (!lastHeaderRef?.current) return;

    descriptionRef?.current?.scrollTo({
      top: lastHeaderRef.current.offsetTop,
      behavior: "smooth",
    });
  }, [gameRender]);

  // Generate description elements for each move
  const descriptionElements = [];
  let skippedAnnotatedMove = null; // Temporary storage for if White's move has no commentary
  const descriptionContext = {}; // For use by description handlers, in the context of the current game history

  const gameHistory = game.history();
  const traverser = new MoveInfoTraverser();

  // Initial description text, only used if no moves have been made
  if (gameHistory.length === 0) {
    descriptionElements.push("Play a move to begin.");
  }

  for (const [moveIndex, moveSan] of gameHistory.entries()) {
    const roundNumber = (moveIndex - (moveIndex % 2)) / 2 + 1;
    const isWhiteToMoveNext = Boolean(moveIndex % 2);
    const isLastMove = moveIndex + 1 === gameHistory.length;

    descriptionContext["current_move"] = moveSan;
    descriptionContext["current_player"] = isWhiteToMoveNext
      ? "Black"
      : "White";

    traverser.add(moveSan);

    const moveAnnotation = traverser.annotation;
    const annotatedMove = moveSan + (moveAnnotation ?? "");
    const annotatedMoveJsx = [
      moveSan,
      ...(moveAnnotation ? ANNOTATION_LOOKUP[moveAnnotation] : []),
    ];

    const hasDescription = traverser.description != null;

    // No description found for current move
    if (!hasDescription) {
      // A last move without a description is handled uniquely
      if (isLastMove) {
        if (skippedAnnotatedMove) {
          descriptionElements.push(
            <div
              className="minor-text"
              style={{ padding: "var(--commentary-subsection-padding)" }}
            >{`${roundNumber}. ${skippedAnnotatedMove}`}</div>
          );
        }
        skippedAnnotatedMove = null;

        descriptionElements.push(
          <div ref={lastHeaderRef} className="section-header">
            {[
              `${roundNumber}. ${isWhiteToMoveNext ? "..." : ""}`,
              ...annotatedMoveJsx,
            ]}
          </div>
        );

        // If the description data is explicitly null, the below placeholder is not used
        if (traverser.description !== null) {
          descriptionElements.push(
            <div
              className="minor-text"
              style={{ padding: "var(--commentary-section-padding)" }}
            >
              <i>No information found for this move.</i>
            </div>
          );
        }
      } else {
        // Tries to bundle skipped moves into rounds where possible by storing White's move
        if (!isWhiteToMoveNext) {
          skippedAnnotatedMove = annotatedMove;
        } else {
          descriptionElements.push(
            <div
              className="minor-text"
              style={{ padding: "var(--commentary-subsection-padding)" }}
            >{`${roundNumber}. ${
              skippedAnnotatedMove ? skippedAnnotatedMove + " " : "..."
            }${annotatedMove}`}</div>
          );
          skippedAnnotatedMove = null;
        }
      }
    }
    // Current move has a description
    else {
      if (skippedAnnotatedMove) {
        descriptionElements.push(
          <div
            className="minor-text"
            style={{ padding: "var(--commentary-subsection-padding)" }}
          >{`${roundNumber}. ${skippedAnnotatedMove}`}</div>
        );
        skippedAnnotatedMove = null;
      }

      descriptionElements.push(
        <div
          className="section-header"
          {...(isLastMove && { ref: lastHeaderRef })}
        >
          {[
            `${roundNumber}. ${isWhiteToMoveNext ? "..." : ""}`,
            ...annotatedMoveJsx,
          ]}
        </div>
      );

      descriptionElements.push(
        <div style={{ padding: "var(--commentary-section-padding)" }}>
          {processDescriptionData(
            traverser.description,
            {
              add_moves_button: (...params) =>
                addMovesConverter(moveIndex, ...params),
            },
            descriptionContext
          )}
        </div>
      );
    }
  }

  return (
    <div
      style={{
        maxHeight: "480px",
        padding: `${
          traverser.title ? "var(--spacing-small)" : "var(--spacing-medium)"
        } var(--spacing-medium) var(--spacing-medium) var(--spacing-medium)`,

        display: "flex",
        flexDirection: "column",
      }}
    >
      {traverser.title && (
        <div
          className="minor-text"
          style={{
            borderBottom:
              "var(--border-width-small) solid var(--light-shade-color)",
            padding: "0 var(--spacing-medium) 0 0",
            textAlign: "right",
          }}
        >
          <i>{traverser.title}</i>
        </div>
      )}
      <div
        ref={descriptionRef}
        className="y-scrollbar"
        style={traverser.title ? { paddingTop: "var(--spacing-small)" } : {}}
      >
        {descriptionElements}
      </div>
    </div>
  );
}

export default ChessMovesCommentary;
