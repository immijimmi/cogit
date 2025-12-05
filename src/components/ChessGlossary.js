import React, { useMemo, useRef, useEffect } from "react";
import { useChessStudyContext } from "./ChessStudyProvider";
import glossary from "../data/glossary.json";
import "./ChessGlossary.css";

const GLOSSARY_DIFFICULTY_LOOKUP = {
  0: "Definitions",
  1: "Beginner",
  2: "Novice",
  3: "Intermediate",
};

function ChessGlossary() {
  const { glossaryId, setGlossaryTopic, generateRichDescription } =
    useChessStudyContext();

  // Scroll to the top of the glossary entry each time the rendered entry changes
  // Added to fix an intermittent bug in which a newly rendered entry is already partially scrolled down
  const descriptionBoxRef = useRef(null);
  useEffect(() => descriptionBoxRef.current.scrollTo({ top: 0 }), [glossaryId]);

  const orderedTitles = useMemo(() => {
    const result = [];
    for (const difficultyId in GLOSSARY_DIFFICULTY_LOOKUP) {
      result[difficultyId] = [];
    }

    // Categorizes titles by broad difficulty level, and orders them granularly within those categories
    const sortedGlossaryKeys = Object.keys(glossary).sort(
        (firstId, secondId) => {
            return glossary[firstId]["difficulty"] - glossary[secondId]["difficulty"];
        }
    );
    for (const currentId of sortedGlossaryKeys) {
      const topicData = glossary[currentId];
      const topicDifficultyCategory = Math.floor(topicData["difficulty"]);
      const categoryArray = result[topicDifficultyCategory];

      categoryArray.push([
        topicData["title"] ?? currentId,
        currentId,
      ]);
    }

    return result;
  });

  // Generate JSX for clickable titles, and their respective difficulty section headers
  const marginTitles = [];

  // Difficulty section header
  for (const [difficultyId, difficultyArray] of orderedTitles.entries()) {
    marginTitles.push(
      <div className="mini-header">
        {GLOSSARY_DIFFICULTY_LOOKUP[difficultyId]}
      </div>
    );

    // Titles for this difficulty section
    for (const [index, [currentTitle, currentId]] of difficultyArray.entries()) {
      const isLastMarginItem = (
        difficultyId == orderedTitles.length - 1 &&
        index == difficultyArray.length - 1
      );

      marginTitles.push(
        <div
          className={
            "clickable glossary-margin-title" +
            (glossaryId == currentId ? " glossary-margin-title-selected" : "")
          }
          style={
            // Custom, to be flush with the (6px radius) border of the container
            isLastMarginItem ? { borderRadius: "0 0 0 4px" } : {}
          }
          onMouseDown={() => setGlossaryTopic(currentId)}
        >
          {currentTitle}
        </div>
      );
    }
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
        maxHeight: "360px",
        display: "flex",
      }}
    >
      {/* Margin */}
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
      {/* Main Section */}
      <div
        style={{
          display: "flex",
          flex: "1", // Fill the remaining width in the glossary segment
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {/* Header Bar */}
        {
          glossaryId === null ? null :
          <div
            style={{
              display: "flex",
              flex: "0 0 auto", // Size height exactly to content
              justifyContent: "left",

              borderBottom:
                "var(--border-width-small) solid var(--light-shade-color)",
            }}
          >
            <div
              className="faint-text clickable centred-content"
              style={{
                width: "24px",
                height: "24px",
              }}
              onMouseDown={() => setGlossaryTopic(null)}
            >
              ✖
            </div>
          </div>
        }
        {/* Description Box */}
        <div
          style={{
            display: "flex",
            flex: "1",
            // Ensures this flex item can shrink to the available space so the scrollbar appears correctly
            // Necessitated by the fixed height sibling
            minHeight: "0",

            padding: "var(--spacing-medium)",
          }}
        >
          <div ref={descriptionBoxRef} className="y-scrollbar">
            {descriptionJsx}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChessGlossary;
