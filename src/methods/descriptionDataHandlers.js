import glossary from "../data/glossary.json";
import moveInfo from "../data/moveInfo.json";
import { ReactComponent as BlunderIcon } from "../res/Blunder.svg";
import { ReactComponent as MistakeIcon } from "../res/Mistake.svg";
import { ReactComponent as InaccuracyIcon } from "../res/Inaccuracy.svg";
import { ReactComponent as DubiousIcon } from "../res/Dubious.svg";
import { ReactComponent as AcceptableIcon } from "../res/Acceptable.svg";
import { ReactComponent as AccurateIcon } from "../res/Accurate.svg";
import { ReactComponent as GreatIcon } from "../res/Great.svg";
import { ReactComponent as BrilliantIcon } from "../res/Brilliant.svg";
import { ReactComponent as MissIcon } from "../res/Miss.svg";

const ANNOTATION_ICON_LOOKUP = {
  "??": BlunderIcon,
  "?": MistakeIcon,
  "?!": InaccuracyIcon,
  "~": DubiousIcon,
  "✔": AcceptableIcon,
  "★": AccurateIcon,
  "!": GreatIcon,
  "!!": BrilliantIcon,
  "✖": MissIcon,
};

export default {
  wrap_italic: (
    data,
    customHandlers,
    descriptionContext,
    caller,
    studyContext
  ) => <i>{caller(data["text"], customHandlers, descriptionContext)}</i>,
  wrap_bold: (
    data,
    customHandlers,
    descriptionContext,
    caller,
    studyContext
  ) => <b>{caller(data["text"], customHandlers, descriptionContext)}</b>,
  wrap_bolditalic: (
    data,
    customHandlers,
    descriptionContext,
    caller,
    studyContext
  ) => (
    <b>
      <i>{caller(data["text"], customHandlers, descriptionContext)}</i>
    </b>
  ),
  unordered_list: (
    data,
    customHandlers,
    descriptionContext,
    caller,
    studyContext
  ) => {
    let listItems = [];
    for (const listItemData of data["value"]) {
      listItems.push(
        <li>{caller(listItemData, customHandlers, descriptionContext)}</li>
      );
    }

    return <ul>{listItems}</ul>;
  },
  glossary_button: (
    data,
    customHandlers,
    descriptionContext,
    caller,
    studyContext
  ) => {
    const glossaryTitle = (glossary[data["value"]] ?? {})["title"];
    const buttonTitle = `Topic: ${glossaryTitle ?? data["value"]}`;
    const isSelected = studyContext.glossaryId === data["value"];

    const buttonJsx = (
      <button
        title={buttonTitle}
        className={
          "inline-button glossary-button" +
          (data["value"] in glossary ? "" : " dev-inactive-element") +
          (isSelected ? " selected-element" : "")
        }
        {...(!isSelected && {
          onClick: () => studyContext.setGlossaryTopic(data["value"]),
        })}
      >
        {caller(data["text"], customHandlers, descriptionContext)}
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
  set_moves_button: (
    data,
    customHandlers,
    descriptionContext,
    caller,
    studyContext
  ) => {
    let movesList = data["value"];
    // Coalesce string move lists into arrays
    if (typeof movesList === "string") {
      movesList = movesList.split(" ");
    }

    //Determine button style based on whether it will replace the current move list, add to it, or do nothing
    let isReplacingMoves = false;
    const gameHistory = studyContext.game.history();
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
        {...(!isMatching && {
          onClick: () => studyContext.setMoves(movesList),
        })}
      >
        {caller(data["text"], customHandlers, descriptionContext)}
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
  eval_swing: (
    data,
    customHandlers,
    descriptionContext,
    caller,
    studyContext
  ) => {
    const isToWhite = data["value"] > 0;

    return (
      <span style={{ whiteSpace: "nowrap" }}>
        {data["text"] && (
          <b>
            {[caller(data["text"], customHandlers, descriptionContext), " "]}
          </b>
        )}
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
  table: (data, customHandlers, descriptionContext, caller, studyContext) => {
    const headerRow = [];
    const bodyRows = [];

    for (const [rowIndex, rowData] of data["value"].entries()) {
      const cells = [];

      for (const [columnIndex, cellData] of rowData.entries()) {
        if (rowIndex === 0) {
          cells.push(
            <th>{caller(cellData, customHandlers, descriptionContext)}</th>
          );
        } else {
          cells.push(
            <td>{caller(cellData, customHandlers, descriptionContext)}</td>
          );
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
  incomplete: (
    data,
    customHandlers,
    descriptionContext,
    caller,
    studyContext
  ) => {
    return (
      <div className="highlight-box minor-text">
        {"ⓘ "}
        <i>{"This section is incomplete."}</i>
      </div>
    );
  },
  mini_header: (
    data,
    customHandlers,
    descriptionContext,
    caller,
    studyContext
  ) => {
    return (
      <div
        className="mini-header"
        style={{ margin: "var(--spacing-small) 0 var(--spacing-tiny) 0" }}
      >
        {caller(data["text"], customHandlers, descriptionContext)}
      </div>
    );
  },
  highlight_box: (
    data,
    customHandlers,
    descriptionContext,
    caller,
    studyContext
  ) => {
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
            {caller(data["header"], customHandlers, descriptionContext)}
          </div>
        )}
        {caller(data["value"], customHandlers, descriptionContext)}
      </div>
    );
  },
  annotated_move: (
    data,
    customHandlers,
    descriptionContext,
    caller,
    studyContext
  ) => {
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
    const roundNumber = (movesList.length + (movesList.length % 2)) / 2;
    const isShort = data["is_short"];
    const hasIcon = data["has_icon"] ?? true;

    const moveText = `${
      isShort ? "" : `${roundNumber}. ${isWhiteMove ? "" : "..."}`
    }${movesList[movesList.length - 1]}${moveAnnotation ? " " : ""}`;

    return (
      <span style={{ whiteSpace: "nowrap" }}>
        {data["punctuation"]?.[0]}
        <b>{moveText}</b>
        {hasIcon && moveAnnotation && (
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
  player_ref: (
    data,
    customHandlers,
    descriptionContext,
    caller,
    studyContext
  ) => {
    return (
      descriptionContext["current_player"] ??
      (data["is_capitalised"] ? "The player" : "the player")
    );
  },
  opponent_ref: (
    data,
    customHandlers,
    descriptionContext,
    caller,
    studyContext
  ) => {
    return descriptionContext["current_player"]
      ? { White: "Black", Black: "White" }[descriptionContext["current_player"]]
      : data["is_capitalised"]
      ? "The opponent"
      : "the opponent";
  },
  lookup: (data, customHandlers, descriptionContext, caller, studyContext) => {
    return caller(data["target"], customHandlers, descriptionContext)[
      caller(data["key"], customHandlers, descriptionContext)
    ];
  },
  data: (data, customHandlers, descriptionContext, caller, studyContext) =>
    data["value"],
};
