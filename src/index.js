import credentials from "../config";
import OT from "@opentok/client";
import turnLoudnessDetectorOn from "./micAudioLevel";

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

function toggleLoudnessDetector ({stream}) {
  if (stream.hasAudio()) {
    // disable Loudness detector
  } else {
    // activate Loudness detector
  }
}

function initializeSession({ apiKey, sessionId, token }) {
  const session = OT.initSession(apiKey, sessionId, {});
  const publisher = OT.initPublisher("publisher");

  publisher.on("videoElementCreated", (event) => {
    console.log("videoElementCreated", event);
  });

  session.on("streamCreated", function streamCreated(event) {
    var subscriberOptions = {
      insertMode: "append",
      width: "100%",
      height: "100%",
    };
    session.subscribe(
      event.stream,
      "subscriber",
      subscriberOptions,
      handleError
    );
  });

  session.on("sessionDisconnected", function sessionDisconnected(event) {
    console.log("You were disconnected from the session.", event.reason);
  });

  // Connect to the session
  session.connect(token, async function callback(error) {
    if (error) {
      handleError(error);
    } else {
      // If the connection is successful, publish the publisher to the session
      console.log("Connected", publisher);
      session.publish(publisher, handleError);
    }
  });
}

if (
  credentials &&
  credentials.apiKey &&
  credentials.sessionId &&
  credentials.token
) {
  initializeSession({
    apiKey: credentials.apiKey,
    sessionId: credentials.sessionId,
    token: credentials.token,
  });
} else {
  console.log("Error - Credentials not valid");
}
