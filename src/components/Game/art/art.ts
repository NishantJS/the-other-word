// Import the old animal and emotion types for backward compatibility
import { Animal, Emotion } from "../../../lib/types/GameState"

// Import animal images
import lion from "./animals/lion.png"
import dog from "./animals/dog.png"
import pig from "./animals/pig.png"
import sheep from "./animals/sheep.png"
import elephant from "./animals/elephant.png"
import cow from "./animals/cow.png"
import cat from "./animals/cat.png"
import frog from "./animals/frog.png"
import monkey from "./animals/monkey.png"
import horse from "./animals/horse.png"
import goat from "./animals/goat.png"
import mouse from "./animals/mouse.png"
import owl from "./animals/owl.png"
import duck from "./animals/duck.png"
import chicken from "./animals/chicken.png"

// Import emotion images
import scared from "./emotions/scared.png"
import crying from "./emotions/crying.png"
import sneezing from "./emotions/sneezing.png"
import ghost from "./emotions/ghost.png"
import cold from "./emotions/cold.png"
import angry from "./emotions/angry.png"
import sleepy from "./emotions/sleepy.png"
import laughing from "./emotions/laughing.png"
import happy from "./emotions/laughing.png" // Reuse laughing for happy
import sad from "./emotions/crying.png" // Reuse crying for sad
import surprised from "./emotions/scared.png" // Reuse scared for surprised
import confused from "./emotions/sleepy.png" // Reuse sleepy for confused
import excited from "./emotions/laughing.png" // Reuse laughing for excited
import bored from "./emotions/sleepy.png" // Reuse sleepy for bored

// Create a record type that allows any string key
type AnyStringRecord = Record<string, string>

// Export the art object with flexible typing
export const art = {
  animals: {
    // Original animals
    lion,
    dog,
    pig,
    sheep,
    elephant,
    cow,
    cat,
    frog,
    monkey,
    horse,
    goat,
    mouse,
    owl,
    duck,
    chicken,

    // New animals (using existing images as placeholders)
    apple: lion,
    banana: monkey,
    carrot: pig,
    diamond: cat,
    // elephant is already defined
    flower: pig,
    guitar: dog,
    hamburger: pig,
    igloo: sheep,
    jacket: cat,
    kangaroo: horse,
    lemon: pig,
    mountain: elephant,
    notebook: cat,
    octopus: frog,
    penguin: owl,
    queen: cat,
    rainbow: pig,
    sunshine: lion,
    tiger: lion,
    umbrella: pig,
    volcano: elephant,
    waterfall: frog,
    xylophone: dog,
    yogurt: pig,
    zebra: horse,
    airplane: owl,
    butterfly: owl,
    chocolate: pig,
    dolphin: frog
  } as AnyStringRecord,

  emotions: {
    // Original emotions
    scared,
    crying,
    sneezing,
    ghost,
    cold,
    angry,
    sleepy,
    laughing,

    // New emotions
    happy,
    sad,
    surprised,
    confused,
    excited,
    bored
  } as AnyStringRecord
}
