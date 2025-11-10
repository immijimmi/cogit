import React, { useRef, useEffect } from "react";
import { useChessStudyContext } from "./ChessStudyProvider";
import moveInfo from "../data/moveInfo.json";

function ChessMovesCommentary() {
  const { game, gameRender, generateRichDescriptionElement } =
    useChessStudyContext();

  const descriptionBox = useRef(null);
  useEffect(
    () =>
      descriptionBox.current.scrollTo({
        top: descriptionBox.current.scrollHeight,
        behavior: "smooth",
      }),
    [gameRender]
  );

  // Convert move data into JSX elements
  let title = "";
  const descriptionElements = [];
  let skippedMoveSan = null; // Temporary storage for if White's move has no commentary. SAN is Standard Algebraic Notation

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

    // No description found for current move
    if (!("description" in currentMoveData)) {
      // A last move without a description is handled uniquely
      if (isLastMove) {
        if (skippedMoveSan) {
          descriptionElements.push(
            <div
              className="faint-text"
              style={{ padding: "var(--block-subsection-padding)" }}
            >{`${roundNumber}. ${skippedMoveSan}`}</div>
          );
        }
        skippedMoveSan = null;

        descriptionElements.push(
          <div className="section-header">{`${roundNumber}. ${
            isWhiteToMove ? "..." : ""
          }${moveSan}`}</div>
        );

        descriptionElements.push(
          <div
            className="faint-text"
            style={{ padding: "var(--block-subsection-padding)" }}
          >
            <i>No information found for this move.</i>
          </div>
        );
      } else {
        // Tries to bundle skipped moves into rounds where possible by storing White's move
        if (!isWhiteToMove) {
          skippedMoveSan = moveSan;
        } else {
          descriptionElements.push(
            <div
              className="faint-text"
              style={{ padding: "var(--block-subsection-padding)" }}
            >{`${roundNumber}. ${
              skippedMoveSan ? skippedMoveSan + " " : "..."
            }${moveSan}`}</div>
          );
          skippedMoveSan = null;
        }
      }
    }
    // Current move has a description
    else {
      let moveDescriptionData = currentMoveData["description"];

      if (skippedMoveSan) {
        descriptionElements.push(
          <div
            className="faint-text"
            style={{ padding: "var(--block-subsection-padding)" }}
          >{`${roundNumber}. ${skippedMoveSan}`}</div>
        );
        skippedMoveSan = null;
      }

      descriptionElements.push(
        <div className="section-header">{`${roundNumber}. ${
          isWhiteToMove ? "..." + moveSan : moveSan
        }`}</div>
      );

      // Coalesce descriptions which are pure strings into array form
      if (typeof moveDescriptionData === "string") {
        moveDescriptionData = [moveDescriptionData];
      }

      // Generate JSX elements for current move's description
      const moveDescriptionElements = [];
      for (const descriptionFragment of moveDescriptionData) {
        // Coalesce 'add moves' data into 'set moves'
        if (descriptionFragment["type"] == "add_moves_button") {
          descriptionFragment["type"] = "set_moves_button";
          descriptionFragment["value"] = gameHistory
            .slice(0, moveIndex + 1)
            .concat(descriptionFragment["value"]);
        }

        moveDescriptionElements.push(
          generateRichDescriptionElement(descriptionFragment)
        );
      }

      descriptionElements.push(
        <div style={{ padding: "var(--block-section-padding)" }}>
          {moveDescriptionElements}
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
        padding: "var(--spacing-medium)",
        minHeight: "400px",
        maxHeight: "400px",
        maxWidth: "800px",

        display: "flex",
        flexDirection: "column",
      }}
    >
      {title ? (
        <div
          className="faint-text"
          style={{
            borderBottom:
              "var(--border-width-small) solid var(--light-shade-color)",
            padding: "0 1rem 0 0",
            textAlign: "right",
          }}
        >
          <i>{title}</i>
        </div>
      ) : null}
      <div ref={descriptionBox} className="y-scrollbar">
        {descriptionElements}
      </div>
    </div>
  );
}

export default ChessMovesCommentary;
