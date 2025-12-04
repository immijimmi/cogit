import React, {
  useState,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { Chess } from "chess.js";
import glossary from "../data/glossary.json";
import moveInfo from "../data/moveInfo.json";

const ChessStudyContext = createContext();

export function ChessStudyProvider({ children }) {
  const [game, setGame] = useState(new Chess());
  const [gameRender, setGameRender] = useState(0); // Used to trigger a re-render after mutating the game state

  const [glossaryId, setGlossaryId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("glossaryId") || null;
  });

  const [boardHighlights, setBoardHighlights] = useState({});
  const [boardArrows, setBoardArrows] = useState([]);

  const gameUndoHistoryRef = useRef([]);

  const setLastMoveBoardMarkings = useCallback(() => {
    let currentMoveData = moveInfo;
    const gameHistory = game.history();

    for (const moveSan of gameHistory) {
      currentMoveData = currentMoveData[moveSan] ?? {};
    }

    setBoardHighlights(currentMoveData["board_highlights"] ?? {});
    setBoardArrows(currentMoveData["board_arrows"] ?? []);
  }, [game]);

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
    (move, doSetBoardMarkings = true) => {
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
      if (moveResult) {setGameRender(gameRender + 1)}

      // Modify undo history accordingly
      if (gameUndoHistoryRef.current[0] == moveResult.san) {
        gameUndoHistoryRef.current.shift();
      } else {
        gameUndoHistoryRef.current.length = 0;
      }

      if (doSetBoardMarkings) setLastMoveBoardMarkings();
    },
    [game, gameRender, setLastMoveBoardMarkings]
  );

  const tryAddMove = useCallback(
    (move, doSetBoardMarkings = true) => {
      try {
        addMove(move, doSetBoardMarkings);
        return true;
      } catch (err) {
        return false;
      }
    },
    [addMove]
  );

  const setMoves = useCallback(
    (moves, doSetBoardMarkings = true) => {
      // Moves list is a SAN string
      if (typeof moves === "string") {
        moves = moves.split(" ");
      }

      // Add full game history into undo history and reset game state
      gameUndoHistoryRef.current = game.history().concat(gameUndoHistoryRef.current);
      game.reset();

      for (const move of moves) {
        addMove(move, false);
      }
      if (moves.length == 0) setGameRender(gameRender + 1);

      if (doSetBoardMarkings) setLastMoveBoardMarkings();
    },
    [game, gameRender, addMove, setLastMoveBoardMarkings]
  );

  const undoMove = useCallback(
    (doSetBoardMarkings = true) => {
      let undoResult = game.undo();
      if (undoResult) {
        gameUndoHistoryRef.current.unshift(undoResult.san)
        setGameRender(gameRender + 1)
      }

      if (doSetBoardMarkings) setLastMoveBoardMarkings();
    },
    [game, gameRender, setLastMoveBoardMarkings]
  );

  const redoMove = useCallback(
    (doSetBoardMarkings = true) => {
      addMove(gameUndoHistoryRef.current[0], doSetBoardMarkings);
    },
    [addMove]
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
        const glossaryTitle = (glossary[descriptionData["value"]] ?? {})["title"];
        const buttonTitle = `Topic: ${glossaryTitle ?? descriptionData["value"]}`;
        const isSelected = glossaryId == descriptionData["value"];

        const buttonJsx = (
          <button
            title={buttonTitle}
            className={
              "inline-button glossary-button" +
              (descriptionData["value"] in glossary
                ? ""
                : " dev-inactive-element") +
              (isSelected ? " selected-element" : "")
            }
            {...(
              !isSelected && {
                onClick: () => setGlossaryTopic(descriptionData["value"])
              }
            )}
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
              {buttonPunctuation[0]}
              {buttonJsx}
              {buttonPunctuation[1]}
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
            className={
              "inline-button" +
              (isReplacingMoves
                ? " set-moves-button-replaces"
                : " set-moves-button") +
              (isMatching ? " selected-element" : "")
            }
            {...(
              !isMatching && { onClick: () => setMoves(movesList) }
            )}
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
              {buttonPunctuation[0]}
              {buttonJsx}
              {buttonPunctuation[1]}
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
          {descriptionData["text"] ? <b>{`${descriptionData["text"]} `}</b> : null}
          {descriptionData["punctuation"]?.[0]}
          <span className="inline-label eval-arrow-box" style={{
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
          {descriptionData["punctuation"]?.[1]}
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
        gameUndoHistoryRef,
        addMove,
        tryAddMove,
        setMoves,
        undoMove,
        redoMove,
        glossaryId,
        setGlossaryTopic,
        generateRichDescription,
        boardHighlights,
        setBoardHighlights,
        boardArrows,
        setBoardArrows
      }}
    >
      {children}
    </ChessStudyContext.Provider>
  );
}

export function useChessStudyContext() {
  return useContext(ChessStudyContext);
}
