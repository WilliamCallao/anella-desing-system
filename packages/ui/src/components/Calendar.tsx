import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { card, palette, space, text, texts } from "@william-callao/antonella-theme";
import { Text } from "./text/Text";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const WEEKDAY_LABELS = ["Dom", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

type CalendarDay = {
  day: number;
  inMonth: boolean;
  isToday: boolean;
};

export interface CalendarProps extends ViewProps {
  date?: Date;
}

export function Calendar({ date = new Date(), style, ...rest }: CalendarProps) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const cells = buildMonthGrid(date);
  const rows: CalendarDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return (
    <View style={[styles.container, style]} {...rest}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {MONTHS[month]} {year}
        </Text>
      </View>
      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} style={[styles.cell, styles.weekdayText]}>
            {label}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.weekRow}>
          {row.map((cell, cellIndex) => (
            <View key={cellIndex} style={styles.cell}>
              {cell.isToday ? (
                <View style={styles.todayCircle}>
                  <Text style={styles.todayText}>{cell.day}</Text>
                </View>
              ) : (
                <Text style={[styles.dayText, !cell.inMonth && styles.dayMuted]}>{cell.day}</Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function buildMonthGrid(date: Date): CalendarDay[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();
  const isToday = (day: number) =>
    year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarDay[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inMonth: false, isToday: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, inMonth: true, isToday: isToday(day) });
  }
  let next = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: next, inMonth: false, isToday: false });
    next += 1;
  }
  return cells;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    paddingBottom: space.space4,
  },
  headerText: {
    fontSize: texts.bodyBold.fontSize,
    fontWeight: texts.bodyBold.fontWeight,
    color: card.text.primary,
  },
  weekRow: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayText: {
    fontSize: texts.captionMedium.fontSize,
    fontWeight: texts.captionMedium.fontWeight,
    color: card.text.secondary,
  },
  dayText: {
    fontSize: texts.body.fontSize,
    color: card.text.primary,
  },
  dayMuted: {
    color: text.placeholder,
  },
  todayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  todayText: {
    fontSize: texts.bodyBold.fontSize,
    fontWeight: texts.bodyBold.fontWeight,
    color: "#FFFFFF",
  },
});
