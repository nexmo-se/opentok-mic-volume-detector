# opentok-loudness-detector

This project shows how to implement a loudness detector using Opentok.js and AudioContext API (https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)
The loudness detector is usually used when you are speaking but you have muted your microphone. 

## Concepts

To create a loudness detector, we need to create an [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) on the selected microphone. 
It's good practice to active the loudness detector only if:

- the microphone is muted: if it's not the case, you don't need to detect the audio level. Or you can simply use [audioLevelUpdated](https://tokbox.com/developer/sdks/js/reference/Publisher.html#.event:audioLevelUpdated)
- the page is visible: if the page is not visible, there is no need to display the message.

## Run the project

Copy the config.examples.js file to config.js and set credentials (apikey, sessionId, token).
Then, open the `index.html` page, toggle the microphone and see the loudness detector in action. 


The toggleLoudnessDetector is activated on the toggleAudio function. In this case I can link the toggleLoudnessDetector function to the on('videoElementCreated') event. 

// TODO: test on Safari, test turnLoudnessDetectorOff
