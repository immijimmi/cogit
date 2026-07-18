const GET_STATUS_ENDPOINT = "/metadata";
const POST_EVENTS_ENDPOINT = "/user-events";

const INTERVAL_MS = 1000 * 0.5; // 0.5 seconds

const GET_ATTEMPT_COOLDOWN_MS = 1000 * 5; // 5 seconds
const GET_COOLDOWN_MS = 1000 * 60 * 10; // 10 minutes

const POST_ATTEMPT_COOLDOWN_MS = 1000 * 1.5; // 1.5 seconds
const POST_EVENTS_MAX = 100;

class FetchClient {
  static PAGE_LOADED_EPOCH = Date.now();

  // Value can be toggled externally to enable/disable queueing & sending requests
  static isEnabled = false;
  // The page's session ID, should be set using `initialize`
  static sessionId = null;
  // POST events should be added using `addEvent`
  static postEvents = [];

  // Event handler-specific variables
  static isMounted = false;
  static intervalId = null;

  static lastEventsPostAttemptEpoch = null;
  static isPostingEvents = false;

  static lastStatusGetAttemptEpoch = null;
  static lastStatusGetEpoch = null;
  static isGettingStatus = false;

  static async tryFetchBackend(endpoint, requestData = null) {
    if (!FetchClient.isEnabled) return false;

    requestData = requestData ?? undefined;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE}${endpoint}`,
        requestData,
      );

      if (response.status === 200) {
        return await response.json();
      } else if (response.status === 204) {
        return true;
      } else {
        throw new Error(`unexpected response status ${response.status}`);
      }
    } catch (err) {
      console.log("Request to backend failed:", err);
      return false;
    }
  }

  static async initialize(sessionId, callback = null, isEnabled = true) {
    if (!FetchClient.isMounted) {
      FetchClient.isMounted = true;

      FetchClient.sessionId = sessionId;
      FetchClient.isEnabled = isEnabled;

      FetchClient.intervalId = setInterval(
        FetchClient._onInterval,
        INTERVAL_MS,
      );

      if (callback) callback();
    }
  }

  static addEvent(event) {
    if (!FetchClient.isEnabled) return;

    while (FetchClient.postEvents.length >= POST_EVENTS_MAX) {
      FetchClient.postEvents.shift();
    }

    FetchClient.postEvents.push(event);
    FetchClient.attemptPostEvents();
  }

  // This should be run whenever the page has no temporary changes on display (which would be removed by a refresh)
  static async onFreshDisplay() {
    FetchClient._attemptGetStatus();
  }

  static async attemptPostEvents() {
    if (
      !FetchClient.isEnabled ||
      POST_EVENTS_ENDPOINT === undefined ||
      FetchClient.postEvents.length === 0 ||
      FetchClient.isPostingEvents
    )
      return;

    const nowMs = Date.now();

    const isAttemptedRecently =
      FetchClient.lastEventsPostAttemptEpoch !== null &&
      nowMs - FetchClient.lastEventsPostAttemptEpoch < POST_ATTEMPT_COOLDOWN_MS;

    if (!isAttemptedRecently) {
      FetchClient.isPostingEvents = true;
      FetchClient.lastEventsPostAttemptEpoch = nowMs;

      // Moving the events list to work with it, to prevent race conditions
      const events = FetchClient.postEvents;
      FetchClient.postEvents = [];

      const response = await FetchClient.tryFetchBackend(POST_EVENTS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: FetchClient.sessionId,
          events: events,
        }),
      });
      FetchClient.isPostingEvents = false;

      if (response) {
        console.log("Sent events to backend.");
      } else {
        FetchClient.postEvents = events.concat(FetchClient.postEvents);
      }
    }
  }

  static async _attemptGetStatus() {
    if (
      !FetchClient.isEnabled ||
      GET_STATUS_ENDPOINT === undefined ||
      FetchClient.isGettingStatus
    )
      return;

    const nowMs = Date.now();

    const isGottenRecently =
      FetchClient.lastStatusGetEpoch !== null &&
      nowMs - FetchClient.lastStatusGetEpoch < GET_COOLDOWN_MS;
    const isAttemptedRecently =
      FetchClient.lastStatusGetAttemptEpoch !== null &&
      nowMs - FetchClient.lastStatusGetAttemptEpoch < GET_ATTEMPT_COOLDOWN_MS;

    if (!isGottenRecently && !isAttemptedRecently) {
      FetchClient.isGettingStatus = true;
      FetchClient.lastStatusGetAttemptEpoch = nowMs;
      const status = await FetchClient.tryFetchBackend(GET_STATUS_ENDPOINT);
      FetchClient.isGettingStatus = false;

      if (status) {
        console.log("Received up-to-date status from backend.");
        FetchClient.lastStatusGetEpoch = nowMs;

        const updatedEpoch = new Date(status.data.updated).getTime();

        // Sense check to prevent perma-reloading if a future date is received
        if (updatedEpoch > nowMs) {
          console.log(
            "The 'updated' value received from the backend is in the future; disregarding.",
          );
          return;
        }

        if (updatedEpoch > FetchClient.PAGE_LOADED_EPOCH)
          window.location.reload();
      }
    }
  }

  static async _onInterval() {
    FetchClient.attemptPostEvents();
  }
}

export default FetchClient;
