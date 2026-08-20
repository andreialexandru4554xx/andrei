'use strict';

(() => {
  const tradeName = 'Steel Erector';
  const tradePattern = /\b(steel\s+erectors?|steel\s+erection(?:\s+operative)?|structural\s+steel\s+(?:erectors?|installer)|steelwork\s+erectors?|steel\s+installer)\b/i;

  if (typeof tradePatterns !== 'undefined' && Array.isArray(tradePatterns)) {
    const exists = tradePatterns.some(([name]) => String(name).toLowerCase() === tradeName.toLowerCase());
    if (!exists) {
      const steelFixerIndex = tradePatterns.findIndex(([name]) => String(name).toLowerCase() === 'steel fixer');
      const insertAt = steelFixerIndex >= 0 ? steelFixerIndex : 0;
      tradePatterns.splice(insertAt, 0, [tradeName, tradePattern]);
    }
  }

  const list = document.getElementById('tradeOptions');
  if (list && ![...list.options].some((option) => option.value === tradeName)) {
    const option = document.createElement('option');
    option.value = tradeName;
    const steelFixer = [...list.options].find((item) => item.value === 'Steel Fixer');
    if (steelFixer) list.insertBefore(option, steelFixer);
    else list.append(option);
  }
})();
