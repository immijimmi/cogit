import React from "react";
import { useChessStudyContext } from "./ChessStudyProvider";
import moveInfo from "../data/moveInfo.json";

const MOVE_METADATA_KEYS = new Set([
  "title",
  "description",
  "annotation",
  "credits",
]);

function ChessNextMoveOptions() {
  const { game, generateRichDescription } = useChessStudyContext();

  const buttonsJSX = [];

  // Drill into move data based on the moves made in the current game
  let currentMoveData = moveInfo;

  const gameHistory = game.history();
  gameHistory.forEach((moveSan) => {
    currentMoveData = currentMoveData[moveSan] ?? {};
  });

  for (const moveDataKey in currentMoveData) {
    if (MOVE_METADATA_KEYS.has(moveDataKey)) {
      continue;
    }

    buttonsJSX.push(
      generateRichDescription({
        type: "set_moves_button",
        text: moveDataKey,
        value: gameHistory.concat([moveDataKey]),
      })
    );
  }

  return (
    <>
      <div
        className="faint-text"
        style={{
          textAlign: "center",
          borderBottom: "2px solid",
          borderImage:
            "linear-gradient(to right, transparent 0%, var(--medium-shade-color) 50%, transparent 100%) 1",
        }}
      >
        Move Database
      </div>
      <div
        style={{
          padding: "var(--spacing-medium)",
          display: "flex",
          gap: "var(--spacing-small)",
        }}
      >
        {buttonsJSX}
      </div>
    </>
  );
}

export default ChessNextMoveOptions;
