/*
 * Standardises data requirements and formatting for certain parameters which should be treated the same across all handlers.
 * Parameters must still be processed individually as description data before they are passed into this method
 */
export function validateParam(param, param_type) {
  switch (param_type) {
    case "punctuation":
      return typeof param === "string" ? [null, param] : param;
    case "url":
      if (param === undefined)
        throw new Error("Missing URL parameter in description data");
      return param;
    default:
      throw new Error(
        `Unable to format description data parameter (invalid key): ${param_type}`,
      );
  }
}
