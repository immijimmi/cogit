import React, {
  useState,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { Chess } from "chess.js";

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
   * Receives a string or object representing a rich description element, to be converted into JSX
   */
  const generateRichDescriptionElement = useCallback(
    (elementData) => {
      const result = [];

      // Simple text
      if (typeof elementData === "string") {
        // Convert any line breaks into <br /> elements
        const lines = elementData.split("\n");
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          result.push(lines[lineIndex]);
          if (lineIndex < lines.length - 1) {
            result.push(<br />);
          }
        }
      }
      // Glossary button
      else if (elementData["type"] == "glossary_button") {
        result.push(
          <button
            onClick={() => setGlossaryId(elementData["value"])}
            className="inline-button-base glossary-button"
          >
            {elementData["text"]}
          </button>
        );
      }
      // 'set moves' button
      else if (elementData["type"] == "set_moves_button") {
        result.push(
          <button
            onClick={() => setMoves(elementData["value"])}
            className="inline-button-base set-moves-button"
          >
            {elementData["text"]}
          </button>
        );
      }
      // Fallback for unrecognised data
      else {
        result.push(<span className="dev-error-box">?</span>);
      }

      return result;
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
        generateRichDescriptionElement,
      }}
    >
      {children}
    </ChessStudyContext.Provider>
  );
}

export function useChessStudyContext() {
  return useContext(ChessStudyContext);
}
