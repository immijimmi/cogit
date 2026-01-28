import React from "react";
import { useChessStudyContext } from "./ChessStudyProvider";
import MoveInfoTraverser from "../cls/moveInfoTraverser.js";

function ChessNextMoveOptions() {
  const { game, processDescriptionData } = useChessStudyContext();

  const buttonsJsx = [];

  const gameHistory = game.history();
  const traverser = new MoveInfoTraverser(...gameHistory);

  // Orders moves alphabetically
  for (const nextMoveOption of Array.from(traverser.nextMoveEntries).sort()) {
    buttonsJsx.push(
      processDescriptionData({
        type: "set_moves_button",
        text: nextMoveOption,
        value: gameHistory.concat([nextMoveOption]),
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
          gap: "var(--spacing-very-small)",
        }}
      >
        {buttonsJsx}
      </div>
    </>
  );
}

export default ChessNextMoveOptions;
