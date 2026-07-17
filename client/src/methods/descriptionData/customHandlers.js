/*
 * Description data handler for 'add_moves_button'.
 * In addition to the handler params, `moveIndex` must be passed the index in the moves list at which
 * the moves should be added.
 * This is to ensure that the destination position is still the same even if the button is embedded
 * in commentary for a prior move, since in that case the moves list will have additional moves after
 * that point which may conflict
 */
export const addMovesConverter = (
  moveIndex,
  data,
  customHandlers,
  descriptionContext,
  doCatchIncompatibleData,
  caller,
  studyContext,
) => {
  let addMovesList = caller(
    data["value"],
    customHandlers,
    descriptionContext,
    false,
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
    doCatchIncompatibleData,
  );
};
