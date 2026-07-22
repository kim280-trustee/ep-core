import {
  useNotificationStore,
} from "../store/notificationStore";

export function Toast() {
  const notifications =
    useNotificationStore(
      (state) =>
        state.notifications,
    );

  return (
    <div>
      {notifications.map(
        (notification) => (
          <div
            key={notification.id}
          >
            {notification.message}
          </div>
        ),
      )}
    </div>
  );
}