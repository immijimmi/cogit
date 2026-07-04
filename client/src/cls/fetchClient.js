const FETCH_ATTEMPT_COOLDOWN_MS = 1000 * 5; // 5 seconds
const FETCH_COOLDOWN_MS = 1000 * 60 * 10; // 10 minutes

const POST_ATTEMPT_COOLDOWN_MS = 1000 * 1.5; // 1.5 seconds

const INTERVAL_MS = 1000 * 0.5; // 0.5 seconds

class FetchClient {
  static PAGE_LOADED = new Date();

  // Value should be set by the provider which initialises the page's session ID
  static sessionId = null;

  static intervalId = null;

  static userEvents = [];
  static lastEventsPostAttempt = null;
  static isPostingEvents = false;

  static lastMetadataFetchAttempt = null;
  static lastMetadataFetch = null;
  static isFetchingMetadata = false;

  static async onChessStudyMounted() {
    if (FetchClient.intervalId === null) {
      FetchClient.intervalId = setInterval(
        FetchClient._onInterval,
        INTERVAL_MS
      );
    }
  }

  static async onChessGameRender() {
    FetchClient.attemptFetchMetadata();
  }

  static async attemptPostEvents() {
    if (FetchClient.userEvents.length === 0 || FetchClient.isPostingEvents)
      return;

    const isAttemptedRecently =
      FetchClient.lastEventsPostAttempt !== null &&
      new Date().getTime() - FetchClient.lastEventsPostAttempt.getTime() <
        POST_ATTEMPT_COOLDOWN_MS;

    if (!isAttemptedRecently) {
      FetchClient.isPostingEvents = true;
      FetchClient.lastEventsPostAttempt = new Date();

      // Moving the events list to work with it, to prevent race conditions
      const events = FetchClient.userEvents;
      FetchClient.userEvents = [];

      const response = await FetchClient._tryBackendGet("/user-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          events: events,
        }),
      });

      FetchClient.isPostingEvents = false;

      if (!response) {
        FetchClient.userEvents = events.concat(FetchClient.userEvents);
      }
    }
  }

  static async attemptFetchMetadata() {
    if (FetchClient.isFetchingMetadata) return;

    const isFetchedRecently =
      FetchClient.lastMetadataFetch !== null &&
      new Date().getTime() - FetchClient.lastMetadataFetch.getTime() <
        FETCH_COOLDOWN_MS;
    const isAttemptedRecently =
      FetchClient.lastMetadataFetchAttempt !== null &&
      new Date().getTime() - FetchClient.lastMetadataFetchAttempt.getTime() <
        FETCH_ATTEMPT_COOLDOWN_MS;

    if (!isFetchedRecently && !isAttemptedRecently) {
      FetchClient.isFetchingMetadata = true;
      FetchClient.lastMetadataFetchAttempt = new Date();
      const metadata = await FetchClient._tryBackendGet("/metadata");
      FetchClient.isFetchingMetadata = false;

      if (metadata) {
        console.log("Fetched up-to-date metadata from backend.");
        FetchClient.lastMetadataFetch = new Date();

        const updated = new Date(metadata.data.updated);
        if (updated > new Date()) {
          // Sense check to prevent perma-reloading if a future date is received
          console.log(
            "The 'updated' value received from the backend is in the future; disregarding."
          );
          return;
        }

        if (updated.getTime() > FetchClient.PAGE_LOADED.getTime())
          window.location.reload();
      }
    }
  }

  static async _onInterval() {
    FetchClient.attemptPostEvents();
  }

  static async _tryBackendGet(endpoint, requestData = null) {
    requestData = requestData ?? undefined;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE}${endpoint}`,
        requestData
      );

      if (response.status === 200) {
        return await response.json();
      } else {
        throw new Error(`unexpected response status ${response.status}`);
      }
    } catch (err) {
      console.log("Request to backend failed:", err);
      return false;
    }
  }
}

export default FetchClient;
