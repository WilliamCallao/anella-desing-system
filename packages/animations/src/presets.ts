import { FadeIn, FadeOut, SlideInRight, SlideOutRight, ZoomIn } from "react-native-reanimated";

export const entering = {
  fade: FadeIn.duration(250),
  slideRight: SlideInRight.duration(250),
  zoom: ZoomIn.duration(200),
} as const;

export const exiting = {
  fade: FadeOut.duration(200),
  slideRight: SlideOutRight.duration(200),
} as const;
