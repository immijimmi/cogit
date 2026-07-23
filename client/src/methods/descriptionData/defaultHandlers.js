import { GLOSSARY } from "../../data/aggregates";
import fragments from "../../data/fragments.json";
import motifs from "../../data/motifs.json";
import MoveInfoTraverser from "../../cls/moveInfoTraverser";
import {
  INVERTED_GLOSSARY_CATEGORY_LOOKUP,
  ANNOTATION_ICON_LOOKUP,
  DIFFICULTY_LOOKUP,
  RARITY_LOOKUP,
} from "../../constants";
import { generateRecencyTag } from "../data";
import { validateParam } from "./validateParam";

export const defaultHandlers = {
  row: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => {
    const rowItems = caller(
      data["value"],
      customHandlers,
      descriptionContext,
      true,
    );
    let rowItemsJsx = [];

    for (const rowItem of rowItems) {
      rowItemsJsx.push(<div className="description-row-item">{rowItem}</div>);
    }

    return <div className="description-row">{rowItemsJsx}</div>;
  },
  link: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => (
    <a
      href={validateParam(
        caller(data["link"], customHandlers, descriptionContext, true),
        "url",
      )}
      target="_blank"
      rel="noreferrer"
    >
      {caller(data["text"], customHandlers, descriptionContext, true)}
    </a>
  ),
  wrap_italic: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => <i>{caller(data["text"], customHandlers, descriptionContext, true)}</i>,
  wrap_bold: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => <b>{caller(data["text"], customHandlers, descriptionContext, true)}</b>,
  wrap_bolditalic: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => (
    <b>
      <i>{caller(data["text"], customHandlers, descriptionContext, true)}</i>
    </b>
  ),
  unordered_list: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => {
    const listItems = caller(
      data["value"],
      customHandlers,
      descriptionContext,
      true,
    );
    let listItemsJsx = [];

    for (const listItem of listItems) {
      listItemsJsx.push(<li>{listItem}</li>);
    }

    return <ul>{listItemsJsx}</ul>;
  },
  glossary_button: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => {
    const buttonId = caller(
      data["value"],
      customHandlers,
      descriptionContext,
      true,
    );
    const buttonText = caller(
      data["text"],
      customHandlers,
      descriptionContext,
      true,
    );
    const buttonPunctuation = validateParam(
      caller(data["punctuation"], customHandlers, descriptionContext, true),
      "punctuation",
    );

    // Prevent duplicate glossary buttons within the same full description
    if (!("glossary_buttons" in descriptionContext))
      descriptionContext["glossary_buttons"] = new Set();
    if (descriptionContext["glossary_buttons"].has(buttonId)) {
      return (
        <>
          {buttonPunctuation?.[0]}
          <span className="glossary-duplicate-topic">{buttonText}</span>
          {buttonPunctuation?.[1]}
        </>
      );
    } else {
      descriptionContext["glossary_buttons"].add(buttonId);
    }

    const glossaryTitle = caller(
      (GLOSSARY[buttonId] ?? {})["title"],
      customHandlers,
      descriptionContext,
      true,
    );
    const glossaryOrder = caller(
      (GLOSSARY[buttonId] ?? {})["order"],
      customHandlers,
      descriptionContext,
      true,
    );
    // Glossary entries with no order or `null` order are 'hidden', i.e. not listed in the margin
    const isHidden = glossaryOrder == null;
    const isDefinition =
      glossaryOrder != null &&
      Math.floor(glossaryOrder).toString() ===
        INVERTED_GLOSSARY_CATEGORY_LOOKUP["Definitions"];
    const buttonTitle = `${isDefinition ? "Definition" : "Topic"}: ${
      glossaryTitle ?? buttonId
    }`;

    const isSelected = studyContext.glossaryId === buttonId;

    const buttonJsx = (
      <button
        key={`glossary_button_${
          descriptionContext["key_increment"]
        }_'${buttonText}'_${buttonId}${isSelected ? "_selected" : ""}`}
        title={buttonTitle}
        className={
          "inline-button" +
          (isHidden ? " glossary-button-hidden-topic" : " glossary-button") +
          (buttonId in GLOSSARY ? "" : " dev-inactive-box") +
          (isSelected ? " selected-element" : "")
        }
        {...(!isSelected && {
          onClick: () => studyContext.setGlossaryTopic(buttonId),
        })}
      >
        {buttonText}
      </button>
    );
    descriptionContext["key_increment"] += 1;

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
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => {
    let movesList = caller(
      data["value"],
      customHandlers,
      descriptionContext,
      true,
    );
    const buttonText = caller(
      data["text"],
      customHandlers,
      descriptionContext,
      true,
    );
    const buttonPunctuation = validateParam(
      caller(data["punctuation"], customHandlers, descriptionContext, true),
      "punctuation",
    );

    // Coalesce string move lists into arrays
    if (typeof movesList === "string") {
      movesList = movesList.split(" ");
    }

    //Determine button style based on whether it will replace the current move list, add to it, or do nothing
    let isReplacingMoves = false;
    const gameHistory = studyContext.game.history();
    for (const [moveIndex, moveSan] of gameHistory.entries()) {
      if (movesList[moveIndex] !== moveSan) {
        isReplacingMoves = true;
        break;
      }
    }
    const isMatching =
      !isReplacingMoves && gameHistory.length === movesList.length;

    const buttonJsx = (
      <button
        key={`set_moves_button_${
          descriptionContext["key_increment"]
        }_${buttonText}_${movesList}${isMatching ? "_selected" : ""}${
          isReplacingMoves ? "_replaces" : ""
        }`}
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
        {buttonText}
      </button>
    );
    descriptionContext["key_increment"] += 1;

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
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => {
    const evalValue = caller(
      data["value"],
      customHandlers,
      descriptionContext,
      true,
    );
    const evalText = caller(
      data["text"],
      customHandlers,
      descriptionContext,
      true,
    );
    const evalPunctuation = validateParam(
      caller(data["punctuation"], customHandlers, descriptionContext, true),
      "punctuation",
    );
    const showValue =
      caller(data["show_value"], customHandlers, descriptionContext, false) ??
      true;

    const evalDelta = Math.abs(evalValue).toFixed(2);
    const isToWhite = evalValue > 0;
    const isSelected = studyContext.glossaryId === "eval_swing";

    return (
      <span style={{ whiteSpace: "nowrap" }}>
        {evalText && <b>{[evalText, " "]}</b>}
        {evalPunctuation?.[0]}
        <span
          className={
            "clickable-icon inline-label eval-arrow-box" +
            (isSelected ? " selected-element" : "")
          }
          {...(!isSelected && {
            onMouseDown: (event) =>
              event.button === 0 && studyContext.setGlossaryTopic("eval_swing"),
          })}
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
            {showValue ? `Δ${evalDelta}` : "Δ"}
          </span>
        </span>
        {evalPunctuation?.[1]}
      </span>
    );
  },
  table: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => {
    const tableRows = caller(
      data["value"],
      customHandlers,
      descriptionContext,
      true,
    );

    const headerRow = [];
    const bodyRows = [];

    for (const [rowIndex, row] of tableRows.entries()) {
      const cellsJsx = [];

      for (const [columnIndex, cell] of row.entries()) {
        if (rowIndex === 0) {
          cellsJsx.push(<th>{cell}</th>);
        } else {
          cellsJsx.push(<td>{cell}</td>);
        }
      }

      if (rowIndex === 0) {
        headerRow.push(<tr>{cellsJsx}</tr>);
      } else {
        bodyRows.push(<tr>{cellsJsx}</tr>);
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
    doCatchIncompatibleData,
    caller,
    studyContext,
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
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => {
    return (
      <div
        className="mini-header"
        style={{ margin: "var(--spacing-small) 0 var(--spacing-tiny) 0" }}
      >
        {caller(data["text"], customHandlers, descriptionContext, true)}
      </div>
    );
  },
  motif: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => {
    const key = caller(data["key"], customHandlers, descriptionContext, false);

    if (!(key in motifs))
      throw new Error(`Unable to retrieve motif using key: ${key}`);
    const motifData = motifs[key];

    const rarityKey = caller(
      motifData["rarity"],
      customHandlers,
      descriptionContext,
      false,
    );
    const rarity = RARITY_LOOKUP[rarityKey];
    if (!rarity)
      throw new Error(
        `Invalid value given for motif (${key}) rarity: ${rarityKey}`,
      );

    const difficultyKey = caller(
      motifData["difficulty"],
      customHandlers,
      descriptionContext,
      false,
    );
    const difficulty = DIFFICULTY_LOOKUP[difficultyKey];
    if (!difficulty)
      throw new Error(
        `Invalid value given for motif (${key}) difficulty: ${difficultyKey}`,
      );

    const title = caller(
      motifData["title"],
      customHandlers,
      descriptionContext,
      true,
    );
    const description = caller(
      motifData["description"],
      customHandlers,
      descriptionContext,
      true,
    );

    const recencyTagJsx = generateRecencyTag(motifData);

    return (
      <div
        className={`highlight-box motif-box-${rarity.toLowerCase()}`}
        style={{ paddingTop: "0" }}
      >
        <div
          className="section-header-2 faint-underline"
          style={{
            padding: "var(--spacing-small) 0",
            margin: "0 0 var(--spacing-small) 0",
            lineHeight: "var(--line-height-tiny)",
          }}
        >
          <div className="centred-content">
            {title}
            {recencyTagJsx}
          </div>
          <div className="minor-text">{`${rarity} Motif | ${difficulty}`}</div>
        </div>
        {description}
      </div>
    );
  },
  highlight_box: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => {
    const boxHeader = caller(
      data["header"],
      customHandlers,
      descriptionContext,
      true,
    );
    const boxContents = caller(
      data["value"],
      customHandlers,
      descriptionContext,
      true,
    );

    return (
      <div
        className="highlight-box"
        {...(boxHeader && { style: { paddingTop: "0" } })}
      >
        {boxHeader && (
          <div
            className="mini-header"
            style={{
              margin: "0 0 var(--spacing-small) 0",
            }}
          >
            {boxHeader}
          </div>
        )}
        {boxContents}
      </div>
    );
  },
  annotated_move: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => {
    let movesList = caller(
      data["value"],
      customHandlers,
      descriptionContext,
      true,
    );
    const isShort = caller(
      data["is_short"],
      customHandlers,
      descriptionContext,
      false,
    );
    const hasIcon =
      caller(data["has_icon"], customHandlers, descriptionContext, false) ??
      true;
    const movePunctuation = validateParam(
      caller(data["punctuation"], customHandlers, descriptionContext, true),
      "punctuation",
    );

    // Coalesce string move lists into arrays
    if (typeof movesList === "string") {
      movesList = movesList.split(" ");
    }

    const traverser = new MoveInfoTraverser(movesList);

    const moveAnnotation = caller(
      traverser.annotation,
      customHandlers,
      descriptionContext,
      true,
    );
    const MoveAnnotationSvg = ANNOTATION_ICON_LOOKUP[moveAnnotation];
    const isWhiteMove = Boolean(movesList.length % 2);
    const roundNumber = (movesList.length + (movesList.length % 2)) / 2;

    const moveText = `${
      isShort ? "" : `${roundNumber}. ${isWhiteMove ? "" : "..."}`
    }${movesList[movesList.length - 1]}${moveAnnotation ? " " : ""}`;

    return (
      <span style={{ whiteSpace: "nowrap" }}>
        {movePunctuation?.[0]}
        <b>{moveText}</b>
        {hasIcon && moveAnnotation && (
          <MoveAnnotationSvg
            style={{
              height: "var(--inline-icon-height-medium)",
              width: "var(--inline-icon-height-medium)",
              marginLeft: "-3px",
              marginBottom: "-4px",
            }}
          />
        )}
        {movePunctuation?.[1]}
      </span>
    );
  },
  player_ref: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => {
    const isCapitalised = caller(
      data["is_capitalised"],
      customHandlers,
      descriptionContext,
      false,
    );

    return (
      descriptionContext["current_player"] ??
      (isCapitalised ? "The player" : "the player")
    );
  },
  opponent_ref: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => {
    const isCapitalised = caller(
      data["is_capitalised"],
      customHandlers,
      descriptionContext,
      false,
    );

    if (descriptionContext["current_player"]) {
      return { White: "Black", Black: "White" }[
        descriptionContext["current_player"]
      ];
    } else {
      return isCapitalised ? "The opponent" : "the opponent";
    }
  },

  // Meta-handlers

  comment: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => null,
  lookup: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => {
    const target = caller(
      data["target"],
      customHandlers,
      descriptionContext,
      false,
    );
    const key = caller(data["key"], customHandlers, descriptionContext, false);
    const defaultValue = caller(
      data["default"],
      customHandlers,
      descriptionContext,
      false,
    );

    const hasDefault = "default" in data;
    if (!(key in target) && !hasDefault)
      throw new Error(
        `Invalid key and no default value provided for lookup operation. Key: ${key}`,
      );

    return caller(
      key in target ? target[key] : defaultValue,
      customHandlers,
      descriptionContext,
      doCatchIncompatibleData,
    );
  },
  fragment: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => {
    const key = caller(data["key"], customHandlers, descriptionContext, false);

    if (!(key in fragments))
      throw new Error(
        `Unable to retrieve description fragment using key: ${key}`,
      );

    return caller(
      fragments[key],
      customHandlers,
      descriptionContext,
      doCatchIncompatibleData,
    );
  },
  context: (
    data,
    customHandlers,
    descriptionContext,
    doCatchIncompatibleData,
    caller,
    studyContext,
  ) => {
    return caller(
      descriptionContext,
      customHandlers,
      descriptionContext,
      doCatchIncompatibleData,
    );
  },
};
