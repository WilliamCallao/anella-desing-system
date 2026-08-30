import React, { createContext, useContext, type ReactNode } from "react";
import { ScrollView, useWindowDimensions, View, type ViewProps, type ViewStyle } from "react-native";
import { LayoutRowSize } from "@william-callao/antonella-theme";

type LayoutRowContextValue = { debug: boolean; isSmall: boolean };
const LayoutRowContext = createContext<LayoutRowContextValue>({ debug: false, isSmall: false });
const useLayoutRowContext = () => useContext(LayoutRowContext);

const debugColors = ["#FF6B6B", "#4ECDC4"];
const BREAKPOINT_SMALL = 600;

type LayoutRowChildProps = {
  size?: LayoutRowSize;
  scroll?: boolean;
  children: ReactNode;
};

type LayoutRowProps = { debug?: boolean; fill?: boolean; gap?: number; padding?: number } & ViewProps;

function LayoutRowFirst({ size = LayoutRowSize.EXPAND, scroll, children }: LayoutRowChildProps) {
  const { debug, isSmall } = useLayoutRowContext();
  const computedSize = isSmall ? LayoutRowSize.FIT : size;
  const isExpand = computedSize === LayoutRowSize.EXPAND;
  const wrapper: ViewStyle = {
    backgroundColor: debug ? debugColors[0] : undefined,
    overflow: "hidden",
  };
  if (scroll && isExpand) {
    return (
      <ScrollView horizontal style={[wrapper, { flex: 1 }]} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row" }}>{children}</View>
      </ScrollView>
    );
  }
  return (
    <View style={[wrapper, isExpand ? { flex: 1 } : {}]}>
      {children}
    </View>
  );
}

function LayoutRowSecond({ size = LayoutRowSize.EXPAND, scroll, children }: LayoutRowChildProps) {
  const { debug, isSmall } = useLayoutRowContext();
  const computedSize = isSmall ? LayoutRowSize.FIT : size;
  const isExpand = computedSize === LayoutRowSize.EXPAND;
  const wrapper: ViewStyle = {
    backgroundColor: debug ? debugColors[1] : undefined,
    overflow: "hidden",
  };
  if (scroll && isExpand) {
    return (
      <ScrollView horizontal style={[wrapper, { flex: 1 }]} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row" }}>{children}</View>
      </ScrollView>
    );
  }
  return (
    <View style={[wrapper, isExpand ? { flex: 1 } : {}]}>
      {children}
    </View>
  );
}

function LayoutRow({ debug, fill = true, gap, padding, style, children, ...rest }: LayoutRowProps) {
  const { width } = useWindowDimensions();
  const isSmall = width < BREAKPOINT_SMALL;
  return (
    <LayoutRowContext.Provider value={{ debug: !!debug, isSmall }}>
      <View
        style={[
          isSmall ? styles.containerSmall : styles.containerWide,
          !isSmall && fill && { flex: 1 },
          gap != null && { gap },
          padding != null && { padding },
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    </LayoutRowContext.Provider>
  );
}

LayoutRow.First = LayoutRowFirst;
LayoutRow.Second = LayoutRowSecond;

const styles = {
  containerWide: {
    flexDirection: "row" as const,
  },
  containerSmall: {
    flexDirection: "column" as const,
  },
};

export { LayoutRow };
