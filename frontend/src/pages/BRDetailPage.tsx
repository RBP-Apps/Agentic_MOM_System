import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    TrashIcon,
    ArrowLeftIcon,
    CalendarDaysIcon,
    MapPinIcon,
    ClockIcon,
    UserIcon,
    BuildingOfficeIcon,
    ClipboardDocumentListIcon,
    ArrowDownTrayIcon,
    PencilSquareIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    DocumentIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../api';
import type { Meeting } from '../types';

const statusColors: Record<string, string> = {
    Completed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    'In Progress': 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    Pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
};

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-[#161b27] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-brand-500">{icon}</span>
                <h3 className="text-[14px] font-bold text-slate-800 dark:text-white">{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

export default function BRDetailPage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: meeting, isLoading } = useQuery<Meeting>({
        queryKey: ['br-meeting', id],
        queryFn: async () => (await api.get(`/br/${id}`)).data,
    });

    const handleDownloadPDF = () => {
        if (!id) return;
        // Assuming backend handles PDF generation for BRs at same/similar endpoint
        window.open(`${window.location.origin}/api/v1/br/${id}/pdf`, '_blank');
    };

    const handleDeleteMeeting = async () => {
        if (!meeting || !window.confirm(`Delete Board Resolution "${meeting.title}"?\nThis action cannot be undone.`)) return;
        try {
            await api.delete(`/br/${id}`);
            toast.success('Resolution deleted');
            queryClient.invalidateQueries({ queryKey: ['br-meetings'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            navigate('/br');
        } catch {
            toast.error('Failed to delete resolution');
        }
    };

    const handleCancelMeeting = async () => {
        if (!meeting || !window.confirm(`Cancel Board Resolution "${meeting.title}"?`)) return;
        try {
            await api.post(`/br/${id}/cancel`);
            toast.success('Resolution cancelled');
            queryClient.invalidateQueries({ queryKey: ['br-meeting', id] });
            queryClient.invalidateQueries({ queryKey: ['br-meetings'] });
        } catch {
            toast.error('Failed to cancel resolution');
        }
    };

    const handleRescheduleMeeting = async () => {
        const newDate = window.prompt("Enter new date (YYYY-MM-DD):", meeting?.date || "");
        if (!newDate) return;
        const newTime = window.prompt("Enter new time (HH:MM):", meeting?.time || "");
        if (!newTime) return;

        try {
            await api.post(`/br/${id}/reschedule`, { date: newDate, time: newTime });
            toast.success('Resolution rescheduled');
            queryClient.invalidateQueries({ queryKey: ['br-meeting', id] });
            queryClient.invalidateQueries({ queryKey: ['br-meetings'] });
        } catch {
            toast.error('Failed to reschedule resolution');
        }
    };

    if (isLoading || !meeting) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Loading resolution…</p>
            </div>
        );
    }

    const metaItems = [
        { icon: <BuildingOfficeIcon className="w-4 h-4" />, label: 'Organization', value: meeting.organization },
        { icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'Type', value: 'Board Resolution' },
        { icon: <ClipboardDocumentListIcon className="w-4 h-4" />, label: 'Mode', value: meeting.meeting_mode },
        { icon: <CalendarDaysIcon className="w-4 h-4" />, label: 'Date', value: meeting.date },
        { icon: <ClockIcon className="w-4 h-4" />, label: 'Time', value: meeting.time },
        { icon: <MapPinIcon className="w-4 h-4" />, label: 'Venue/Link', value: meeting.venue },
        { icon: <UserIcon className="w-4 h-4" />, label: 'Hosted By', value: meeting.hosted_by },
        { icon: <CheckCircleIcon className="w-4 h-4" />, label: 'Status', value: meeting.status === 'Completed' ? 'Passed' : meeting.status },
    ];

    const canAction = meeting.status === 'Scheduled' || meeting.status === 'Rescheduled';

    return (
        <div className="space-y-5 max-w-4xl mx-auto">

            {/* ── Top Nav Bar ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Link to="/br" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors">
                    <ArrowLeftIcon className="w-4 h-4" /> Back to Board Resolutions
                </Link>
                <div className="flex flex-wrap gap-2">
                    {canAction && (
                        <>
                            <button
                                onClick={handleRescheduleMeeting}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20 border border-brand-100 dark:border-brand-500/20 transition-all active:scale-[0.98]"
                            >
                                <CalendarDaysIcon className="w-4 h-4" /> Reschedule
                            </button>
                            <button
                                onClick={handleCancelMeeting}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-100 dark:border-orange-500/20 transition-all active:scale-[0.98]"
                            >
                                <ClockIcon className="w-4 h-4" /> Cancel
                            </button>
                        </>
                    )}

                    <button
                        onClick={handleDeleteMeeting}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-100 dark:border-red-500/20 transition-all active:scale-[0.98]"
                    >
                        <TrashIcon className="w-4 h-4" /> Delete
                    </button>

                    {canAction && (
                        <Link
                            to={`/br/${id}/log-mom`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20 border border-brand-100 dark:border-brand-500/20 transition-all active:scale-[0.98]"
                        >
                            <PencilSquareIcon className="w-4 h-4" /> Pass Resolution
                        </Link>
                    )}

                    <button
                        onClick={handleDownloadPDF}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-200 dark:shadow-brand-900/40 transition-all active:scale-[0.98]"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" /> Download BR PDF
                    </button>
                </div>
            </div>

            {/* ── Hero Header ── */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-brand-700" />
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="relative z-10 p-6 text-white">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-200 mb-1">Board Resolution Details</p>
                    <h2 className="text-2xl font-extrabold mb-4">{meeting.title}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {metaItems.filter(i => i.value).map((item, idx) => (
                            <div key={idx} className="bg-white/10 rounded-xl px-3.5 py-3 backdrop-blur-sm">
                                <div className="flex items-center gap-1.5 text-brand-200 mb-1">
                                    {item.icon}
                                    <p className="text-[10px] font-bold uppercase tracking-wide">{item.label}</p>
                                </div>
                                <p className="text-[13px] font-semibold text-white">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Resolution Details ── */}
            {meeting.discussion && (
                <Section title="Resolution Wording" icon={<CheckCircleIcon className="w-[18px] h-[18px]" />}>
                    <p className="text-[14px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-medium bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        {meeting.discussion.summary_text}
                    </p>
                </Section>
            )}

            {/* ── Directors (Attendees) ── */}
            <Section title="Directors" icon={<UserIcon className="w-[18px] h-[18px]" />}>
                {meeting.attendees.length === 0 ? (
                    <p className="text-sm text-slate-400">No directors recorded.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {meeting.attendees.map((a) => {
                            const present = String(a.attendance_status).toLowerCase().includes('present');
                            return (
                                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                                    <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400 text-[13px] font-bold shrink-0">
                                        {a.user_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col gap-1 w-full pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                                            <p className="text-[13px] font-semibold text-slate-800 dark:text-white truncate">{a.user_name} {a.designation ? `- ${a.designation}` : ''}</p>
                                            <p className="text-[11px] text-slate-500 font-medium truncate">
                                                {a.email || 'No email'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border shrink-0 ${present ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
                                        {present ? '✓ Present' : '✗ Absent'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Section>

            {/* ── Agenda ── */}
            <Section title="Agenda" icon={<ClipboardDocumentListIcon className="w-[18px] h-[18px]" />}>
                {meeting.agenda_items.length === 0 ? (
                    <p className="text-sm text-slate-400">No agenda items.</p>
                ) : (
                    <div className="space-y-2.5">
                        {meeting.agenda_items.map((a, i) => (
                            <div key={a.id} className="flex gap-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                <div>
                                    <p className="text-[13px] font-semibold text-slate-800 dark:text-white">{a.topic}</p>
                                    {a.description && <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{a.description}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            {/* ── Action Items ── */}
            <Section title="Action Items" icon={<ClipboardDocumentListIcon className="w-[18px] h-[18px]" />}>
                {meeting.tasks.length === 0 ? (
                    <p className="text-sm text-slate-400">No action items recorded.</p>
                ) : (
                    <div className="space-y-2.5">
                        {meeting.tasks.map((t) => (
                            <div key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-slate-800 dark:text-white">{t.title}</p>
                                    {t.description && <p className="text-[11px] text-slate-400 mt-0.5">{t.description}</p>}
                                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                                        {t.responsible_person && <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" />{t.responsible_person}</span>}
                                        {t.deadline && <span className="flex items-center gap-1"><CalendarDaysIcon className="w-3 h-3" />Due: {t.deadline}</span>}
                                    </div>
                                </div>
                                <div className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border ${statusColors[t.status] ?? statusColors['Pending']}`}>
                                    {t.status}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            {/* ── Reference Documents ── */}
            {meeting.supporting_documents && meeting.supporting_documents.length > 0 && (
                <Section title="Reference Documents" icon={<DocumentIcon className="w-[18px] h-[18px]" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {meeting.supporting_documents.map((doc, idx) => (
                            <a
                                key={idx}
                                href={`${window.location.protocol}//${window.location.host}/${doc.file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-500/20 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                    <DocumentIcon className="w-5 h-5 text-brand-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-semibold text-slate-800 dark:text-white truncate group-hover:text-brand-600 transition-colors">
                                        {doc.file_path.split('/').pop()?.split('\\').pop()}
                                    </p>
                                    <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">{doc.file_type || 'Document'}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </Section>
            )}

        </div>
    );
}
