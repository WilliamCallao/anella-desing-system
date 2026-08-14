import React, { useState } from "react";
import { Calendar, Text } from "@antonella/ui";
import { TextType } from "@antonella/theme";
import type { ComponentCategory } from "../types";

// --- Calendar ---

function CalendarTodayDemo() {
  return (
    <>
      <Calendar date={new Date()} />
      <Text variant={TextType.Caption}>
        Mes actual (hoy resaltado).
      </Text>
    </>
  );
}

function CalendarFutureDemo() {
  const future = new Date();
  future.setMonth(future.getMonth() + 2);
  return (
    <>
      <Calendar date={future} />
      <Text variant={TextType.Caption}>
        Mes +2 desde hoy.
      </Text>
    </>
  );
}

export const other: ComponentCategory = {
  id: "other",
  title: "Other",
  icon: "more-horizontal",
  components: [
    {
      id: "calendar",
      name: "Calendar",
      description: "Calendario simple: renderiza un mes con día de hoy remarcado.",
      variants: [
        { id: "today", label: "Mes actual", render: () => <CalendarTodayDemo /> },
        { id: "future", label: "Mes futuro", render: () => <CalendarFutureDemo /> },
      ],
    },
  ],
};
