import React, { createContext, useContext, type ReactNode } from "react";
import { ScrollView, View, type ViewProps, type ViewStyle } from "react-native";
import { LayoutColumnSize } from "@antonella/theme";

type LayoutColumnContextValue = { debug: boolean };
const LayoutColumnContext = createContext<LayoutColumnContextValue>({ debug: false });
const useLayoutColumnContext = () => useContext(LayoutColumnContext);

const debugColors = ["#FF6B6B", "#4ECDC4"];

type LayoutColumnChildProps = {
  size?: LayoutColumnSize;
  scroll?: boolean;
  children: ReactNode;
};

type LayoutColumnProps = { debug?: boolean; fill?: boolean; gap?: number; padding?: number } & ViewProps;

function LayoutColumnFirst({ size = LayoutColumnSize.EXPAND, scroll, children }: LayoutColumnChildProps) {
  const { debug } = useLayoutColumnContext();
  const isExpand = size === LayoutColumnSize.EXPAND;
  const wrapper: ViewStyle = {
    backgroundColor: debug ? debugColors[0] : undefined,
    overflow: "hidden",
  };
  if (scroll && isExpand) {
    return (
      <ScrollView style={[wrapper, { flex: 1 }]} showsVerticalScrollIndicator={false}>
        <View>{children}</View>
      </ScrollView>
    );
  }
  return (
    <View style={[wrapper, isExpand ? { flex: 1 } : {}]}>
      {children}
    </View>
  );
}

function LayoutColumnSecond({ size = LayoutColumnSize.EXPAND, scroll, children }: LayoutColumnChildProps) {
  const { debug } = useLayoutColumnContext();
  const isExpand = size === LayoutColumnSize.EXPAND;
  const wrapper: ViewStyle = {
    backgroundColor: debug ? debugColors[1] : undefined,
    overflow: "hidden",
  };
  if (scroll && isExpand) {
    return (
      <ScrollView style={[wrapper, { flex: 1 }]} showsVerticalScrollIndicator={false}>
        <View>{children}</View>
      </ScrollView>
    );
  }
  return (
    <View style={[wrapper, isExpand ? { flex: 1 } : {}]}>
      {children}
    </View>
  );
}

function LayoutColumn({ debug, fill = true, gap, padding, style, children, ...rest }: LayoutColumnProps) {
  return (
    <LayoutColumnContext.Provider value={{ debug: !!debug }}>
      <View
        style={[
          { flexDirection: "column" as const, overflow: "hidden" as const },
          fill && { flex: 1 },
          gap != null && { gap },
          padding != null && { padding },
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    </LayoutColumnContext.Provider>
  );
}

LayoutColumn.First = LayoutColumnFirst;
LayoutColumn.Second = LayoutColumnSecond;

export { LayoutColumn };
