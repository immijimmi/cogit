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
import Divider from "../../components/ui/Divider";

export const defaultHandlers = {
  row: (
    data,
    customHandlers,
    descriptionContext,
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    const rowItems = processDescriptionData(
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
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => (
    <a
      href={validateParam(
        processDescriptionData(
          data["link"],
          customHandlers,
          descriptionContext,
          true,
        ),
        "url",
      )}
      target="_blank"
      rel="noreferrer"
    >
      {processDescriptionData(
        data["text"],
        customHandlers,
        descriptionContext,
        true,
      )}
    </a>
  ),
  wrap_italic: (
    data,
    customHandlers,
    descriptionContext,
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => (
    <i>
      {processDescriptionData(
        data["text"],
        customHandlers,
        descriptionContext,
        true,
      )}
    </i>
  ),
  wrap_bold: (
    data,
    customHandlers,
    descriptionContext,
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => (
    <b>
      {processDescriptionData(
        data["text"],
        customHandlers,
        descriptionContext,
        true,
      )}
    </b>
  ),
  wrap_bolditalic: (
    data,
    customHandlers,
    descriptionContext,
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => (
    <b>
      <i>
        {processDescriptionData(
          data["text"],
          customHandlers,
          descriptionContext,
          true,
        )}
      </i>
    </b>
  ),
  unordered_list: (
    data,
    customHandlers,
    descriptionContext,
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    const listItems = processDescriptionData(
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
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    const buttonId = processDescriptionData(
      data["value"],
      customHandlers,
      descriptionContext,
      true,
    );
    const buttonText = processDescriptionData(
      data["text"],
      customHandlers,
      descriptionContext,
      true,
    );
    const buttonPunctuation = validateParam(
      processDescriptionData(
        data["punctuation"],
        customHandlers,
        descriptionContext,
        true,
      ),
      "punctuation",
    );

    // Track duplicate glossary buttons within the same full description
    if (!("glossary_buttons" in descriptionContext))
      descriptionContext["glossary_buttons"] = new Set();
    const isDuplicate = descriptionContext["glossary_buttons"].has(buttonId);
    if (!isDuplicate) descriptionContext["glossary_buttons"].add(buttonId);

    const glossaryTitle = processDescriptionData(
      (GLOSSARY[buttonId] ?? {})["title"],
      customHandlers,
      descriptionContext,
      true,
    );
    const glossaryOrder = processDescriptionData(
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

    const isSelected = chessStudyContext.glossaryId === buttonId;

    const buttonKey = `glossary_button_${
      descriptionContext["key_increment"]
    }_'${buttonText}'_${buttonId}${
      isDuplicate ? "_duplicate" : ""
    }${isSelected ? "_selected" : ""}`;

    const buttonJsx = (
      <button
        key={buttonKey}
        title={buttonTitle}
        className={
          "inline-button glossary-button" +
          (isHidden ? " hidden-topic" : "") +
          (isDuplicate ? " duplicate-topic" : "") +
          (buttonId in GLOSSARY ? "" : " dev-inactive-box") +
          (isSelected ? " selected-element" : "")
        }
        {...(!isSelected && {
          onClick: () => chessStudyContext.setGlossaryTopic(buttonId),
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
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    let movesList = processDescriptionData(
      data["value"],
      customHandlers,
      descriptionContext,
      true,
    );
    const buttonText = processDescriptionData(
      data["text"],
      customHandlers,
      descriptionContext,
      true,
    );
    const buttonPunctuation = validateParam(
      processDescriptionData(
        data["punctuation"],
        customHandlers,
        descriptionContext,
        true,
      ),
      "punctuation",
    );

    // Coalesce string move lists into arrays
    if (typeof movesList === "string") {
      movesList = movesList.split(" ");
    }

    //Determine button style based on whether it will replace the current move list, add to it, or do nothing
    let isReplacingMoves = false;
    const gameHistory = chessStudyContext.game.history();
    for (const [moveIndex, moveSan] of gameHistory.entries()) {
      if (movesList[moveIndex] !== moveSan) {
        isReplacingMoves = true;
        break;
      }
    }
    const isMatching =
      !isReplacingMoves && gameHistory.length === movesList.length;

    const buttonKey = `set_moves_button_${
      descriptionContext["key_increment"]
    }_'${buttonText}'_${movesList}${isMatching ? "_selected" : ""}${
      isReplacingMoves ? "_replaces" : ""
    }`;

    const buttonJsx = (
      <button
        key={buttonKey}
        className={
          "inline-button set-moves-button" +
          (isReplacingMoves ? " replaces-moves" : "") +
          (isMatching ? " selected-element" : "")
        }
        {...(!isMatching && {
          onClick: () => chessStudyContext.setMoves(movesList),
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
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    const evalValue = processDescriptionData(
      data["value"],
      customHandlers,
      descriptionContext,
      true,
    );
    const evalText = processDescriptionData(
      data["text"],
      customHandlers,
      descriptionContext,
      true,
    );
    const evalPunctuation = validateParam(
      processDescriptionData(
        data["punctuation"],
        customHandlers,
        descriptionContext,
        true,
      ),
      "punctuation",
    );
    const showValue =
      processDescriptionData(
        data["show_value"],
        customHandlers,
        descriptionContext,
        false,
      ) ?? true;

    const evalDelta = Math.abs(evalValue).toFixed(2);
    const isToWhite = evalValue > 0;
    const isSelected = chessStudyContext.glossaryId === "eval_swing";

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
              event.button === 0 &&
              chessStudyContext.setGlossaryTopic("eval_swing"),
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
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    const tableRows = processDescriptionData(
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
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    return (
      <div className="highlight-box minor-text">
        {"ⓘ "}
        <i>{"This section is incomplete."}</i>
      </div>
    );
  },
  wip: (
    data,
    customHandlers,
    descriptionContext,
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    return (
      <div className="highlight-box minor-text">
        {"ⓘ "}
        <i>{"This section is currently under construction. Stay tuned!"}</i>
      </div>
    );
  },
  mini_header: (
    data,
    customHandlers,
    descriptionContext,
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    return (
      <div
        className="mini-header"
        style={{ margin: "var(--spacing-small) 0 var(--spacing-tiny) 0" }}
      >
        {processDescriptionData(
          data["text"],
          customHandlers,
          descriptionContext,
          true,
        )}
      </div>
    );
  },
  motif: (
    data,
    customHandlers,
    descriptionContext,
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    const key = processDescriptionData(
      data["key"],
      customHandlers,
      descriptionContext,
      false,
    );

    const context = processDescriptionData(
      data["context"],
      customHandlers,
      descriptionContext,
      true,
    );

    if (!(key in motifs))
      throw new Error(`Unable to retrieve motif using key: ${key}`);
    const motifData = motifs[key];

    const rarityKey = processDescriptionData(
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

    const difficultyKey = processDescriptionData(
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

    const title = processDescriptionData(
      motifData["title"],
      customHandlers,
      descriptionContext,
      true,
    );
    const description = processDescriptionData(
      motifData["description"],
      customHandlers,
      descriptionContext,
      true,
    );

    const recencyTagJsx = generateRecencyTag(motifData);

    return (
      <div
        className={`highlight-box motif-style-1`}
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
        {context && (
          <>
            <Divider />
            {context}
          </>
        )}
      </div>
    );
  },
  highlight_box: (
    data,
    customHandlers,
    descriptionContext,
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    const boxHeader = processDescriptionData(
      data["header"],
      customHandlers,
      descriptionContext,
      true,
    );
    const boxContents = processDescriptionData(
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
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    let movesList = processDescriptionData(
      data["value"],
      customHandlers,
      descriptionContext,
      true,
    );
    const isShort = processDescriptionData(
      data["is_short"],
      customHandlers,
      descriptionContext,
      false,
    );
    const hasIcon =
      processDescriptionData(
        data["has_icon"],
        customHandlers,
        descriptionContext,
        false,
      ) ?? true;
    const movePunctuation = validateParam(
      processDescriptionData(
        data["punctuation"],
        customHandlers,
        descriptionContext,
        true,
      ),
      "punctuation",
    );

    // Coalesce string move lists into arrays
    if (typeof movesList === "string") {
      movesList = movesList.split(" ");
    }

    const traverser = new MoveInfoTraverser(movesList);

    const moveAnnotation = processDescriptionData(
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
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    const isCapitalised = processDescriptionData(
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
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    const isCapitalised = processDescriptionData(
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
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => null,
  lookup: (
    data,
    customHandlers,
    descriptionContext,
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    const target = processDescriptionData(
      data["target"],
      customHandlers,
      descriptionContext,
      false,
    );
    const key = processDescriptionData(
      data["key"],
      customHandlers,
      descriptionContext,
      false,
    );
    const defaultValue = processDescriptionData(
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

    return processDescriptionData(
      key in target ? target[key] : defaultValue,
      customHandlers,
      descriptionContext,
      doSanitizeOutput,
    );
  },
  fragment: (
    data,
    customHandlers,
    descriptionContext,
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    const key = processDescriptionData(
      data["key"],
      customHandlers,
      descriptionContext,
      false,
    );

    if (!(key in fragments))
      throw new Error(
        `Unable to retrieve description fragment using key: ${key}`,
      );

    return processDescriptionData(
      fragments[key],
      customHandlers,
      descriptionContext,
      doSanitizeOutput,
    );
  },
  context: (
    data,
    customHandlers,
    descriptionContext,
    doSanitizeOutput,
    processDescriptionData,
    chessStudyContext,
  ) => {
    return processDescriptionData(
      descriptionContext,
      customHandlers,
      descriptionContext,
      doSanitizeOutput,
    );
  },
};
