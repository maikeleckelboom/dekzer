```txt
1. Main User Actions
   ├── createAndLoadTrack(file)
   ├── play()
   │   └── playAudioBufferSource(context, buffer, source)
   │       ├── schedulePlayback(context, source)
   │       │   └── startPlaybackPreSync(context, playbackStartTime)
   │       │       └── Recursive call to startPlaybackPreSync
   │       └── startPlaying()
   │           └── renderAnimationFrame()
   │               └── updateCurrentTime()
   ├── pause()
   ├── ejectTrack()
   │   └── resetDeck()
   └── onPlayPause(playing)

2. Internal Helper Functions
   ├── playAudioBufferSource(context, buffer, source)
   │   ├── schedulePlayback(context, source)
   │   │   └── startPlaybackPreSync(context, playbackStartTime)
   │   │       └── Recursive call to startPlaybackPreSync
   │   └── startPlaying()
   │       └── renderAnimationFrame()
   │           └── updateCurrentTime()
   ├── initializeAudioSourceNode(context, buffer)
   ├── setupAnalyser(context)
   ├── renderAnimationFrame()
   │   └── updateCurrentTime()
   └── resetDeck()
   ├── stopPlaying()
   │   └── Attempts to stop sourceNode and cancel rAF
   └── Disconnects and clears sourceNode and analyser nodes

```