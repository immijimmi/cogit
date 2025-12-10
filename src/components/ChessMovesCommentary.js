import React, { useRef, useEffect } from "react";
import { useChessStudyContext } from "./ChessStudyProvider";
import moveInfo from "../data/moveInfo.json";
import "./ChessMovesCommentary.css";

const MOVE_ANNOTATION_LOOKUP = {
  "??": [
    " is a ",
    <span style={{ color: "var(--chess-blunder-color)" }}>blunder</span>,
  ],
  "?": [
    " is a ",
    <span style={{ color: "var(--chess-mistake-color)" }}>mistake</span>,
  ],
  "?!": [
    " is ",
    <span style={{ color: "var(--chess-dubious-color)" }}>dubious</span>,
  ],
  "!": [
    " is a ",
    <span style={{ color: "var(--chess-great-color)" }}>great move</span>,
  ],
  "!!": [
    " is ",
    <span style={{ color: "var(--chess-brilliant-color)" }}>brilliant</span>,
  ],
  "×": [
    " is a ",
    <span style={{ color: "var(--chess-miss-color)" }}>miss</span>,
  ],
};

// Data handler which coalesces 'add moves' data into 'set moves' output
const addMovesConverter = (
  moveIndex,
  data,
  customHandlers,
  caller,
  context
) => {
  // Coalesce string move lists into arrays
  if (typeof data["value"] === "string") {
    data["value"] = data["value"].split(" ");
  }

  const gameHistory = context.game.history();
  data["type"] = "set_moves_button";
  data["value"] = gameHistory.slice(0, moveIndex + 1).concat(data["value"]);

  return caller(data, customHandlers);
};

function ChessMovesCommentary() {
  const { game, gameRender, generateRichDescription } = useChessStudyContext();

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
  let title = "";
  const descriptionElements = [];
  let skippedAnnotatedMove = null; // Temporary storage for if White's move has no commentary

  const gameHistory = game.history();
  let currentMoveData = moveInfo;

  // Initial description text, only used if no moves have been made
  if (gameHistory.length == 0) {
    descriptionElements.push("Play a move to begin.");
  }

  for (const [moveIndex, moveSan] of gameHistory.entries()) {
    const roundNumber = (moveIndex - (moveIndex % 2)) / 2 + 1;
    const isWhiteToMove = Boolean(moveIndex % 2);
    const isLastMove = moveIndex + 1 == gameHistory.length;

    currentMoveData = currentMoveData[moveSan] ?? {};

    const moveAnnotation = currentMoveData["annotation"];
    const annotatedMove = moveSan + (moveAnnotation ?? "");
    const annotatedMoveJsx = [
      moveSan,
      ...(moveAnnotation ? MOVE_ANNOTATION_LOOKUP[moveAnnotation] : []),
    ];

    // No description found for current move
    if (!("description" in currentMoveData)) {
      // A last move without a description is handled uniquely
      if (isLastMove) {
        if (skippedAnnotatedMove) {
          descriptionElements.push(
            <div
              className="faint-text"
              style={{ padding: "var(--commentary-subsection-padding)" }}
            >{`${roundNumber}. ${skippedAnnotatedMove}`}</div>
          );
        }
        skippedAnnotatedMove = null;

        descriptionElements.push(
          <div ref={lastHeaderRef} className="section-header">
            {[
              `${roundNumber}. ${isWhiteToMove ? "..." : ""}`,
              ...annotatedMoveJsx,
            ]}
          </div>
        );

        descriptionElements.push(
          <div
            className="faint-text"
            style={{ padding: "var(--commentary-section-padding)" }}
          >
            <i>No information found for this move.</i>
          </div>
        );
      } else {
        // Tries to bundle skipped moves into rounds where possible by storing White's move
        if (!isWhiteToMove) {
          skippedAnnotatedMove = annotatedMove;
        } else {
          descriptionElements.push(
            <div
              className="faint-text"
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
      let moveDescriptionData = currentMoveData["description"];

      if (skippedAnnotatedMove) {
        descriptionElements.push(
          <div
            className="faint-text"
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
            `${roundNumber}. ${isWhiteToMove ? "..." : ""}`,
            ...annotatedMoveJsx,
          ]}
        </div>
      );

      descriptionElements.push(
        <div style={{ padding: "var(--commentary-section-padding)" }}>
          {generateRichDescription(moveDescriptionData, {
            add_moves_button: (...params) =>
              addMovesConverter(moveIndex, ...params),
          })}
        </div>
      );
    }

    if ("title" in currentMoveData) {
      title = currentMoveData["title"];
    }
  }

  return (
    <div
      style={{
        maxHeight: "480px",
        padding: `${
          title ? "var(--spacing-small)" : "var(--spacing-medium)"
        } var(--spacing-medium) var(--spacing-medium) var(--spacing-medium)`,

        display: "flex",
        flexDirection: "column",
      }}
    >
      {title && (
        <div
          className="faint-text"
          style={{
            borderBottom:
              "var(--border-width-small) solid var(--light-shade-color)",
            padding: "0 var(--spacing-medium) 0 0",
            textAlign: "right",
          }}
        >
          <i>{title}</i>
        </div>
      )}
      <div
        ref={descriptionRef}
        className="y-scrollbar"
        style={title ? { paddingTop: "var(--spacing-small)" } : {}}
      >
        {descriptionElements}
      </div>
    </div>
  );
}

export default ChessMovesCommentary;
