/** Scale a font-size CSS variable on `el` so `measure` fills `box`'s content width. */
export function fitWidth(el: HTMLElement, measure: HTMLElement, box: HTMLElement, varName: string) {
  el.style.setProperty(varName, "100px");
  const w = measure.getBoundingClientRect().width;
  const cs = getComputedStyle(box);
  const target = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  if (w > 0) el.style.setProperty(varName, `${((100 * target) / w) * 0.995}px`);
}
