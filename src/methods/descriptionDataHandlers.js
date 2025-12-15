import glossary from "../data/glossary.json";
import moveInfo from "../data/moveInfo.json";
import { ReactComponent as BlunderIcon } from "../res/Blunder.svg";
import { ReactComponent as MistakeIcon } from "../res/Mistake.svg";
import { ReactComponent as DubiousIcon } from "../res/Dubious.svg";
import { ReactComponent as GreatIcon } from "../res/Great.svg";
import { ReactComponent as BrilliantIcon } from "../res/Brilliant.svg";
import { ReactComponent as MissIcon } from "../res/Miss.svg";

const ANNOTATION_ICON_LOOKUP = {
  "??": BlunderIcon,
  "?": MistakeIcon,
  "?!": DubiousIcon,
  "!": GreatIcon,
  "!!": BrilliantIcon,
  "✖": MissIcon,
};

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
    for (const listItemData of data["value"]) {
      listItems.push(<li>{caller(listItemData, customHandlers)}</li>);
    }

    return <ul>{listItems}</ul>;
  },
  glossary_button: (data, customHandlers, caller, context) => {
    const glossaryTitle = (glossary[data["value"]] ?? {})["title"];
    const buttonTitle = `Topic: ${glossaryTitle ?? data["value"]}`;
    const isSelected = context.glossaryId === data["value"];

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
      !isReplacingMoves && gameHistory.length === movesList.length;

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
        {data["text"] && <b>{[caller(data["text"], customHandlers), " "]}</b>}
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
  table: (data, customHandlers, caller, context) => {
    const headerRow = [];
    const bodyRows = [];

    for (const [rowIndex, rowData] of data["value"].entries()) {
      const cells = [];

      for (const [columnIndex, cellData] of rowData.entries()) {
        if (rowIndex === 0) {
          cells.push(<th>{caller(cellData, customHandlers)}</th>);
        } else {
          cells.push(<td>{caller(cellData, customHandlers)}</td>);
        }
      }

      if (rowIndex === 0) {
        headerRow.push(<tr>{cells}</tr>);
      } else {
        bodyRows.push(<tr>{cells}</tr>);
      }
    }

    return (
      <table>
        <thead>{headerRow}</thead>
        <tbody>{bodyRows}</tbody>
      </table>
    );
  },
  incomplete: (data, customHandlers, caller, context) => {
    return (
      <div className="highlight-box minor-text">
        {"ⓘ "}
        <i>{"This section is incomplete."}</i>
      </div>
    );
  },
  mini_header: (data, customHandlers, caller, context) => {
    return (
      <div
        className="mini-header"
        style={{ margin: "var(--spacing-small) 0 var(--spacing-tiny) 0" }}
      >
        {caller(data["text"], customHandlers)}
      </div>
    );
  },
  highlight_box: (data, customHandlers, caller, context) => {
    return (
      <div
        className="highlight-box"
        {...(data["header"] && { style: { paddingTop: "0" } })}
      >
        {data["header"] && (
          <div
            className="mini-header"
            style={{
              margin: "0 0 var(--spacing-tiny) 0",
            }}
          >
            {caller(data["header"], customHandlers)}
          </div>
        )}
        {caller(data["value"], customHandlers)}
      </div>
    );
  },
  annotated_move: (data, customHandlers, caller, context) => {
    let movesList = data["value"];
    // Coalesce string move lists into arrays
    if (typeof movesList === "string") {
      movesList = movesList.split(" ");
    }

    let currentMoveData = moveInfo;
    for (const moveSan of movesList) {
      currentMoveData = currentMoveData[moveSan] ?? {};
    }

    const moveAnnotation = currentMoveData["annotation"];
    const MoveAnnotationSvg = ANNOTATION_ICON_LOOKUP[moveAnnotation];
    const isWhiteMove = Boolean(movesList.length % 2);
    const roundNumber = movesList.length + (movesList.length % 2);
    const isShort = data["is_short"];

    const moveText = `${
      isShort ? "" : `${roundNumber}. ${isWhiteMove ? "" : "..."}`
    }${movesList[movesList.length - 1]}${moveAnnotation ? " " : ""}`;

    return (
      <span style={{ whiteSpace: "nowrap" }}>
        {data["punctuation"]?.[0]}
        <b>{moveText}</b>
        {moveAnnotation && (
          <MoveAnnotationSvg
            style={{
              height: "calc(var(--line-height-medium) * 0.75)",
              width: "calc(var(--line-height-medium) * 0.75)",
              marginLeft: "-3px",
              marginBottom: "-4px",
            }}
          />
        )}
        {data["punctuation"]?.[1]}
      </span>
    );
  },
};
