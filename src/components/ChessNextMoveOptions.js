import React from "react";
import { useChessStudyContext } from "./ChessStudyProvider";
import moveInfo from "../data/moveInfo.json";

const MOVE_METADATA_KEYS = new Set([
  "title",
  "description",
  "annotation",
  "credits",
  "board_arrows",
  "board_highlights",
  "comment",
]);

function ChessNextMoveOptions() {
  const { game, generateRichDescription } = useChessStudyContext();

  const buttonsJsx = [];

  // Drill into move data based on the moves made in the current game
  let currentMoveData = moveInfo;

  const gameHistory = game.history();
  gameHistory.forEach((moveSan) => {
    currentMoveData = currentMoveData[moveSan] ?? {};
  });

  // Orders moves alphabetically
  for (const moveDataKey of Object.keys(currentMoveData).sort()) {
    if (MOVE_METADATA_KEYS.has(moveDataKey)) {
      continue;
    }

    buttonsJsx.push(
      generateRichDescription({
        type: "set_moves_button",
        text: moveDataKey,
        value: gameHistory.concat([moveDataKey]),
      })
    );
  }

  return (
    <>
      <div className="mini-header">Move Database</div>
      <div
        style={{
          padding: "var(--spacing-medium)",
          display: "flex",
          gap: "var(--spacing-small)",
        }}
      >
        {buttonsJsx}
      </div>
    </>
  );
}

export default ChessNextMoveOptions;
