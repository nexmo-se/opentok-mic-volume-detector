let detectLoudnessTimer = -1;
let turnMuteIndicationOffTimer = -1;
let muteIndication = false;
const loudnessDetector = {};
const AUTO_HIDE_MUTE_INDICATION_POPUP_DELAY = 5 * 1000;

export default {
  turnMuteIndicationOff: () => {
    // User clicked the 'x' button, don't show mute indication anymore
    clearTimeout(detectLoudnessTimer);
    clearTimeout(turnMuteIndicationOffTimer);
    turnMuteIndicationOffTimer = -1;
    muteIndication = false;
  },

  showLoudnessDetector: () => {
    if (muteIndication) {
      document.getElementById("audio-loudness-detector").innerHTML =
        "You are Speaking but you are muted";
    } else {
      document.getElementById("audio-loudness-detector").innerHTML =
        "Loudness detector disbled";
    }
  },
  turnLoudnessDetectorOn: async function ({
    selectedMicrophoneId,
    isAudioEnabled,
  }) {
    try {
      // Create Audio Context from Mic
      console.log("Create loudness Detector");
      loudnessDetector.audioContext = new AudioContext();
      loudnessDetector.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedMicrophoneId,
        },
      });

      loudnessDetector.source = loudnessDetector.audioContext.createMediaStreamSource(
        loudnessDetector.stream
      );
      loudnessDetector.analyser = loudnessDetector.audioContext.createAnalyser();

      loudnessDetector.source.connect(loudnessDetector.analyser);

      // https://developer.mozilla.org/en-US/docs/Web/API/AudioNode
      loudnessDetector.analyser.fftSize = 2048;
      const bufferLength = loudnessDetector.analyser.fftSize;
      const timeDomainData = new Uint8Array(bufferLength);

      const detectLoudness = () => {
        // Keep running only if audio is not enabled and we have a valid analyser
        if (isAudioEnabled || !loudnessDetector.analyser) {
          return;
        }
        console.log("detectLoudness - start - ", muteIndication);
        // Only process the audio if the tab is visible and the popup was not recently dismissed
        if (document.visibilityState === "visible") {
          loudnessDetector.analyser.getByteTimeDomainData(timeDomainData);

          let max = 0;
          for (let index = timeDomainData.length - 1; index >= 0; index -= 1) {
            max = Math.max(max, Math.abs(timeDomainData[index] - 128));
          }
          const loudness = max / 128;
          // 0.2 is a magical number, it can't be calculated. it was achieved by trial and error.
          if (loudness > 0.2) {
            // If we are just now turning on the mute indication, set a timer to turn it off
            // in AUTO_HIDE_MUTE_INDICATION_POPUP_DELAY seconds
            if (!muteIndication && turnMuteIndicationOffTimer === -1) {
              // turnLoudnessDetectorOff();
              muteIndication = true;
              this.showLoudnessDetector();
              console.log("You are speaking but you are muted!");
              turnMuteIndicationOffTimer = setTimeout(() => {
                // dispatch("turnMuteIndicationOff"); // turn it off and then toggle
                this.turnMuteIndicationOff();
                this.showLoudnessDetector();
                console.log("Auto hide speaking popup");
              }, AUTO_HIDE_MUTE_INDICATION_POPUP_DELAY);
            }
          }
        }

        detectLoudnessTimer = setTimeout(detectLoudness, 200);
      };

      detectLoudness();
    } catch (e) {
      // An error has occured, we don't want to bother the user, the only affect
      // is, the user won't see the mute indication
    }
  },

  turnLoudnessDetectorOff: () => {
    // Check if we have a valid loudnessDetector object before destroying it
    if (loudnessDetector.analyser) {
      loudnessDetector.analyser.disconnect();
      loudnessDetector.source.disconnect();
      loudnessDetector.stream.getTracks().forEach((track) => track.stop());
      loudnessDetector.audioContext.close();
      loudnessDetector.analyser = null;
      loudnessDetector.source = null;
      loudnessDetector.stream = null;
      loudnessDetector.audioContext = null;
      turnMuteIndicationOff();
    }
  },
};
