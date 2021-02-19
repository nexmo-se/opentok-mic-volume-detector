# opentok-get-stats



## Run the project

Set the credentials on the `app.js` file (apikey, sessionId, token). Then, open the `index.html` page and click the `Run Stats` button.


```
toggleLoudnessDetector: ({ state, dispatch }) => {
    if (state.isAudioEnabled) {
      dispatch('loudnessDetector/turnLoudnessDetectorOff');
      dispatch('subscribePublisherAudioLevelUpdated');
    } else {
      dispatch('loudnessDetector/turnLoudnessDetectorOn', {
        selectedMicrophoneId: state.selectedMicrophoneId,
        isAudioEnabled: state.isAudioEnabled
      });
      if (MeetingManager.publisher) {
        MeetingManager.publisher.off('audioLevelUpdated');
      }
    }
  },
```

The idea is that if the mic is enabled, the loudness detector needs to be switched off. If the mic is disabled, I activate the loudnessDetector/turnLoudnessDetectorOn.

The toggleLoudnessDetector is activated on the toggleAudio function. In this case I can link the toggleLoudnessDetector function to the on('videoElementCreated') event. 