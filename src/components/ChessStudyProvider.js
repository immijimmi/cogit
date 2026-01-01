import React, {
  useState,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { Chess } from "chess.js";
import moveInfo from "../data/moveInfo.json";
import descriptionDataHandlers from "../methods/descriptionDataHandlers";
import { getUrlParam, setUrlParam } from "../methods/url.js";

const getBoardMarkings = (movesSanList) => {
  let currentMoveData = moveInfo;

  for (const moveSan of movesSanList) {
    currentMoveData = currentMoveData[moveSan] ?? {};
  }

  return {
    board_highlights: currentMoveData["board_highlights"] ?? {},
    board_arrows: currentMoveData["board_arrows"] ?? [],
  };
};

const ChessStudyContext = createContext();

export function ChessStudyProvider({ children }) {
  const [game, setGame] = useState(() => {
    const result = new Chess();

    getUrlParam("gameHistory")
      ?.split(" ")
      .forEach((moveSan) => result.move(moveSan));
    return result;
  });

  const [glossaryId, setGlossaryId] = useState(() => getUrlParam("glossaryId"));

  const [boardHighlights, setBoardHighlights] = useState(
    () =>
      getBoardMarkings(getUrlParam("gameHistory")?.split(" ") || [])[
        "board_highlights"
      ]
  );
  const [boardArrows, setBoardArrows] = useState(
    () =>
      getBoardMarkings(getUrlParam("gameHistory")?.split(" ") || [])[
        "board_arrows"
      ]
  );

  const [gameRender, setGameRender] = useState(0); // Used to trigger a re-render after mutating the game state
  const [isGlossaryMarginHidden, setIsGlossaryMarginHidden] = useState(false);

  const gameUndoHistoryRef = useRef([]);

  const applyBoardMarkings = useCallback(() => {
    const boardMarkings = getBoardMarkings(game.history());

    setBoardHighlights(boardMarkings["board_highlights"]);
    setBoardArrows(boardMarkings["board_arrows"]);
  }, [game]);

  const setGlossaryTopic = useCallback((newGlossaryId) => {
    setGlossaryId(newGlossaryId);
    setUrlParam("glossaryId", newGlossaryId);
    setIsGlossaryMarginHidden(false);
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

  /*
   * Receives a string, array or object representing rich text content, to be converted into JSX.
   */
  const generateRichDescription = useCallback(
    (descriptionData, customDataHandlers, descriptionContext) => {
      customDataHandlers = customDataHandlers ?? {};
      descriptionContext = descriptionContext ?? {};

      // Simple text
      if (typeof descriptionData === "string") {
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
      // Numbers are converted into strings
      else if (typeof descriptionData === "number") {
        return descriptionData.toString();
      }
      // Arrays of rich description elements are handled recursively
      else if (Array.isArray(descriptionData)) {
        return descriptionData.map((elementData) =>
          generateRichDescription(
            elementData,
            customDataHandlers,
            descriptionContext
          )
        );
      }

      // Data is assumed to be an object with a 'type' key from this point onwards

      // Custom data handlers are checked first
      else if (descriptionData["type"] in customDataHandlers) {
        return customDataHandlers[descriptionData["type"]](
          descriptionData,
          customDataHandlers,
          descriptionContext,
          generateRichDescription,
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
          generateRichDescription,
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
        tryAddMove,
        setMoves,
        undoMove,
        redoMove,
        glossaryId,
        setGlossaryTopic,
        generateRichDescription,
        boardHighlights,
        boardArrows,
        isGlossaryMarginHidden,
        setIsGlossaryMarginHidden,
      }}
    >
      {children}
    </ChessStudyContext.Provider>
  );
}

export function useChessStudyContext() {
  return useContext(ChessStudyContext);
}
