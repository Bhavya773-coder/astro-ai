// Public domain Rider-Waite-Smith tarot card images
// Source: github.com/wicker/Rider-Waite-Reader (GPL-3.0 license)
// Original artwork by Pamela Colman Smith (1909) — public domain

const BASE = 'https://raw.githubusercontent.com/wicker/Rider-Waite-Reader/master/rider-waite-reader/public/img';

// Map card name_short (from tarotapi.dev) to image filename
export const TAROT_CARD_IMAGES: Record<string, string> = {
  // Major Arcana
  ar00: `${BASE}/tarot-0-fool.jpg`,
  ar01: `${BASE}/tarot-1-magician.jpg`,
  ar02: `${BASE}/tarot-2-high-priestess.jpg`,
  ar03: `${BASE}/tarot-3-the-empress.jpg`,
  ar04: `${BASE}/tarot-4-the-emperor.jpg`,
  ar05: `${BASE}/tarot-5-the-hierophant.jpg`,
  ar06: `${BASE}/tarot-6-the-lovers.jpg`,
  ar07: `${BASE}/tarot-7-the-chariot.jpg`,
  ar08: `${BASE}/tarot-8-strength.jpg`,
  ar09: `${BASE}/tarot-9-hermit.jpg`,
  ar10: `${BASE}/tarot-10-wheel-of-fortune.jpg`,
  ar11: `${BASE}/tarot-11-justice.jpg`,
  ar12: `${BASE}/tarot-12-the-hanged-man.jpg`,
  ar13: `${BASE}/tarot-13-death.jpg`,
  ar14: `${BASE}/tarot-14-temperance.jpg`,
  ar15: `${BASE}/tarot-15-the-devil.jpg`,
  ar16: `${BASE}/tarot-16-the-tower.jpg`,
  ar17: `${BASE}/tarot-17-the-star.jpg`,
  ar18: `${BASE}/tarot-18-the-moon.jpg`,
  ar19: `${BASE}/tarot-19-the-sun.jpg`,
  ar20: `${BASE}/tarot-20-judgement.jpg`,
  ar21: `${BASE}/tarot-21-the-world.jpg`,

  // Minor Arcana - Wands
  waac: `${BASE}/wands01.jpg`,
  wa02: `${BASE}/wands02.jpg`,
  wa03: `${BASE}/wands03.jpg`,
  wa04: `${BASE}/wands04.jpg`,
  wa05: `${BASE}/wands05.jpg`,
  wa06: `${BASE}/wands06.jpg`,
  wa07: `${BASE}/wands07.jpg`,
  wa08: `${BASE}/wands08.jpg`,
  wa09: `${BASE}/wands09.jpg`,
  wa10: `${BASE}/wands10.jpg`,
  wapa: `${BASE}/wands11.jpg`,
  wakn: `${BASE}/wands12.jpg`,
  waqu: `${BASE}/wands13.jpg`,
  waki: `${BASE}/wands14.jpg`,

  // Minor Arcana - Cups
  cuac: `${BASE}/cups01.jpg`,
  cu02: `${BASE}/cups02.jpg`,
  cu03: `${BASE}/cups03.jpg`,
  cu04: `${BASE}/cups04.jpg`,
  cu05: `${BASE}/cups05.jpg`,
  cu06: `${BASE}/cups06.jpg`,
  cu07: `${BASE}/cups07.jpg`,
  cu08: `${BASE}/cups08.jpg`,
  cu09: `${BASE}/cups09.jpg`,
  cu10: `${BASE}/cups10.jpg`,
  cupa: `${BASE}/cups11.jpg`,
  cukn: `${BASE}/cups12.jpg`,
  cuqu: `${BASE}/cups13.jpg`,
  cuki: `${BASE}/cups14.jpg`,

  // Minor Arcana - Swords
  swac: `${BASE}/swords01.jpg`,
  sw02: `${BASE}/swords02.jpg`,
  sw03: `${BASE}/swords03.jpg`,
  sw04: `${BASE}/swords04.jpg`,
  sw05: `${BASE}/swords05.jpg`,
  sw06: `${BASE}/swords06.jpg`,
  sw07: `${BASE}/swords07.jpg`,
  sw08: `${BASE}/swords08.jpg`,
  sw09: `${BASE}/swords09.jpg`,
  sw10: `${BASE}/swords10.jpg`,
  swpa: `${BASE}/swords11.jpg`,
  swkn: `${BASE}/swords12.jpg`,
  swqu: `${BASE}/swords13.jpg`,
  swki: `${BASE}/swords14.jpg`,

  // Minor Arcana - Pentacles
  peac: `${BASE}/pents01.jpg`,
  pe02: `${BASE}/pents02.jpg`,
  pe03: `${BASE}/pents03.jpg`,
  pe04: `${BASE}/pents04.jpg`,
  pe05: `${BASE}/pents05.jpg`,
  pe06: `${BASE}/pents06.jpg`,
  pe07: `${BASE}/pents07.jpg`,
  pe08: `${BASE}/pents08.jpg`,
  pe09: `${BASE}/pents09.jpg`,
  pe10: `${BASE}/pents10.jpg`,
  pepa: `${BASE}/pents11.jpg`,
  pekn: `${BASE}/pents12.jpg`,
  pequ: `${BASE}/pents13.jpg`,
  peki: `${BASE}/pents14.jpg`,
};

export const getCardImage = (nameShort: string): string | null => {
  return TAROT_CARD_IMAGES[nameShort] || null;
};
