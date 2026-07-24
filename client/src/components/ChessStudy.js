import React from "react";
import { ChessStudyProvider } from "./providers/ChessStudyProvider";
import ChessBoard from "./ChessBoard";
import ChessGlossary from "./ChessGlossary";
import ChessMovesCommentary from "./ChessMovesCommentary";
import ChessNextMoveOptions from "./ChessNextMoveOptions";
import ChessStudyMetaInfo from "./ChessStudyMetaInfo";
import "./ChessStudy.css";

function ChessStudy(props) {
  return (
    <div className="study-container" style={props.style}>
      <ChessStudyProvider>
        <div className="study-body">
          <div className="study-column secondary-subcolumn">
            <div className="study-segment chessboard-container">
              <ChessBoard />
            </div>
            <div className="study-segment nextmoves-container">
              <ChessNextMoveOptions />
            </div>
          </div>
          <div className="study-column main-subcolumn">
            <div className="study-segment commentary-container">
              <ChessMovesCommentary />
            </div>
            <div className="study-segment glossary-container">
              <ChessGlossary />
            </div>
          </div>
        </div>
        <div className="study-footer">
          <div className="study-column footer-column">
            <div className="study-segment meta-info-container">
              <ChessStudyMetaInfo />
            </div>
          </div>
        </div>
      </ChessStudyProvider>
    </div>
  );
}

export default ChessStudy;
