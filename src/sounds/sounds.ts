import { Howl, Howler } from "howler"

// Function to unlock audio context on first user interaction
export const unlockAudio = () => {
  if (Howler.ctx && Howler.ctx.state === 'suspended') {
    Howler.ctx.resume()
  }
}

export const sounds = {
  roundStart: new Howl({ src: ["sounds/roundStart.mp3"] }),
  revealResults: new Howl({ src: ["sounds/revealResults.mp3"] }),
  uiClick: new Howl({ src: ["sounds/UiClick.mp3"] }),
  scoreEarned: new Howl({ src: ["sounds/scoreEarned.mp3"] }),
}

/*
Race Start Ready go by steel2008 -- https://freesound.org/s/231277/ -- License: Creative Commons 0
result-8.mp3 by DZeDeNZ -- https://freesound.org/s/522245/ -- License: Creative Commons 0
VS Button Click 01.mp3 by Vilkas_Sound -- https://freesound.org/s/707038/ -- License: Attribution 4.0
success_bell by MLaudio -- https://freesound.org/s/511484/ -- License: Creative Commons 0
*/