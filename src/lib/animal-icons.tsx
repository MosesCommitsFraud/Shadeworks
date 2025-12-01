import {
  type LucideIcon,
  Cat,
  Dog,
  Bird,
  Fish,
  Squirrel,
  Bug,
  Rabbit,
  Turtle,
  Snail,
  Rat,
  Footprints,
} from 'lucide-react';

/**
 * Maps animal names to their corresponding Lucide icons
 */
export const ANIMAL_ICON_MAP: Record<string, LucideIcon> = {
  // A
  alpaca: Rabbit,
  axolotl: Fish,

  // B
  badger: Rat,
  blobfish: Fish,

  // C
  capybara: Rat,
  chinchilla: Squirrel,

  // D
  dolphin: Fish,
  dodo: Bird,

  // E
  elephant: Footprints,
  echidna: Squirrel,

  // F
  flamingo: Bird,
  ferret: Cat,

  // G
  giraffe: Footprints,
  gecko: Bug,

  // H
  hedgehog: Squirrel,
  hamster: Rat,

  // I
  iguana: Bug,
  ibis: Bird,

  // J
  jellyfish: Fish,
  jackrabbit: Rabbit,

  // K
  koala: Cat,
  kiwi: Bird,

  // L
  lemur: Cat,
  llama: Rabbit,

  // M
  mongoose: Cat,
  meerkat: Squirrel,

  // N
  narwhal: Fish,
  newt: Bug,

  // O
  octopus: Fish,
  opossum: Rat,

  // P
  penguin: Bird,
  platypus: Turtle,

  // Q
  quokka: Squirrel,
  quail: Bird,

  // R
  raccoon: Cat,
  'red panda': Cat,

  // S
  sloth: Cat,
  seahorse: Fish,

  // T
  toucan: Bird,
  tardigrade: Bug,

  // U
  unicorn: Footprints,
  uakari: Cat,

  // V
  vulture: Bird,
  viper: Snail,

  // W
  walrus: Fish,
  wombat: Rat,

  // X
  xerus: Squirrel,

  // Y
  yak: Dog,

  // Z
  zebra: Footprints,
  zonkey: Dog,
};

/**
 * Gets the animal icon for a given user name
 * @param name - Full user name (e.g., "Cheerful Capybara")
 * @returns The corresponding Lucide icon component
 */
export function getAnimalIcon(name: string): LucideIcon {
  // Extract the animal name (last word)
  const words = name.trim().toLowerCase().split(' ');
  const animalName = words.slice(-1).join(' ');

  // Try to match "Red Panda" (two words)
  const twoWordAnimal = words.slice(-2).join(' ');
  if (ANIMAL_ICON_MAP[twoWordAnimal]) {
    return ANIMAL_ICON_MAP[twoWordAnimal];
  }

  // Default to single word animal name
  return ANIMAL_ICON_MAP[animalName] || Cat; // Default to Cat icon if not found
}
