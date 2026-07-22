import { create } from "zustand";

import type {
  Notification,
} from "../types/notification.types";

interface State {
  notifications: Notification[];

  add: (
    notification: Notification,
  ) => void;

  remove: (
    id: string,
  ) => void;
}

export const useNotificationStore =
  create<State>((set) => ({
    notifications: [],

    add: (notification) =>
      set((state) => ({
        notifications: [
          ...state.notifications,
          notification,
        ],
      })),

    remove: (id) =>
      set((state) => ({
        notifications:
          state.notifications.filter(
            (item) =>
              item.id !== id,
          ),
      })),
  }));