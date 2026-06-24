import React from "react";
import { useChessStudyContext } from "./providers/ChessStudyProvider";

function ChessStudyMetaInfo() {
  const { setGlossaryTopic } = useChessStudyContext();

  return (
    <div
      style={{
        minHeight: "24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="minor-text">
        <span
          title="Topic: Welcome"
          className="minor-clickable-text"
          onClick={() => setGlossaryTopic("welcome")}
        >
          {"What is all this?"}
        </span>
        <span style={{ whiteSpace: "pre" }}>{"  •  "}</span>
        <span
          title="Topic: Contact"
          className="minor-clickable-text"
          onClick={() => setGlossaryTopic("contact")}
        >
          {"Contact"}
        </span>
        <span style={{ whiteSpace: "pre" }}>{"  •  "}</span>
        {"© 2025 Imran Hamid"}
      </div>
    </div>
  );
}

export default ChessStudyMetaInfo;
