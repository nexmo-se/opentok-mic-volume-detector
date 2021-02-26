import credentials from "../config";
import OT from "@opentok/client";
import turnLoudnessDetector from "./micAudioLevel";

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

function toggleMicElement(active) {
  console.log("toggleMicAudio", active);
  document.getElementById("audio-muted-mic").innerHTML = active
    ? "Microphone Active"
    : "Microphone Muted";
}

/**
 * T
 * @param {*} param0 
 */
function toggleLoudnessDetector({ publisher }) {
  if (publisher.stream.hasAudio) {
    // disable Loudness detector
    turnLoudnessDetector.turnLoudnessDetectorOff();
  } else {
    // activate Loudness detector
    console.log("toggleLoudnessDetector");
    turnLoudnessDetector.turnLoudnessDetectorOn({
      selectedMicrophoneId: publisher.getAudioSource().id,
      isAudioEnabled: false,
    });
  }
}

function initializeSession({ apiKey, sessionId, token }) {
  const session = OT.initSession(apiKey, sessionId, {});
  const publisher = OT.initPublisher("publisher");
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

  session.on("streamPropertyChanged", function streamPropertyChanged(event) {
    if (event.stream && event.stream.id === publisher.stream.id) {
      toggleLoudnessDetector({ publisher });
    }
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

  document.getElementById("mute-audio").addEventListener("click", (event) => {
    if (publisher && publisher.stream) {
      const audioState = !publisher.stream.hasAudio;
      publisher.publishAudio(audioState);
      toggleMicElement(audioState);
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
