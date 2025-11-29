import React, {
  useState,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { Chess } from "chess.js";
import glossary from "../data/glossary.json";

const ChessStudyContext = createContext();

export function ChessStudyProvider({ children }) {
  const [game, setGame] = useState(new Chess());
  const [gameRender, setGameRender] = useState(0); // Used to trigger a re-render after mutating the game state

  const [boardHighlights, setBoardHighlights] = useState({});
  const [boardArrows, setBoardArrows] = useState([]);

  const [glossaryId, setGlossaryId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("glossaryId") || null;
  });

  const gameUndoHistory = useRef([]);

  const setGlossaryTopic = useCallback((newTopicId) => {
    const urlParams = new URLSearchParams(window.location.search);
    if (newTopicId === null) {
      urlParams.delete("glossaryId");
    } else {
      urlParams.set("glossaryId", newTopicId);
    }

    const isRemainingParams = Boolean(urlParams.toString())
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (isRemainingParams ? "?" + urlParams.toString() : "")
    );

    setGlossaryId(newTopicId);
  }, []);

  const addMove = useCallback(
    (move, doRender = true) => {
      let moveResult;
      // Move data is a SAN string
      if (typeof move === "string") {
        moveResult = game.move(move);
      }
      // Move data is a react-chessboard object
      else {
        moveResult = game.move({
          from: move.sourceSquare,
          to: move.targetSquare,
          promotion: "q", // Always promote to queen for simplicity
        });
      }

      // Modify undo history accordingly
      if (gameUndoHistory.current[0] == moveResult.san) {
        gameUndoHistory.current.shift();
      } else {
        gameUndoHistory.current.length = 0;
      }

      if (doRender) setGameRender(gameRender + 1);
    },
    [game, gameRender, gameUndoHistory]
  );

  const tryAddMove = useCallback(
    (move, doRender = true) => {
      try {
        addMove(move, doRender);
        return true;
      } catch (err) {
        return false;
      }
    },
    [addMove]
  );

  const setMoves = useCallback(
    (moves, doRender = true) => {
      // Moves list is a SAN string
      if (typeof moves === "string") {
        moves = moves.split(" ");
      }

      // Add full game history into undo history and reset game state
      gameUndoHistory.current = game.history().concat(gameUndoHistory.current);
      game.reset();

      for (const move of moves) {
        addMove(move, false);
      }

      if (doRender) setGameRender(gameRender + 1);
    },
    [game, gameRender, gameUndoHistory, addMove]
  );

  const undoMove = useCallback(
    (doRender = true) => {
      let undoResult = game.undo();
      if (undoResult) gameUndoHistory.current.unshift(undoResult.san);

      if (doRender) setGameRender(gameRender + 1);
    },
    [game, gameRender, gameUndoHistory]
  );

  const redoMove = useCallback(
    (doRender = true) => {
      addMove(gameUndoHistory.current[0], doRender);
    },
    [gameUndoHistory, addMove]
  );

  /**
   * Receives a string, array or object representing rich text content, to be converted into JSX.
   */
  const generateRichDescription = useCallback(
    (descriptionData, customDataHandlers = {}) => {
      // Simple text
      if (typeof descriptionData === "string") {
        const result = [];

        // Convert any line breaks into <br /> elements
        const lines = descriptionData.split("\n");
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          result.push(lines[lineIndex]);
          if (lineIndex < lines.length - 1) {
            result.push(<br />);
          }
        }

        return result;
      }
      // Arrays of rich description elements are handled recursively
      else if (Array.isArray(descriptionData)) {
        return descriptionData.map((elementData) =>
          generateRichDescription(elementData, customDataHandlers)
        );
      }

      // Data is assumed to be an object with a 'type' key from this point onwards

      // Custom data handlers are checked first
      else if (descriptionData["type"] in customDataHandlers) {
        return customDataHandlers[descriptionData["type"]](
          descriptionData,
          customDataHandlers
        );
      }

      // <i></i> wrapper
      else if (descriptionData["type"] == "wrap_italic") {
        return (
          <i>
            {generateRichDescription(
              descriptionData["text"],
              customDataHandlers
            )}
          </i>
        );
      }
      // <b></b> wrapper
      else if (descriptionData["type"] == "wrap_bold") {
        return (
          <b>
            {generateRichDescription(
              descriptionData["text"],
              customDataHandlers
            )}
          </b>
        );
      }
      // <b><i></i></b> wrapper
      else if (descriptionData["type"] == "wrap_bolditalic") {
        return (
          <b>
            <i>
              {generateRichDescription(
                descriptionData["text"],
                customDataHandlers
              )}
            </i>
          </b>
        );
      }
      // <ul></ul> wrapper
      else if (descriptionData["type"] == "unordered_list") {
        let listItems = [];
        for (const listItemData of descriptionData["items"]) {
          listItems.push(
            <li>{generateRichDescription(listItemData, customDataHandlers)}</li>
          );
        }

        return <ul>{listItems}</ul>;
      }
      // Glossary button
      else if (descriptionData["type"] == "glossary_button") {
        const glossaryTitle = (glossary[descriptionData["value"]] ?? {})["title"]
        const buttonTitle = `Topic: ${glossaryTitle ?? descriptionData["value"]}`;

        const buttonJsx = (
          <button
            title={buttonTitle}
            onClick={() => setGlossaryTopic(descriptionData["value"])}
            className={
              "inline-button glossary-button" +
              (descriptionData["value"] in glossary
                ? ""
                : " dev-inactive-element") +
              (glossaryId == descriptionData["value"]
                ? " selected-element"
                : "")
            }
          >
            {generateRichDescription(
              descriptionData["text"],
              customDataHandlers
            )}
          </button>
        );

        const buttonPunctuation = descriptionData["punctuation"];
        if (buttonPunctuation) {
          return (
            <span style={{ whiteSpace: "nowrap" }}>
              {buttonJsx}
              {buttonPunctuation}
            </span>
          );
        } else {
          return buttonJsx;
        }
      }
      // 'set moves' button
      else if (descriptionData["type"] == "set_moves_button") {
        let movesList = descriptionData["value"];
        // Coalesce string move lists into arrays
        if (typeof movesList === "string") {
          movesList = movesList.split(" ");
        }

        //Determine button style by whether it will replace the current move list, add to it, or do nothing
        let isReplacingMoves = false;
        const gameHistory = game.history();
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
            onClick={() => setMoves(movesList)}
            className={
              "inline-button" +
              (isReplacingMoves
                ? " set-moves-button-replaces"
                : " set-moves-button") +
              (isMatching ? " selected-element" : "")
            }
          >
            {generateRichDescription(
              descriptionData["text"],
              customDataHandlers
            )}
          </button>
        );

        const buttonPunctuation = descriptionData["punctuation"];
        if (buttonPunctuation) {
          return (
            <span style={{ whiteSpace: "nowrap" }}>
              {buttonJsx}
              {buttonPunctuation}
            </span>
          );
        } else {
          return buttonJsx;
        }
      }
      // Eval swing indicator
      else if (descriptionData["type"] == "eval_swing") {
        const isToWhite = descriptionData["value"] > 0;

        return (
        <span style={{ whiteSpace: "nowrap" }}>
          <b>{`${descriptionData["text"]} `}</b>
          <span className="highlightable inline-label eval-arrow-box" style={{
            backgroundColor: `var(${isToWhite ? "--eval-black" : "--eval-white"})`
          }}>
            <span className="inline-label eval-arrow" style={{
              backgroundColor: `var(${isToWhite ? "--eval-white" : "--eval-black"})`,
              color: `var(${isToWhite ? "--eval-black" : "--eval-white"})`,
              "--eval-arrow-color": `var(${isToWhite ? "--eval-white" : "--eval-black"})`
            }}>
              {`Δ${Math.abs(descriptionData["value"])}`}
            </span>
          </span>
          {descriptionData["punctuation"]}
        </span>
        );
      }
      // Fallback for unrecognised data
      else {
        return <span className="dev-error-icon">?</span>;
      }
    },
    [game, setMoves, glossaryId, setGlossaryTopic]
  );

  return (
    <ChessStudyContext.Provider
      value={{
        game,
        gameRender,
        gameUndoHistory,
        addMove,
        tryAddMove,
        setMoves,
        undoMove,
        redoMove,
        glossaryId,
        setGlossaryTopic,
        generateRichDescription,
        boardHighlights,
        boardArrows
      }}
    >
      {children}
    </ChessStudyContext.Provider>
  );
}

export function useChessStudyContext() {
  return useContext(ChessStudyContext);
}
