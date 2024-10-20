# Nuxt TypeScript Project: Audio Processing

I am working in a bleeding-edge Nuxt TypeScript project. The requirements are:

1. **Master Gain Fader**: Controls master gain from -24dB to +24dB.
2. **Deck Gain Fader**: Controls the gain of the deck from -12dB to +12dB.

There is always one master that is always connected, and there can be 2-4 decks.

I will provide an image with a diagram to show what I mean.

## Audio Flow Logic

To implement the audio flow logic in your Nuxt TypeScript project, we'll need to structure the system based on the diagram provided.

### Key Components
- **Master Gain Fader**: Controls the overall output level for all connected decks. Range: -24dB to +24dB.
- **Deck Gain Fader(s)**: Controls the individual level for each deck. Range: -12dB to +12dB.
- **Decks**: There can be 2-4 decks, each with its own gain fader.
- **Connections**: Every deck is connected to the master gain, and all gain changes affect the final output before being sent to the hardware.

### Structure
Since you are using TypeScript and Nuxt, you'll want to create reusable components for the gain faders and connect them through shared state or composable logic. Here's how I suggest organizing the code:

#### 1. Deck Component
Each deck will have its own gain control and connect to the master gain.

```vue
// components/DeckFader.vue
<template>
  <div>
    <label>{{ deckName }} Gain: {{ deckGain }} dB</label>
    <input type="range" v-model="deckGain" :min="-12" :max="12" step="0.1" @input="updateDeckGain"/>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    deckName: {
      type: String,
      required: true
    },
    onGainChange: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const deckGain = ref(0);

    const updateDeckGain = () => {
      props.onGainChange(deckGain.value);
    };

    return {
      deckGain,
      updateDeckGain
    };
  }
});
</script>
```
## Web Audio API Gain Nodes Implementation

### Key Considerations
Gain Ranges: Ensure proper handling of decibel scaling when computing the final output. Decibel (dB) changes are logarithmic, so you may need to scale these values appropriately when passing them to an audio API.
Deck Count: You can adjust the number of decks dynamically by modifying deckGains to accommodate more than two decks, based on your requirements.
Audio Processing: If you're using an audio processing library (like Web Audio API), you'll need to integrate the gain values into the audio nodes within the relevant components.
Web Audio API Gain Nodes Implementation

To implement audio processing using the Web Audio API with gain nodes, we will focus on connecting the gain nodes for both individual decks and the master output. The general approach involves creating a Web Audio AudioContext, using GainNode to manage volume levels, and connecting everything as per the diagram provided.

### Steps to Implement Gain Nodes
1. Create the AudioContext: This is the foundation for all Web Audio API operations.
2. Create Gain Nodes: Gain nodes for each deck and a master gain node to control the overall output.
3. Connect Audio Sources: Each deck will have its audio source, which will be connected to its respective gain node.
4. Apply Gain Changes: When the faders are moved, the gain values in the nodes should be updated in real time.
5. Route to Output: The final master gain node will route the mixed audio output to the destination (usually the system speakers or output device).