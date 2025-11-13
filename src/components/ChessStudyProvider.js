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

  const [glossaryId, setGlossaryId] = useState(null);

  const undoHistory = useRef([]);

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
      if (undoHistory.current[0] == moveResult.san) {
        undoHistory.current.shift();
      } else {
        undoHistory.current.length = 0;
      }

      if (doRender) setGameRender(gameRender + 1);
    },
    [game, gameRender, undoHistory]
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
      undoHistory.current = game.history().concat(undoHistory.current);
      game.reset();

      for (const move of moves) {
        addMove(move, false);
      }

      if (doRender) setGameRender(gameRender + 1);
    },
    [game, gameRender, undoHistory, addMove]
  );

  const undoMove = useCallback(
    (doRender = true) => {
      let undoResult = game.undo();
      if (undoResult) undoHistory.current.unshift(undoResult.san);

      if (doRender) setGameRender(gameRender + 1);
    },
    [game, gameRender, undoHistory]
  );

  const redoMove = useCallback(
    (doRender = true) => {
      addMove(undoHistory.current[0], doRender);
    },
    [undoHistory, addMove]
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

      // Glossary button
      else if (descriptionData["type"] == "glossary_button") {
        const buttonJsx = (
          <button
            onClick={() => setGlossaryId(descriptionData["value"])}
            className={
              "inline-button-base glossary-button" +
              (descriptionData["value"] in glossary
                ? ""
                : " dev-inactive-element")
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
        const buttonJsx = (
          <button
            onClick={() => setMoves(descriptionData["value"])}
            className="inline-button-base set-moves-button"
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
      // Fallback for unrecognised data
      else {
        return <span className="dev-error-icon">?</span>;
      }
    },
    [setMoves]
  );

  return (
    <ChessStudyContext.Provider
      value={{
        game,
        gameRender,
        undoHistory,
        addMove,
        tryAddMove,
        setMoves,
        undoMove,
        redoMove,
        glossaryId,
        setGlossaryId,
        generateRichDescription,
      }}
    >
      {children}
    </ChessStudyContext.Provider>
  );
}

export function useChessStudyContext() {
  return useContext(ChessStudyContext);
}
