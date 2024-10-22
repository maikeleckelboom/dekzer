
## Dekzer 🎛 🎚

### Key Components
- **Master Gain Fader**: Controls the overall output level for all connected decks. Range: -24dB to +24dB.
- **Deck Gain Fader(s)**: Controls the individual level for each deck. Range: -12dB to +12dB.
- **Decks**: There can be 2-4 decks, each with its own gain fader.
- **Connections**: Every deck is connected to the master gain, and all gain changes affect the final output before being sent to the hardware.

### Audio Flow Diagram
```md
[Deck 1 Source] 
      → [Deck 1 Gain (-12dB to +12dB)] 
      → [Deck 1 Gain (0-1)] 
      → [Deck 1 EQ Hi] 
      → [Deck 1 EQ Mid] 
      → [Deck 1 EQ Lo] 
      → [Deck 1 Panner] 
      → [Master Gain] 
      → [AudioContext.destination]
                 |
                 |→ [Deck 1 Analyser L]
                 |
                 |→ [Deck 1 Analyser R]

[Deck 2 Source] 
      → [Deck 2 Gain (-12dB to +12dB)] 
      → [Deck 2 Gain (0-1)] 
      → [Deck 2 EQ Hi] 
      → [Deck 2 EQ Mid] 
      → [Deck 2 EQ Lo] 
      → [Deck 2 Panner] 
      → [Master Gain] 
      → [AudioContext.destination]
                 |
                 |→ [Deck 2 Analyser L]
                 |
                 |→ [Deck 2 Analyser R]
```