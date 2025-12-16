export const getUrlParam = (paramId) =>
  new URLSearchParams(window.location.search).get(paramId);

export const setUrlParam = (paramId, value) => {
  const params = new URLSearchParams(window.location.search);
  if (value === null) {
    params.delete(paramId);
  } else {
    params.set(paramId, value);
  }

  const isRemainingParams = Boolean(params.toString());
  window.history.replaceState(
    null,
    "",
    window.location.pathname +
      (isRemainingParams ? "?" + params.toString() : "")
  );
};
