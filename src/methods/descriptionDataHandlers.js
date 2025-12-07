import glossary from "../data/glossary.json";

export default {
  wrap_italic: (data, customHandlers, caller, context) => (
    <i>{caller(data["text"], customHandlers)}</i>
  ),
  wrap_bold: (data, customHandlers, caller, context) => (
    <b>{caller(data["text"], customHandlers)}</b>
  ),
  wrap_bolditalic: (data, customHandlers, caller, context) => (
    <b>
      <i>{caller(data["text"], customHandlers)}</i>
    </b>
  ),
  unordered_list: (data, customHandlers, caller, context) => {
    let listItems = [];
    for (const listItemData of data["items"]) {
      listItems.push(<li>{caller(listItemData, customHandlers)}</li>);
    }

    return <ul>{listItems}</ul>;
  },
  glossary_button: (data, customHandlers, caller, context) => {
    const glossaryTitle = (glossary[data["value"]] ?? {})["title"];
    const buttonTitle = `Topic: ${glossaryTitle ?? data["value"]}`;
    const isSelected = context.glossaryId == data["value"];

    const buttonJsx = (
      <button
        title={buttonTitle}
        className={
          "inline-button glossary-button" +
          (data["value"] in glossary ? "" : " dev-inactive-element") +
          (isSelected ? " selected-element" : "")
        }
        {...(!isSelected && {
          onClick: () => context.setGlossaryTopic(data["value"]),
        })}
      >
        {caller(data["text"], customHandlers)}
      </button>
    );

    const buttonPunctuation = data["punctuation"];
    if (buttonPunctuation) {
      return (
        <span style={{ whiteSpace: "nowrap" }}>
          {buttonPunctuation[0]}
          {buttonJsx}
          {buttonPunctuation[1]}
        </span>
      );
    } else {
      return buttonJsx;
    }
  },
  set_moves_button: (data, customHandlers, caller, context) => {
    let movesList = data["value"];
    // Coalesce string move lists into arrays
    if (typeof movesList === "string") {
      movesList = movesList.split(" ");
    }

    //Determine button style based on whether it will replace the current move list, add to it, or do nothing
    let isReplacingMoves = false;
    const gameHistory = context.game.history();
    for (const [moveIndex, moveSan] of gameHistory.entries()) {
      if (movesList[moveIndex] != moveSan) {
        isReplacingMoves = true;
        break;
      }
    }
    const isMatching =
      !isReplacingMoves && gameHistory.length == movesList.length;

    const buttonJsx = (
      <button
        className={
          "inline-button" +
          (isReplacingMoves
            ? " set-moves-button-replaces"
            : " set-moves-button") +
          (isMatching ? " selected-element" : "")
        }
        {...(!isMatching && { onClick: () => context.setMoves(movesList) })}
      >
        {caller(data["text"], customHandlers)}
      </button>
    );

    const buttonPunctuation = data["punctuation"];
    if (buttonPunctuation) {
      return (
        <span style={{ whiteSpace: "nowrap" }}>
          {buttonPunctuation[0]}
          {buttonJsx}
          {buttonPunctuation[1]}
        </span>
      );
    } else {
      return buttonJsx;
    }
  },
  eval_swing: (data, customHandlers, caller, context) => {
    const isToWhite = data["value"] > 0;

    return (
      <span style={{ whiteSpace: "nowrap" }}>
        {data["text"] ? <b>{`${data["text"]} `}</b> : null}
        {data["punctuation"]?.[0]}
        <span
          className="inline-label eval-arrow-box"
          style={{
            border: `var(--border-width-small) solid var(${
              isToWhite ? "--eval-black" : "--eval-white"
            })`,
            backgroundColor: `var(${
              isToWhite ? "--eval-black" : "--eval-white"
            })`,
          }}
        >
          <span
            className="inline-label eval-arrow"
            style={{
              backgroundColor: `var(${
                isToWhite ? "--eval-white" : "--eval-black"
              })`,
              color: `var(${isToWhite ? "--eval-black" : "--eval-white"})`,
              "--eval-arrow-color": `var(${
                isToWhite ? "--eval-white" : "--eval-black"
              })`,
            }}
          >
            {`Δ${Math.abs(data["value"])}`}
          </span>
        </span>
        {data["punctuation"]?.[1]}
      </span>
    );
  },
};
