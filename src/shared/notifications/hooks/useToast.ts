import {
  useNotificationStore,
} from "../store/notificationStore";

import type {
  NotificationType,
} from "../types/notification.types";

export function useToast() {
  const add =
    useNotificationStore(
      (state) => state.add,
    );

  function show(
    message: string,
    type: NotificationType,
  ) {
    add({
      id: crypto.randomUUID(),
      message,
      type,
    });
  }

  return {
    success: (
      message: string,
    ) =>
      show(message, "success"),

    error: (
      message: string,
    ) =>
      show(message, "error"),

    warning: (
      message: string,
    ) =>
      show(message, "warning"),

    info: (
      message: string,
    ) =>
      show(message, "info"),
  };
}