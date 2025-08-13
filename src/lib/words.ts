// Dictionary of words starting with 'f'.
// Note: This is a starter set. You can add more or load from a service.
// The UI shows the word WITHOUT the leading 'f' because the leading 'f' is drawn separately.
export const fWords: string[] = [
  'fabric', 'fable', 'fabled', 'fabulous', 'facet', 'facade', 'face', 'facility', 'fact', 'factor', 'factory', 'faculty',
  'fade', 'fading', 'fahrenheit', 'fail', 'fair', 'faith', 'fake', 'falcon', 'fall', 'fallen', 'falling', 'false', 'fame', 'familiar',
  'family', 'famine', 'famous', 'fan', 'fancy', 'fantasy', 'fantastic', 'far', 'fare', 'farm', 'farmer', 'farming', 'fascinate', 'fashion',
  'fast', 'faster', 'fastest', 'fat', 'fatal', 'fate', 'father', 'fathom', 'fatigue', 'fatten', 'fault', 'faultless', 'faulty',
  'fauna', 'favor', 'favorite', 'fawn', 'fax', 'fear', 'fearless', 'feast', 'feat', 'feather', 'feature', 'february', 'federal', 'federation',
  'fee', 'feed', 'feedback', 'feeding', 'feel', 'feeling', 'feign', 'feint', 'felicity', 'feline', 'fell', 'fellow', 'felony', 'felt',
  'female', 'feminine', 'feminist', 'fence', 'fend', 'ferment', 'fern', 'ferocious', 'ferric', 'ferry', 'fertile', 'fertility', 'fervor',
  'festival', 'festive', 'fetch', 'fetish', 'feudal', 'fever', 'few', 'fez', 'fiat', 'fiasco', 'fiber', 'fiction', 'fiddle', 'fidelity',
  'field', 'fierce', 'fiery', 'fifteen', 'fifth', 'fiftieth', 'fifty', 'fight', 'fighter', 'figure', 'figurative', 'filament', 'file', 'fill',
  'filler', 'filling', 'film', 'filter', 'final', 'finale', 'finance', 'find', 'finder', 'fine', 'finesse', 'finger', 'finish', 'finite',
  'fire', 'firefly', 'firm', 'first', 'fiscal', 'fish', 'fisher', 'fishing', 'fission', 'fist', 'fit', 'fitness', 'fitting', 'five',
  'fix', 'fixture', 'fizz', 'fjord', 'flair', 'flake', 'flame', 'flamingo', 'flank', 'flare', 'flash', 'flat', 'flatter', 'flavor', 'flaw',
  'flea', 'fled', 'fleece', 'fleet', 'flesh', 'flex', 'flexible', 'flick', 'flicker', 'flight', 'flinch', 'fling', 'flip', 'flirt', 'float',
  'flock', 'flood', 'floor', 'flora', 'floral', 'flour', 'flourish', 'flow', 'flower', 'flowing', 'flu', 'fluctuate', 'fluent', 'fluff',
  'fluid', 'fluke', 'flung', 'flurry', 'flush', 'flute', 'flux', 'fly', 'flyer', 'flying', 'foam', 'focus', 'fodder', 'foe', 'fog', 'foggy',
  'foil', 'fold', 'folk', 'follow', 'following', 'fond', 'font', 'food', 'fool', 'foot', 'football', 'footing', 'footnote', 'footprint',
  'forage', 'foray', 'forbid', 'force', 'forced', 'forceful', 'ford', 'fore', 'forecast', 'forefront', 'foreign', 'foresee', 'forest', 'forever',
  'forge', 'forged', 'forger', 'forgery', 'forget', 'forgive', 'forgiving', 'fork', 'form', 'formal', 'format', 'formation', 'former', 'formula',
  'forth', 'fortify', 'fortress', 'fortune', 'forum', 'forward', 'found', 'foundation', 'founder', 'foundry', 'fountain', 'four', 'fourth', 'fowl',
  'fox', 'foxtrot', 'foyer', 'fragile', 'fragment', 'fragrance', 'frail', 'frame', 'framework', 'franc', 'frank', 'frantic', 'fraud', 'fray',
  'freak', 'freckle', 'free', 'freed', 'freedom', 'freeform', 'freelance', 'freely', 'freeze', 'freezer', 'freight', 'french', 'frenzy', 'frequency',
  'frequent', 'fresh', 'freshen', 'freshly', 'friend', 'friendly', 'friendship', 'fright', 'frighten', 'fringe', 'frisky', 'fritter', 'frolic',
  'front', 'frontier', 'frost', 'frown', 'frozen', 'frugal', 'fruit', 'fruitful', 'frustrate', 'fry', 'fuel', 'fugitive', 'fulcrum', 'fulfil',
  'full', 'fuller', 'fullest', 'fully', 'fulsome', 'fume', 'fumigate', 'fun', 'function', 'fund', 'fundamental', 'funding', 'fungi', 'fungus',
  'funnel', 'funny', 'fur', 'furious', 'furnace', 'furnish', 'furniture', 'furor', 'furry', 'further', 'fury', 'fuse', 'fusion', 'fuss', 'fussy',
  'futile', 'future', 'futurism', 'fuzzy', 'falestina' 
];

export function ensureFHead(words: string[]): string[] {
  // Keep only words that start with 'f' or 'F'
  return words.filter((w) => /^f/i.test(w));
}
