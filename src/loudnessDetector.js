let detectLoudnessTimer = -1;
let turnMuteIndicationOffTimer = -1;
let muteIndication = false;
const loudnessDetector = {};
const AUTO_HIDE_MUTE_INDICATION_POPUP_DELAY = 5 * 1000;

export default {
  /**
   * This function turns the muted indication off and clear the timeouts.
   */
  turnMuteIndicationOff: function () {
    clearTimeout(detectLoudnessTimer);
    clearTimeout(turnMuteIndicationOffTimer);
    turnMuteIndicationOffTimer = -1;
    muteIndication = false;
    this.toggleLoudnessDetector();
  },

  /**
   * This is a simple function to show on the html if you are speaking or not.
   */
  toggleLoudnessDetector: () => {
    if (muteIndication) {
      document.getElementById("audio-loudness-detector").innerHTML =
        "You are Speaking but you are muted";
    } else {
      document.getElementById("audio-loudness-detector").innerHTML =
        "Loudness detector disabled";
    }
  },
  turnLoudnessDetectorOn: async function ({
    selectedMicrophoneId,
    isAudioEnabled,
  }) {
    try {
      // Create Audio Context from Mic  https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
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

      // https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createAnalyser
      loudnessDetector.analyser.fftSize = 2048;
      const bufferLength = loudnessDetector.analyser.fftSize;
      const timeDomainData = new Uint8Array(bufferLength);

      const detectLoudness = () => {
        // Keep running only if audio is not enabled and we have a valid analyser
        if (isAudioEnabled || !loudnessDetector.analyser) {
          return;
        }
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
              this.turnLoudnessDetectorOff();
              turnMuteIndicationOffTimer = setTimeout(() => {
                // turn off the mute indicator and toggle the loudnessDetector
                this.turnMuteIndicationOff();
                this.turnLoudnessDetectorOn({
                  selectedMicrophoneId,
                  isAudioEnabled,
                });
              }, AUTO_HIDE_MUTE_INDICATION_POPUP_DELAY);
              // turn loudness indicator ON
              muteIndication = true;
              this.toggleLoudnessDetector();
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

  turnLoudnessDetectorOff: function () {
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
    }
    this.turnMuteIndicationOff();
  },
};
