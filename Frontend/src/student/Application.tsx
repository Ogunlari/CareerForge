import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGetStudentApplicationsQuery } from '@/features/applications/applicationsApi';
import ApplicationCard from '@/component/application/ApplicationCard';
import ApplicationTimeline from '@/component/application/ApplicationTimeline';
import Loader from '@/component/common/Loader';
import Modal from '@/component/common/Modal';
import type { Application } from '@/types';

export default function StudentApplications() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Application | null>(null);

  const { data, isLoading } = useGetStudentApplicationsQuery(
    { studentId: user?.id ?? '', limit: 50 },
    { skip: !user },
  );

  if (isLoading) return <Loader fullPage label="Loading applications..." />;

  const applications = data?.data ?? [];
  const filtered = filter === 'all' ? applications : applications.filter((a) => a.status === filter);

  const statusTabs = ['all', 'pending', 'reviewing', 'accepted', 'rejected'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">My Applications</h1>
        <p className="text-slate-500 mt-1">Track all your job applications</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${filter === tab ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {tab} {tab !== 'all' && `(${applications.filter((a) => a.status === tab).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-400 mt-4 text-lg">No applications found.</p>
          <Link to="/jobs" className="btn-primary mt-4">Browse Jobs</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div key={app.id} onClick={() => setSelected(app)} className="cursor-pointer">
              <ApplicationCard application={app} />
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Application Details" size="lg">
        {selected && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900">{selected.job?.title}</h3>
              <p className="text-slate-500">{selected.job?.company?.name}</p>
            </div>
            <ApplicationTimeline currentStatus={selected.status} createdAt={selected.applied_at} />
            {selected.cover_letter && (
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Cover Letter</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap rounded-xl bg-slate-50 p-4">{selected.cover_letter}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
