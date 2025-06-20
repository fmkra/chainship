import { motion, AnimatePresence } from 'framer-motion'
import { create } from 'zustand'

export interface NotificationState {
    notifications: Notification[]
    addNotification: (message: string, type: NotificationType, duration?: number) => void
    dismissNotification: (id: number) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],

    /**
     * Adds a notification and automatically removes it after a specified duration.
     * @param message The message to display.
     * @param type The type of notification (info, success, etc.).
     * @param duration The time in milliseconds before the notification disappears (default: 5000ms).
     */
    addNotification: (message, type, duration = 5000) => {
        const newNotification: Notification = {
            id: Date.now(), // Simple unique ID
            message,
            type,
        }

        set((state) => ({
            notifications: [...state.notifications, newNotification],
        }))

        setTimeout(() => {
            // Use get() to access the latest state inside the timeout
            set({
                notifications: get().notifications.filter((n) => n.id !== newNotification.id),
            })
        }, duration)
    },

    /**
     * Manually dismisses a notification, for example, when a user clicks the close button.
     * @param id The unique ID of the notification to remove.
     */
    dismissNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        }))
    },
}))

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
    id: number
    message: string
    type: NotificationType
}

interface NotificationItemProps {
    notification: Notification
    onDismiss: (id: number) => void
}

const getStylesForType = (type: NotificationType) => {
    switch (type) {
        case 'success':
            return 'bg-green-100 border-green-500 text-green-800'
        case 'warning':
            return 'bg-yellow-100 border-yellow-500 text-yellow-800'
        case 'error':
            return 'bg-red-100 border-red-500 text-red-800'
        case 'info':
        default:
            return 'bg-blue-100 border-blue-500 text-blue-800'
    }
}

const NotificationItem = ({ notification, onDismiss }: NotificationItemProps) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`relative w-80 max-w-xs rounded-md border-l-4 p-4 shadow-lg ${getStylesForType(
                notification.type
            )}`}
        >
            <button
                onClick={() => onDismiss(notification.id)}
                className="absolute top-1 right-1 text-lg font-bold opacity-50 hover:opacity-100 hover:cursor-pointer"
            >
                &times;
            </button>
            <p className="pr-4 font-semibold">{notification.message}</p>
        </motion.div>
    )
}

const NotificationToaster = () => {
    const { notifications, dismissNotification } = useNotificationStore()

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onDismiss={dismissNotification}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}

export default NotificationToaster
