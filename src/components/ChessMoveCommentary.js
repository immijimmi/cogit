import React from "react";
import { useChessStudyContext } from "./ChessStudyProvider";
import moveInfo from "../data/moveInfo.json";

function ChessMoveCommentary() {
  const { game, setGlossaryId } = useChessStudyContext();

  // Convert description items into JSX elements
  let title = "";
  const descriptionElements = [];
  let skippedMoveSan = null; // Temporary storage for if White's move has no commentary. SAN is Standard Algebraic Notation

  const gameHistory = game.history();
  let currentMoveData = moveInfo;

  // Initial description text, when no moves have been made
  if (gameHistory.length == 0) {
    descriptionElements.push("Play a move to begin.");
  }

  for (const [moveIndex, moveSan] of gameHistory.entries()) {
    const roundNumber = (moveIndex - (moveIndex % 2)) / 2 + 1;
    const isWhiteToMove = Boolean(moveIndex % 2);
    const isLastMove = moveIndex + 1 == gameHistory.length;

    currentMoveData = currentMoveData[moveSan] ?? {};

    // No description found for current move
    if (!("description" in currentMoveData)) {
      // A last move without a description is handled uniquely
      if (isLastMove) {
        if (skippedMoveSan) {
          descriptionElements.push(
            <div
              className="faint-text"
              style={{ padding: "0 0 0 0.5rem" }}
            >{`${roundNumber}. ${skippedMoveSan}`}</div>
          );
        }
        skippedMoveSan = null;

        descriptionElements.push(
          <div className="header">{`${roundNumber}. ${
            isWhiteToMove ? "..." : ""
          }${moveSan}`}</div>
        );

        descriptionElements.push(
          <div className="faint-text" style={{ padding: "0 0 0 0.5rem" }}>
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
              style={{ padding: "0 0 0 0.5rem" }}
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
      let currentMoveDescriptionData = currentMoveData["description"];

      if (skippedMoveSan) {
        descriptionElements.push(
          <div
            className="faint-text"
            style={{ padding: "0 0 0 0.5rem" }}
          >{`${roundNumber}. ${skippedMoveSan}`}</div>
        );
        skippedMoveSan = null;
      }

      descriptionElements.push(
        <div className="header">{`${roundNumber}. ${
          isWhiteToMove ? "..." + moveSan : moveSan
        }`}</div>
      );

      // Coalesce descriptions which are pure strings into array form
      if (typeof currentMoveDescriptionData === "string") {
        currentMoveDescriptionData = [currentMoveDescriptionData];
      }

      // Add elements for current move description
      const currentElements = [];
      for (const currentEntry of currentMoveDescriptionData) {
        if (typeof currentEntry === "string") {
          // Convert any line breaks into <br /> elements
          const lines = currentEntry.split("\n");
          for (let i = 0; i < lines.length; i++) {
            currentElements.push(lines[i]);
            if (i < lines.length - 1) {
              currentElements.push(<br />);
            }
          }
        } else if (currentEntry["type"] == "glossary_button") {
          currentElements.push(
            <button
              onClick={() => setGlossaryId(currentEntry["value"])}
              className="glossary-button"
            >
              {currentEntry["text"]}
            </button>
          );
        }
      }
      descriptionElements.push(
        <div style={{ padding: "0.5rem 0.5rem 1.5rem 0.5rem" }}>
          {currentElements}
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
        maxHeight: "400px",
        maxWidth: "600px",

        display: "flex",
        flexDirection: "column",
      }}
    >
      {title ? (
        <div
          className="faint-text"
          style={{
            padding: "0 0 1rem 0",
            borderBottom: "2px solid rgba(0, 0, 0, 0.2)",
            textAlign: "right",
          }}
        >
          <i>{title}</i>
        </div>
      ) : null}
      <div className="y-scrollbar">{descriptionElements}</div>
    </div>
  );
}

export default ChessMoveCommentary;
