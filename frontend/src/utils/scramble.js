// utils/scramble.js
export function getNextIndex(textLength, revealedSet, revealDirection) {
  switch (revealDirection) {
    case 'start':  return revealedSet.size;
    case 'end':    return textLength - 1 - revealedSet.size;
    case 'center': {
      const middle = Math.floor(textLength/2);
      const offset = Math.floor(revealedSet.size/2);
      const cand = revealedSet.size%2===0
        ? middle + offset
        : middle - offset -1;
      if (cand>=0 && cand<textLength && !revealedSet.has(cand)) {
        return cand;
      }
      // fallback to first unrevealed
      for (let i=0; i<textLength; i++){
        if (!revealedSet.has(i)) return i;
      }
      return 0;
    }
    default:
      return revealedSet.size;
  }
}

export function shuffleText(original, revealedSet, {
  useOriginalCharsOnly,
  characters
}) {
  const availChars = useOriginalCharsOnly
    ? Array.from(new Set(original.split('')))
        .filter(c=>c!==' ')
    : characters.split('');

  // build positions once
  const positions = original.split('').map((c,i) => ({
    c, i,
    space: c===' ',
    revealed: revealedSet.has(i)
  }));

  // shuffle pool
  const pool = positions
    .filter(p=>!p.space && !p.revealed)
    .map(p=>p.c);

  for (let i=pool.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  let idx=0;
  return positions.map(p => {
    if (p.space)    return ' ';
    if (p.revealed) return original[p.i];
    return pool[idx++];
  }).join('');
}
