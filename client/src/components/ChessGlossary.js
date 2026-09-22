import React, { useMemo, useRef, useEffect } from "react";
import { useChessStudyContext } from "./providers/ChessStudyProvider";
import { generateRecencyTag } from "../methods/data";
import { GLOSSARY } from "../data/aggregates";
import { ReactComponent as UnhideIcon } from "../res/Right Triangle (Faint).svg";
import { ReactComponent as HideIcon } from "../res/Left Triangle (Faint).svg";
import { ReactComponent as CloseIcon } from "../res/X (Faint).svg";
import { GLOSSARY_CATEGORY_LOOKUP } from "../constants";
import "./ChessGlossary.css";

const INNER_RADIUS_CALC =
  "calc(var(--border-radius-large) - var(--border-width-small))";

function ChessGlossary() {
  const {
    glossaryId,
    setGlossaryTopic,
    processDescriptionData,
    isGlossaryMarginHidden,
    setIsGlossaryMarginHidden,
  } = useChessStudyContext();

  const containerRef = useRef(null);
  useEffect(() => {
    if (!glossaryId) return;

    containerRef?.current?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [glossaryId]);

  const marginRef = useRef(null);
  const selectedTitleRef = useRef(null);
  useEffect(() => {
    if (!selectedTitleRef?.current) return;

    marginRef?.current?.scrollTo({
      top: selectedTitleRef.current.offsetTop,
      behavior: "smooth",
    });
  }, [glossaryId, isGlossaryMarginHidden]);

  /*
   * Scroll the glossary entry to its start (instantly) each time it changes.
   * Added to fix an intermittent bug in which a newly rendered entry is already partially scrolled down
   */
  const descriptionRef = useRef(null);
  useEffect(() => {
    descriptionRef?.current?.scrollTo({ top: 0 });
  }, [glossaryId]);

  /*
   * Organise margin titles by category and order.
   * Glossary entries with no order or `null` order are 'hidden', i.e. not listed in the margin
   */
  const orderedTitles = useMemo(() => {
    const result = [];
    for (const categoryId in GLOSSARY_CATEGORY_LOOKUP) {
      result[categoryId] = [];
    }

    const sortedGlossaryKeys = Object.keys(GLOSSARY)
      .filter((glossaryId) => GLOSSARY[glossaryId]["order"] != null)
      .sort((firstId, secondId) => {
        return GLOSSARY[firstId]["order"] - GLOSSARY[secondId]["order"];
      });
    for (const currentId of sortedGlossaryKeys) {
      const topicData = GLOSSARY[currentId];

      const topicCategoryId = Math.floor(topicData["order"]);
      const categoryArray = result[topicCategoryId];
      const recencyTagJsx = generateRecencyTag(topicData);

      categoryArray.push([
        topicData["title"] ?? currentId,
        currentId,
        recencyTagJsx,
      ]);
    }

    return result;
  }, []);

  const marginElements = [];

  for (const [categoryId, categoryArray] of orderedTitles.entries()) {
    marginElements.push(
      <div
        key={`glossary_title_category_${categoryId}`}
        className="mini-header"
      >
        {GLOSSARY_CATEGORY_LOOKUP[categoryId]}
      </div>,
    );

    for (const [currentTitle, currentId, recencyTagJsx] of categoryArray) {
      const isSelectedTitle = glossaryId === currentId;

      marginElements.push(
        <div
          key={`glossary_title_${currentId}`}
          className={
            "clickable-box left-aligned-row" +
            (isSelectedTitle
              ? " glossary-margin-title-selected"
              : " glossary-margin-title")
          }
          {...(isSelectedTitle
            ? { ref: selectedTitleRef }
            : {
                onMouseDown: (event) =>
                  event.button === 0 && setGlossaryTopic(currentId),
              })}
        >
          {currentTitle}
          {recencyTagJsx && !isSelectedTitle ? (
            <div className="glow-dot" />
          ) : null}
        </div>,
      );
    }
  }

  let descriptionJsx;
  const entryData = GLOSSARY[glossaryId] ?? {};
  const entryRecencyTagJsx = generateRecencyTag(entryData);

  if (glossaryId === null) {
    descriptionJsx = (
      <div className="minor-text">
        <i>Select a topic from the margin to the left.</i>
      </div>
    );
  } else if (!("description" in entryData)) {
    descriptionJsx = (
      <div className="minor-text">
        <i>No information found for this entry.</i>
      </div>
    );
  } else {
    descriptionJsx = processDescriptionData(entryData["description"]);
  }

  return (
    <div
      ref={containerRef}
      style={{
        maxHeight: "375px",
        display: "flex",
      }}
    >
      {/* Margin */}
      {isGlossaryMarginHidden ? null : (
        <div
          ref={marginRef}
          className="y-scrollbar"
          style={{
            minWidth: "152px",
            maxWidth: "152px",
            borderRight:
              "var(--border-width-small) solid color-mix(in srgb, var(--glossary-accent-color) 100%, var(--translucent-mixin))",
            borderRadius: `${INNER_RADIUS_CALC} 0 0 ${INNER_RADIUS_CALC}`,
          }}
        >
          {marginElements}
        </div>
      )}
      {/* Main Section */}
      <div
        style={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {/* Header Bar */}
        {
          <div
            style={{
              height: "var(--line-height-medium-large)",

              display: "flex",
              justifyContent: "space-between",

              borderBottom:
                "var(--border-width-small) solid var(--light-shade-color)",
            }}
          >
            {/* Left side of header bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "left",
              }}
            >
              {/* Toggle Glossary Margin Button */}
              <div
                title="Toggle Margin"
                onMouseDown={(event) =>
                  event.button === 0 &&
                  setIsGlossaryMarginHidden(!isGlossaryMarginHidden)
                }
                className="clickable-box centred-content"
                style={{
                  height: "100%",
                  aspectRatio: "1 / 1",
                  userSelect: "none",

                  ...(isGlossaryMarginHidden && {
                    borderRadius: `${INNER_RADIUS_CALC} 0 0 0`,
                  }),
                }}
              >
                {isGlossaryMarginHidden ? (
                  <UnhideIcon
                    style={{
                      height: "var(--inline-icon-height-very-small)",
                      width: "var(--inline-icon-height-very-small)",

                      marginLeft: "2px",
                    }}
                  />
                ) : (
                  <HideIcon
                    style={{
                      height: "var(--inline-icon-height-very-small)",
                      width: "var(--inline-icon-height-very-small)",

                      marginLeft: "-2px",
                    }}
                  />
                )}
              </div>
            </div>
            {/* Centre of header bar */}
            <div
              style={{
                flex: "1 1 auto",
              }}
            >
              {glossaryId && (
                <div
                  className="section-header-2 centred-content"
                  style={{
                    lineHeight: "var(--line-height-medium-large)",
                  }}
                >
                  {entryData["title"] ?? glossaryId}
                  {entryRecencyTagJsx}
                </div>
              )}
            </div>
            {/* Right side of header bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "right",
              }}
            >
              {/* Clear Glossary ID Button */}
              {glossaryId === null ? null : (
                <div
                  className="clickable-box centred-content"
                  style={{
                    height: "100%",
                    aspectRatio: "1 / 1",
                    userSelect: "none",
                    borderRadius: `0 ${INNER_RADIUS_CALC} 0 0`,
                  }}
                  onMouseDown={(event) =>
                    event.button === 0 && setGlossaryTopic(null)
                  }
                >
                  <CloseIcon
                    style={{
                      height: "var(--inline-icon-height-very-small)",
                      width: "var(--inline-icon-height-very-small)",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        }
        {/* Description Box */}
        <div
          style={{
            display: "flex",
            /*
             * Ensures that this flex item shrinks to fit the available space and the scrollbar appears correctly.
             * Necessitated by the fixed height sibling
             */
            minHeight: "0",

            padding: "var(--spacing-medium)",
          }}
        >
          <div
            ref={descriptionRef}
            className="y-scrollbar"
            style={{ padding: "var(--glossary-section-padding)" }}
          >
            {descriptionJsx}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChessGlossary;
