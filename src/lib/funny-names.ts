// Funny random names like Excalidraw
const adjectives = [
  'Adventurous', 'Bouncy', 'Cheerful', 'Dapper', 'Eager',
  'Fluffy', 'Gleeful', 'Happy', 'Imaginative', 'Jolly',
  'Kooky', 'Lively', 'Mysterious', 'Nimble', 'Optimistic',
  'Playful', 'Quirky', 'Radiant', 'Silly', 'Thoughtful',
  'Upbeat', 'Vivid', 'Wacky', 'Zealous', 'Zesty',
  'Cosmic', 'Daring', 'Electric', 'Funky', 'Groovy',
  'Hyper', 'Jazzy', 'Lucky', 'Magical', 'Noble',
  'Peculiar', 'Quantum', 'Rowdy', 'Sneaky', 'Turbo',
  'Witty', 'Zippy', 'Brave', 'Clever', 'Dizzy',
  'Fancy', 'Gentle', 'Hungry', 'Icy', 'Jumpy',
];

const animals = [
  'Alpaca', 'Badger', 'Capybara', 'Dolphin', 'Elephant',
  'Flamingo', 'Giraffe', 'Hedgehog', 'Iguana', 'Jellyfish',
  'Koala', 'Lemur', 'Mongoose', 'Narwhal', 'Octopus',
  'Penguin', 'Quokka', 'Raccoon', 'Sloth', 'Toucan',
  'Unicorn', 'Vulture', 'Walrus', 'Xerus', 'Yak',
  'Zebra', 'Axolotl', 'Blobfish', 'Chinchilla', 'Dodo',
  'Echidna', 'Ferret', 'Gecko', 'Hamster', 'Ibis',
  'Jackrabbit', 'Kiwi', 'Llama', 'Meerkat', 'Newt',
  'Opossum', 'Platypus', 'Quail', 'Red Panda', 'Seahorse',
  'Tardigrade', 'Uakari', 'Viper', 'Wombat', 'Zonkey',
];

export function generateFunnyName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adjective} ${animal}`;
}

