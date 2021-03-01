# opentok-loudness-detector

This project shows how to implement a loudness detector using Opentok.js and AudioContext API (https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)
The loudness detector is usually used when you are speaking but you have muted your microphone. 

## Concepts

To create a loudness detector, we need to create an [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) on the selected microphone. 
It's good practice to active the loudness detector only if:

- the microphone is muted: if it's not the case, you don't need to detect the audio level. Or you can simply use [audioLevelUpdated](https://tokbox.com/developer/sdks/js/reference/Publisher.html#.event:audioLevelUpdated)
- the page is visible: if the page is not visible, there is no need to display the message.

## Code

`src/index.js`

The index file handles the main actions such as connecting and publishing to the session. 

The session listener on `streamPropertyChanged` toggle the loudness detector based on the `stream.hasAudio` value. If the stream is muted, we need to activate the loudness detector calling:

```
turnLoudnessDetector.turnLoudnessDetectorOn({
    selectedMicrophoneId: publisher.getAudioSource().id,
    isAudioEnabled: publisher.stream.hasAudio,
});
```

If the stream has audio enabled, we need to disable the loudness detector: 

```
if (publisher.stream.hasAudio) {
    turnLoudnessDetector.turnLoudnessDetectorOff();
}
```

`src/loudnessDetector.js`

The loudness detector file is composed by four main functions: `turnMuteIndicationOff`, `toggleLoudnessDetector`, `turnLoudnessDetectorOn` and `turnLoudnessDetectorOff`.

The `turnMuteIndicationOff` clears the timeouts and the mute indicator message on the UI. The `toggleLoudnessDetector` is used to show/hide the correct state of the loudness detector

The `turnLoudnessDetectorOn` creates the `AudioContext` for the loudness detector using the `selectedMicrophone`. Based on that, it creates an analyser to detect the loudness of the microphone. If a certain threshold is detected, we stop the detector and we show the message in the UI. After a certain amount of time (AUTO_HIDE_MUTE_INDICATION_POPUP_DELAY), we hide the UI message and start again the loudness detector.

The `turnLoudnessDetectorOff` destroys the audioContext and analyser created previously and restore the initial state.


## Run the project

1. Copy the config.examples.js file to config.js and set credentials (apikey, sessionId, token).
2. Run `npm install`
3. Run `npm start`
4. Toggle the microphone and see the loudness detector in action.
   

