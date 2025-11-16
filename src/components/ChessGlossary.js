import React, { useMemo, useRef, useEffect } from "react";
import { useChessStudyContext } from "./ChessStudyProvider";
import glossary from "../data/glossary.json";
import "./ChessGlossary.css";

function ChessGlossary() {
  const { glossaryId, setGlossaryId, generateRichDescription } =
    useChessStudyContext();

  // Scroll to the top of the glossary entry each time the rendered entry changes
  // Added to fix an intermittent bug in which a newly rendered entry is already partially scrolled down
  const descriptionBox = useRef(null);
  useEffect(() => descriptionBox.current.scrollTo({ top: 0 }), [glossaryId]);

  const orderedTitles = useMemo(() => {
    const result = [];
    for (const currentId of Object.keys(glossary).sort()) {
      result.push([glossary[currentId]["title"] ?? currentId, currentId]);
    }
    return result;
  });

  // Generate JSX for clickable titles
  const marginTitles = [];

  for (const [currentTitle, currentId] of orderedTitles) {
    marginTitles.push(
      <div
        className={
          "clickable-text glossary-margin-title" +
          (glossaryId == currentId ? " glossary-margin-title-selected" : "")
        }
        onMouseDown={() => setGlossaryId(currentId)}
      >
        {currentTitle}
      </div>
    );
  }

  // Convert glossary entry data into JSX elements
  let descriptionJsx;
  let entryData = glossary[glossaryId] ?? {};

  // No glossary entry selected
  if (glossaryId === null) {
    descriptionJsx = (
      <div className="faint-text">
        <i>Select a topic from the margin to the left.</i>
      </div>
    );
  }
  // No description found for glossary entry
  else if (!("description" in entryData)) {
    descriptionJsx = (
      <div className="faint-text">
        <i>No information found for this entry.</i>
      </div>
    );
  }
  // Glossary entry has a description
  else {
    descriptionJsx = generateRichDescription(entryData["description"]);
  }

  return (
    <div
      style={{
        maxHeight: "350px",
        display: "flex",
      }}
    >
      <div
        className="y-scrollbar"
        style={{
          minWidth: "180px",
          maxWidth: "180px",
          borderRight:
            "var(--border-width-small) solid color-mix(in srgb, var(--glossary-accent-color) 100%, var(--translucent-mixin))",
        }}
      >
        {marginTitles}
      </div>
      <div
        style={{
          display: "flex",
          flex: "1",
          padding: "var(--spacing-medium)",
        }}
      >
        <div ref={descriptionBox} className="y-scrollbar">
          {descriptionJsx}
        </div>
      </div>
    </div>
  );
}

export default ChessGlossary;
