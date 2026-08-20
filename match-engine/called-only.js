// Hard rule: no real Blue call = no match shown.
for (let i = realCases.length - 1; i >= 0; i--) {
  const item = realCases[i];
  const second = String(item.second || '').trim().toLowerCase();
  const callTime = String(item.callTime || '').trim().toLowerCase();
  const hasRealCall = second && callTime && !second.includes('no blue call') && !callTime.includes('no blue call') && !callTime.includes('needs call');
  if (!hasRealCall) realCases.splice(i, 1);
}
render();
