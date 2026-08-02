import { FadeIn, FadeInDown, FadeInUp, FadeOut, SlideInRight, SlideOutRight, ZoomIn } from "react-native-reanimated";

export const entering = {
  fade: FadeIn.duration(150),
  fadeInDown: FadeInDown.duration(180),
  fadeInUp: FadeInUp.duration(180),
  slideRight: SlideInRight.duration(180),
  zoom: ZoomIn.duration(150),
} as const;

export const exiting = {
  fade: FadeOut.duration(150),
  slideRight: SlideOutRight.duration(150),
} as const;

export function staggeredFadeInDown(index: number, step = 15, duration = 180) {
  const maxDelay = 120;
  const delay = Math.min(index * step, maxDelay);
  return FadeInDown.duration(duration).delay(delay);
}
