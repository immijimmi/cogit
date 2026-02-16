import React, {
  useState,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { Chess } from "chess.js";
import MoveInfoTraverser from "../../cls/moveInfoTraverser.js";
import descriptionDataHandlers from "../../methods/descriptionDataHandlers";
import { getUrlParam, setUrlParam } from "../../methods/url.js";

const ChessStudyContext = createContext();

export function ChessStudyProvider({ children }) {
  // Board Variables
  const [game, setGame] = useState(() => {
    const result = new Chess();

    getUrlParam("gameHistory")
      ?.split(" ")
      .forEach((moveSan) => result.move(moveSan));
    return result;
  });

  const [isBoardFlipped, setIsBoardFlipped] = useState(
    () => getUrlParam("flipBoard") === "true"
  );

  const [boardHighlights, setBoardHighlights] = useState(
    () =>
      new MoveInfoTraverser(...(getUrlParam("gameHistory")?.split(" ") || []))
        .boardHighlights
  );
  const [boardArrows, setBoardArrows] = useState(
    () =>
      new MoveInfoTraverser(...(getUrlParam("gameHistory")?.split(" ") || []))
        .boardArrows
  );

  const gameUndoHistoryRef = useRef([]);
  const [gameRender, setGameRender] = useState(0); // Used to trigger a re-render after mutating the game state

  // Glossary Variables
  const [glossaryId, setGlossaryId] = useState(() => getUrlParam("glossaryId"));
  const [isGlossaryMarginHidden, setIsGlossaryMarginHidden] = useState(false);

  // Methods
  const applyBoardMarkings = useCallback(() => {
    const traverser = new MoveInfoTraverser(...game.history());

    setBoardHighlights(traverser.boardHighlights);
    setBoardArrows(traverser.boardArrows);
  }, [game]);

  const flipBoard = useCallback(() => {
    const newValue = !isBoardFlipped;

    setIsBoardFlipped(newValue);
    setUrlParam("flipBoard", newValue ? true : null);
  }, [isBoardFlipped]);

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
      if (!moveResult) return;

      setUrlParam("gameHistory", game.history().join(" ") || null);

      // Modify undo history accordingly
      if (gameUndoHistoryRef.current[0] === moveResult.san) {
        gameUndoHistoryRef.current.shift();
      } else {
        gameUndoHistoryRef.current.length = 0;
      }

      if (doSetBoardMarkings) applyBoardMarkings();

      // Ensure re-render
      setGameRender(gameRender + 1);
    },
    [game, gameRender, applyBoardMarkings]
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
      gameUndoHistoryRef.current = game
        .history()
        .concat(gameUndoHistoryRef.current);
      game.reset();

      setUrlParam("gameHistory", null);
      setGameRender(gameRender + 1);

      // Then add new moves one by one
      for (const move of moves) {
        addMove(move, false);
      }

      if (doSetBoardMarkings) applyBoardMarkings();
    },
    [game, gameRender, addMove, applyBoardMarkings]
  );

  const undoMove = useCallback(
    (doSetBoardMarkings = true) => {
      let undoResult = game.undo();
      if (!undoResult) return;

      setUrlParam("gameHistory", game.history().join(" ") || null);

      // Modify undo history accordingly
      gameUndoHistoryRef.current.unshift(undoResult.san);

      if (doSetBoardMarkings) applyBoardMarkings();

      // Ensure re-render
      setGameRender(gameRender + 1);
    },
    [game, gameRender, applyBoardMarkings]
  );

  const redoMove = useCallback(
    (doSetBoardMarkings = true) => {
      addMove(gameUndoHistoryRef.current[0], doSetBoardMarkings);
    },
    [addMove]
  );

  const setGlossaryTopic = useCallback((newGlossaryId) => {
    setGlossaryId(newGlossaryId);
    setUrlParam("glossaryId", newGlossaryId);
    setIsGlossaryMarginHidden(false);
  }, []);

  /*
   * Receives a string, array or object representing rich text content, to be converted into JSX.
   */
  const processDescriptionData = useCallback(
    (
      descriptionData,
      customDataHandlers,
      descriptionContext,
      doCatchIncompatibleData = true
    ) => {
      customDataHandlers = customDataHandlers ?? {};
      descriptionContext = descriptionContext ?? {};

      // Data is already valid JSX
      if (React.isValidElement(descriptionData)) return descriptionData;
      // Strings
      else if (typeof descriptionData === "string") {
        // Single-line strings require no formatting
        if (!descriptionData.includes("\n")) return descriptionData;

        const result = [];
        // Convert any line breaks into <br /> elements
        const lines = descriptionData.split("\n");
        for (const [lineIndex, line] of lines.entries()) {
          result.push(line);
          if (lineIndex < lines.length - 1) {
            if (line === "" && lineIndex > 0) {
              // Convert any newlines in a row after the first one into a custom-spaced separator rather than a line break
              result.push(<div style={{ height: "var(--spacing-medium)" }} />);
            } else result.push(<br />);
          }
        }

        return result;
      }
      // Arrays of rich description elements are handled recursively
      else if (Array.isArray(descriptionData)) {
        return descriptionData.map((elementData) =>
          processDescriptionData(
            elementData,
            customDataHandlers,
            descriptionContext,
            doCatchIncompatibleData
          )
        );
      }
      // Empty values are returned as-is
      else if ([null, undefined].includes(descriptionData))
        return descriptionData;
      // Numbers are returned as-is
      else if (typeof descriptionData === "number") return descriptionData;
      // Bools are returned as-is
      else if ([true, false].includes(descriptionData)) return descriptionData;
      // Data is assumed to be an object with a 'type' key from this point onwards
      // Custom data handlers are checked first
      else if (descriptionData["type"] in customDataHandlers) {
        return customDataHandlers[descriptionData["type"]](
          descriptionData,
          customDataHandlers,
          descriptionContext,
          doCatchIncompatibleData,
          processDescriptionData,
          {
            game,
            setMoves,
            glossaryId,
            setGlossaryTopic,
          }
        );
      }
      // Default handlers
      else if (descriptionData["type"] in descriptionDataHandlers) {
        return descriptionDataHandlers[descriptionData["type"]](
          descriptionData,
          customDataHandlers,
          descriptionContext,
          doCatchIncompatibleData,
          processDescriptionData,
          {
            game,
            setMoves,
            glossaryId,
            setGlossaryTopic,
          }
        );
      }
      // Fallback for unrecognised data
      else {
        return doCatchIncompatibleData ? (
          <span className="dev-error-icon">?</span>
        ) : (
          descriptionData
        );
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
        tryAddMove,
        setMoves,
        undoMove,
        redoMove,
        glossaryId,
        setGlossaryTopic,
        processDescriptionData,
        boardHighlights,
        boardArrows,
        isGlossaryMarginHidden,
        setIsGlossaryMarginHidden,
        isBoardFlipped,
        flipBoard,
      }}
    >
      {children}
    </ChessStudyContext.Provider>
  );
}

export function useChessStudyContext() {
  return useContext(ChessStudyContext);
}
