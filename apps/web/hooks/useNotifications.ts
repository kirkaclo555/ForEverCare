import { useNotificationContext } from '../context/NotificationContext';

export { type AppNotification } from '../context/NotificationContext';

export const useNotifications = () => {
    return useNotificationContext();
};
