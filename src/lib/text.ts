/** Case- and diacritic-insensitive form for local search, so "hoan" finds "hoãn". */
export const foldText = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
