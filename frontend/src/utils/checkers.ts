import { ChangeType } from "../base/enums";

export function checkIncreaseType(from: number, to: number): ChangeType {
  const diff = to - from;
  if (parseFloat(diff.toFixed(5)) > 0) return ChangeType.Increase;
  else if (parseFloat(diff.toFixed(5)) < 0) return ChangeType.Decrease;
  else return ChangeType.None;
}

// TODO: Delete if unused
export function isElementInViewport(elm: any) {
  var rect = elm.getBoundingClientRect();
  var viewHeight = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight
  );
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

export function areAssetsSame(asset1: any, asset2: any) {
  if (!asset1.name || !asset1.ticker || !asset2.name || !asset2.ticker)
    return false;

  if (asset1.name === asset2.name && asset1.ticker === asset2.ticker)
    return true;
  else return false;
}
