import { FadeIn, FadeInDown, FadeInUp, FadeOut, SlideInRight, SlideOutRight, ZoomIn } from "react-native-reanimated";

export const entering = {
  fade: FadeIn.duration(250),
  fadeInDown: FadeInDown.duration(300),
  fadeInUp: FadeInUp.duration(300),
  slideRight: SlideInRight.duration(250),
  zoom: ZoomIn.duration(200),
} as const;

export const exiting = {
  fade: FadeOut.duration(200),
  slideRight: SlideOutRight.duration(200),
} as const;

export function staggeredFadeInDown(index: number, step = 50, duration = 300) {
  return FadeInDown.duration(duration).delay(index * step);
}
