import { Bell, CheckCheck, BellOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '@/features/notifications/notificationsApi';
import Loader from '@/component/common/Loader';
import Button from '@/component/common/Button';
import { getRelativeTime } from '@/utilities/formatDate';

export default function Notifications() {
  const { user } = useAuth();

  const { data, isLoading } = useGetNotificationsQuery(
    { userId: user?.id ?? '', limit: 50 },
    { skip: !user },
  );
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  if (isLoading) return <Loader fullPage label="Loading notifications..." />;

  const notifications = data?.data ?? [];

  const handleMarkRead = (id: string) => {
    void markRead(id);
  };

  const handleMarkAll = () => {
    if (!user) return;
    void markAllRead({ userId: user.id });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAll}>
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <BellOff className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-400 mt-4 text-lg">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div key={notif.id} onClick={() => !notif.is_read && handleMarkRead(notif.id)}
              className={`card p-4 flex items-start gap-3 cursor-pointer transition-all ${notif.is_read ? 'opacity-60' : 'hover:shadow-md'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.is_read ? 'bg-slate-100' : 'bg-primary-50'}`}>
                <Bell className={`w-5 h-5 ${notif.is_read ? 'text-slate-400' : 'text-primary-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{notif.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{notif.message}</p>
                <p className="text-xs text-slate-400 mt-1">{getRelativeTime(notif.created_at)}</p>
              </div>
              {!notif.is_read && <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
