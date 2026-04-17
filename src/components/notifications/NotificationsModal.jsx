import React, { useState } from 'react';
import Modal from '../Model';
import { MdNotifications, MdCheck, MdCircle, MdOutlineNotificationsNone } from 'react-icons/md';

const NOTIFICATIONS = [
    {
        id: 1,
        title: 'New Vendor Registration',
        message: 'Techpark IT has submitted KYC documents for review.',
        time: '2 min ago',
        read: false,
        color: 'bg-purple-100 text-purple-600',
        icon: '🏬',
    },
    {
        id: 2,
        title: 'New Offer Submitted',
        message: 'Tech Spark It submitted "20% Off Dev Courses" for approval.',
        time: '15 min ago',
        read: false,
        color: 'bg-yellow-100 text-yellow-600',
        icon: '🏷️',
    },
    {
        id: 3,
        title: 'Payment Received',
        message: 'John Doe paid ₹3.2L for Membership Card via Visa.',
        time: '1 hr ago',
        read: false,
        color: 'bg-green-100 text-green-600',
        icon: '💳',
    },
    {
        id: 4,
        title: 'New User Registered',
        message: 'Sarah Johnson signed up from Pune.',
        time: '3 hr ago',
        read: true,
        color: 'bg-blue-100 text-blue-600',
        icon: '👤',
    },
    {
        id: 5,
        title: 'New Job Application',
        message: 'Aniketh Kumar applied for the Marketing role.',
        time: '5 hr ago',
        read: true,
        color: 'bg-orange-100 text-orange-600',
        icon: '💼',
    },
    {
        id: 6,
        title: 'Referral Milestone',
        message: 'Vikas Patil reached 10 referrals and earned 100 points.',
        time: '1 day ago',
        read: true,
        color: 'bg-pink-100 text-pink-600',
        icon: '🎁',
    },
];

/**
 * Notifications Modal — built on the reusable Modal component.
 *
 * Props:
 *   isOpen  (bool)
 *   onClose (fn)
 */
const NotificationsModal = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState(NOTIFICATIONS);
    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = () =>
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    const markRead = (id) =>
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Notifications"
            className="max-w-sm w-full"
            /* Custom header actions via footer prop repurposed as header actions
               — we pass markAllRead button through the footer slot */
            footer={
                <button
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#7E1080] border border-purple-100 hover:bg-purple-50 transition-all"
                    onClick={onClose}
                >
                    Close Notifications
                </button>
            }
        >
            {/* Unread banner */}
            {unreadCount > 0 && (
                <div className="flex items-center justify-between px-1 mb-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FAB800] inline-block" />
                        <p className="text-xs font-semibold text-yellow-700">
                            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-1 text-xs text-[#7E1080] border border-purple-100 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition-all font-semibold"
                    >
                        <MdCheck size={14} />
                        Mark all read
                    </button>
                </div>
            )}

            {/* Notification list */}
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                    <MdOutlineNotificationsNone size={48} className="opacity-20" />
                    <p className="text-sm font-medium">No notifications</p>
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-gray-50 -mx-1">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            className={`flex items-start gap-3 px-1 py-3.5 cursor-pointer rounded-xl transition-all hover:bg-gray-50 ${
                                !n.read ? 'bg-purple-50/50' : ''
                            }`}
                        >
                            {/* Icon chip */}
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${n.color}`}
                            >
                                {n.icon}
                            </div>

                            {/* Text content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p
                                        className={`text-sm font-semibold truncate ${
                                            !n.read ? 'text-gray-900' : 'text-gray-500'
                                        }`}
                                    >
                                        {n.title}
                                    </p>
                                    {!n.read && (
                                        <MdCircle size={8} className="text-[#7E1080] shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
                                    {n.message}
                                </p>
                                <p className="text-[10px] text-gray-300 mt-1 font-medium">
                                    {n.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
};

export default NotificationsModal;
