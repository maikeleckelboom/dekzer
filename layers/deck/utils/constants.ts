export const MusicalKeysMap = new Map([
  // Major Keys
  ["C", { label: "C Major", color: "#FF0000" }],     // Red
  ["C#", { label: "C♯ Major", color: "#FF4000" }],   // Orange-Red
  ["Db", { label: "D♭ Major", color: "#FF4000" }],   // Same as C♯
  ["D", { label: "D Major", color: "#FF8000" }],     // Orange
  ["D#", { label: "D♯ Major", color: "#FFBF00" }],   // Yellow-Orange
  ["Eb", { label: "E♭ Major", color: "#FFBF00" }],   // Same as D♯
  ["E", { label: "E Major", color: "#FFFF00" }],     // Yellow
  ["F", { label: "F Major", color: "#BFFF00" }],     // Yellow-Green
  ["F#", { label: "F♯ Major", color: "#80FF00" }],   // Green
  ["Gb", { label: "G♭ Major", color: "#80FF00" }],   // Same as F♯
  ["G", { label: "G Major", color: "#00FF00" }],     // Bright Green
  ["G#", { label: "G♯ Major", color: "#00FF80" }],   // Aqua-Green
  ["Ab", { label: "A♭ Major", color: "#00FF80" }],   // Same as G♯
  ["A", { label: "A Major", color: "#00FFFF" }],     // Cyan
  ["A#", { label: "A♯ Major", color: "#00BFFF" }],   // Sky Blue
  ["Bb", { label: "B♭ Major", color: "#00BFFF" }],   // Same as A♯
  ["B", { label: "B Major", color: "#0080FF" }],     // Blue

  // Minor Keys
  ["Cm", { label: "C Minor", color: "#8000FF" }],    // Purple
  ["C#m", { label: "C♯ Minor", color: "#BF00FF" }],  // Violet
  ["Dbm", { label: "D♭ Minor", color: "#BF00FF" }],  // Same as C♯m
  ["Dm", { label: "D Minor", color: "#FF00FF" }],    // Magenta
  ["D#m", { label: "D♯ Minor", color: "#FF0080" }],  // Pink
  ["Ebm", { label: "E♭ Minor", color: "#FF0080" }],  // Same as D♯m
  ["Em", { label: "E Minor", color: "#FF0040" }],    // Deep Red
  ["Fm", { label: "F Minor", color: "#800000" }],    // Dark Red
  ["F#m", { label: "F♯ Minor", color: "#BF4000" }],  // Dark Orange
  ["Gbm", { label: "G♭ Minor", color: "#BF4000" }],  // Same as F♯m
  ["Gm", { label: "G Minor", color: "#808000" }],    // Olive Green
  ["G#m", { label: "G♯ Minor", color: "#408080" }],  // Teal
  ["Abm", { label: "A♭ Minor", color: "#408080" }],  // Same as G♯m
  ["Am", { label: "A Minor", color: "#404080" }],    // Dark Blue
  ["A#m", { label: "A♯ Minor", color: "#8080FF" }],  // Soft Blue
  ["Bbm", { label: "B♭ Minor", color: "#8080FF" }],  // Same as A♯m
  ["Bm", { label: "B Minor", color: "#000080" }],    // Navy Blue

  // Enharmonic Equivalents (same color as their corresponding key)
  ["B#", { label: "C Major", color: "#FF0000" }],    // Same as C Major
  ["E#", { label: "F Major", color: "#BFFF00" }],    // Same as F Major
  ["Fb", { label: "E Major", color: "#FFFF00" }],    // Same as E Major
  ["Cb", { label: "B Major", color: "#0080FF" }],    // Same as B Major

  ["B#m", { label: "C Minor", color: "#8000FF" }],   // Same as C Minor
  ["E#m", { label: "F Minor", color: "#800000" }],   // Same as F Minor
  ["Fbm", { label: "E♭ Minor", color: "#FF0080" }],  // Same as E♭ Minor
  ["Cbm", { label: "B Minor", color: "#000080" }]    // Same as B Minor
]);