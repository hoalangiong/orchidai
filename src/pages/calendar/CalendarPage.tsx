import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCare } from '../../hooks/useCare';
import { useOrchids } from '../../hooks/useOrchids';
import { useAllCareLogs } from '../../hooks/useAllCareLogs';
import { CareTask, CareLog } from '../../types/index';

function getTypeConfig(t: any): Record<CareTask['type'], { label: string; icon: string; bg: string; iconBg: string; dot: string }> {
  return {
    watering:    { label: t('calendar.types.watering'), icon: '💧', bg: 'bg-blue-50 border-blue-100',    iconBg: 'bg-blue-100',   dot: 'bg-blue-400' },
    fertilizing: { label: t('calendar.types.fertilizing'),  icon: '🌱', bg: 'bg-green-50 border-green-100',  iconBg: 'bg-green-100',  dot: 'bg-green-500' },
    repotting:   { label: t('calendar.types.repotting'), icon: '🪴', bg: 'bg-orange-50 border-orange-100',iconBg: 'bg-orange-100', dot: 'bg-orange-400' },
    pruning:     { label: t('calendar.types.pruning'),   icon: '✂️', bg: 'bg-purple-50 border-purple-100',iconBg: 'bg-purple-100', dot: 'bg-purple-400' },
    other:       { label: t('calendar.types.other'),      icon: '📝', bg: 'bg-gray-50 border-gray-100',    iconBg: 'bg-gray-100',   dot: 'bg-gray-400' },
  };
}

function getLogConfig(t: any): Record<CareLog['type'], { label: string; icon: string }> {
  return {
    watering:    { label: t('calendar.types.watering'),  icon: '💧' },
    fertilizing: { label: t('calendar.types.fertilizing'),   icon: '🌱' },
    repotting:   { label: t('calendar.types.repotting'),  icon: '🪴' },
    pruning:     { label: t('calendar.types.pruning'),    icon: '✂️' },
    blooming:    { label: t('calendar.types.blooming'),      icon: '🌸' },
    other:       { label: t('calendar.types.other'),        icon: '📝' },
  };
}

function getWeekdays(t: any): string[] {
  return [
    t('calendar.weekdays.mon'),
    t('calendar.weekdays.tue'),
    t('calendar.weekdays.wed'),
    t('calendar.weekdays.thu'),
    t('calendar.weekdays.fri'),
    t('calendar.weekdays.sat'),
    t('calendar.weekdays.sun')
  ];
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const { t } = useTranslation();
  const { tasks, todayTasks, upcomingTasks, completedTasks, addTask, completeTask, deleteTask } = useCare();
  const { orchids } = useOrchids();
  const { logs } = useAllCareLogs();
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'today' | 'upcoming' | 'done' | 'logs'>('today');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [form, setForm] = useState({
    orchidId: '', type: 'watering' as CareTask['type'],
    scheduledDate: new Date().toISOString().split('T')[0],
    notes: '', isCompleted: false,
  });

  const TYPE_CONFIG = getTypeConfig(t);
  const LOG_CONFIG = getLogConfig(t);
  const WEEKDAYS = getWeekdays(t);

  const todayStr = new Date().toISOString().split('T')[0];

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const { year, month } = viewMonth;
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    // Convert to Mon-first: Mon=0 ... Sun=6
    const offset = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ day: number | null; dateStr: string | null }> = [];
    for (let i = 0; i < offset; i++) cells.push({ day: null, dateStr: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, dateStr: toDateStr(year, month, d) });
    return cells;
  }, [viewMonth]);

  // Map dateStr -> task types for dot display
  const taskDotMap = useMemo(() => {
    const map: Record<string, Set<CareTask['type']>> = {};
    for (const t of tasks) {
      if (!t.isCompleted) {
        if (!map[t.scheduledDate]) map[t.scheduledDate] = new Set();
        map[t.scheduledDate].add(t.type);
      }
    }
    return map;
  }, [tasks]);

  const prevMonth = () => setViewMonth(({ year, month }) =>
    month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
  const nextMonth = () => setViewMonth(({ year, month }) =>
    month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    addTask(form);
    setForm({ orchidId: '', type: 'watering', scheduledDate: new Date().toISOString().split('T')[0], notes: '', isCompleted: false });
    setShowForm(false);
  };

  const monthLabel = new Date(viewMonth.year, viewMonth.month).toLocaleDateString(t('calendar.locale'), { month: 'long', year: 'numeric' });

  // Tasks to show in list: if a date is selected, show that day; else use tab
  const listTasks = selectedDate
    ? tasks.filter(t => t.scheduledDate === selectedDate)
    : tab === 'today' ? todayTasks : tab === 'upcoming' ? upcomingTasks : completedTasks;

  const tabCounts = { today: todayTasks.length, upcoming: upcomingTasks.length, done: completedTasks.length, logs: logs.length };

  // Logs filtered by selected date
  const displayLogs = selectedDate ? logs.filter(l => l.date === selectedDate) : logs;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('calendar.title')}</h1>
          <p className="text-sm text-gray-400">{t('calendar.todayTasks', { count: todayTasks.length })}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">
          {t('calendar.addSchedule')}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-4 space-y-4 border border-green-50">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">{t('calendar.addCareSchedule')}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 text-lg">✕</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">{t('calendar.careType')}</label>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.entries(TYPE_CONFIG) as [CareTask['type'], typeof TYPE_CONFIG['watering']][]).map(([key, cfg]) => (
                <button key={key} type="button" onClick={() => setForm(p => ({ ...p, type: key }))}
                  className={`flex flex-col items-center py-2 rounded-xl border text-xs transition-all ${form.type === key ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-100 bg-gray-50 text-gray-500'}`}>
                  <span className="text-xl mb-0.5">{cfg.icon}</span>
                  <span className="leading-tight text-center" style={{ fontSize: '10px' }}>{cfg.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">{t('calendar.orchidRequired')}</label>
            <select required value={form.orchidId} onChange={e => setForm(p => ({ ...p, orchidId: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50">
              <option value="">{t('calendar.selectOrchid')}</option>
              {orchids.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            {orchids.length === 0 && <p className="text-xs text-red-400 mt-1">{t('calendar.noOrchidsWarning')}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">{t('calendar.scheduledDate')}</label>
            <input type="date" value={form.scheduledDate} onChange={e => setForm(p => ({ ...p, scheduledDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">{t('calendar.notes')}</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={2} placeholder={t('calendar.notesPlaceholder')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 resize-none" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600">{t('common.cancel')}</button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl py-2.5 text-sm font-semibold">{t('calendar.saveSchedule')}</button>
          </div>
        </form>
      )}

      {/* Monthly calendar grid */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100">‹</button>
          <p className="text-sm font-bold text-gray-800 capitalize">{monthLabel}</p>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100">›</button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {calendarDays.map((cell, i) => {
            if (!cell.day || !cell.dateStr) return <div key={i} />;
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDate;
            const dots = taskDotMap[cell.dateStr];
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(prev => prev === cell.dateStr ? null : cell.dateStr!)}
                className={`relative flex flex-col items-center justify-center h-9 rounded-xl text-sm font-medium transition-all
                  ${isSelected ? 'bg-green-500 text-white' : isToday ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {cell.day}
                {dots && dots.size > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from(dots).slice(0, 3).map(type => (
                      <span key={type} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/80' : TYPE_CONFIG[type].dot}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date label or tabs */}
      {selectedDate ? (
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">
            📅 {new Date(selectedDate + 'T00:00:00').toLocaleDateString(t('calendar.locale'), { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <button onClick={() => setSelectedDate(null)} className="text-xs text-gray-400 underline">{t('calendar.clearSelection')}</button>
        </div>
      ) : (
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['today', 'upcoming', 'done', 'logs'] as const).map(key => {
            const labels = {
              today: t('calendar.tabs.today'),
              upcoming: t('calendar.tabs.upcoming'),
              done: t('calendar.tabs.done'),
              logs: t('calendar.tabs.logs')
            };
            const count = tabCounts[key];
            return (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${tab === key ? 'bg-white shadow-sm text-green-700' : 'text-gray-400'}`}>
                {labels[key]}
                {count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${tab === key ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Logs tab */}
      {tab === 'logs' && !selectedDate && (
        displayLogs.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-3xl">📋</div>
            <p className="text-gray-400 text-sm">{t('calendar.noLogs')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayLogs.map(log => {
              const orchid = orchids.find(o => o.id === log.orchidId);
              const lc = LOG_CONFIG[log.type] ?? LOG_CONFIG.other;
              return (
                <div key={log.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-start gap-3">
                  <span className="text-xl mt-0.5">{lc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-800">{lc.label}</span>
                      <span className="text-xs text-gray-400 shrink-0">{log.date}</span>
                    </div>
                    <p className="text-xs text-green-600 font-medium truncate mt-0.5">🌺 {orchid?.name ?? t('calendar.unknownOrchid')}</p>
                    {log.note && <p className="text-xs text-gray-500 mt-0.5">{log.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Selected date logs */}
      {selectedDate && (
        displayLogs.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-gray-400 text-sm">{t('calendar.noLogsThisDay')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayLogs.map(log => {
              const orchid = orchids.find(o => o.id === log.orchidId);
              const lc = LOG_CONFIG[log.type] ?? LOG_CONFIG.other;
              return (
                <div key={log.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-start gap-3">
                  <span className="text-xl mt-0.5">{lc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-800">{lc.label}</span>
                      <span className="text-xs text-gray-400 shrink-0">{log.date}</span>
                    </div>
                    <p className="text-xs text-green-600 font-medium truncate mt-0.5">🌺 {orchid?.name ?? t('calendar.unknownOrchid')}</p>
                    {log.note && <p className="text-xs text-gray-500 mt-0.5">{log.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Task list (không hiện khi đang ở tab logs) */}
      {tab !== 'logs' && !selectedDate && (
        listTasks.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-3xl">📅</div>
            <p className="text-gray-400 text-sm">{t('calendar.noSchedules')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {listTasks.map(task => {
              const orchid = orchids.find(o => o.id === task.orchidId);
              const cfg = TYPE_CONFIG[task.type];
              return (
                <div key={task.id} className={`rounded-2xl border p-4 ${cfg.bg}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${cfg.iconBg} flex items-center justify-center text-2xl shrink-0`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">{cfg.label}</div>
                      <div className="text-xs text-gray-500 truncate">🌺 {orchid?.name ?? t('calendar.unknownOrchid')}</div>
                      <div className="text-xs text-gray-400">📅 {task.scheduledDate}</div>
                      {task.notes && <div className="text-xs text-gray-500 mt-1 italic">{task.notes}</div>}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {!task.isCompleted && (
                        <button onClick={() => completeTask(task.id)}
                          className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                          {t('calendar.markDone')}
                        </button>
                      )}
                      <button onClick={() => deleteTask(task.id)}
                        className="text-red-400 bg-red-50 px-3 py-1.5 rounded-lg text-xs border border-red-100">
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Task list khi chọn ngày */}
      {selectedDate && listTasks.length > 0 && (
        <div className="space-y-2">
          {listTasks.map(task => {
            const orchid = orchids.find(o => o.id === task.orchidId);
            const cfg = TYPE_CONFIG[task.type];
            return (
              <div key={task.id} className={`rounded-2xl border p-4 ${cfg.bg}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl ${cfg.iconBg} flex items-center justify-center text-2xl shrink-0`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{cfg.label}</div>
                    <div className="text-xs text-gray-500 truncate">🌺 {orchid?.name ?? t('calendar.unknownOrchid')}</div>
                    <div className="text-xs text-gray-400">📅 {task.scheduledDate}</div>
                    {task.notes && <div className="text-xs text-gray-500 mt-1 italic">{task.notes}</div>}
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {!task.isCompleted && (
                      <button onClick={() => completeTask(task.id)}
                        className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                        {t('calendar.markDone')}
                      </button>
                    )}
                    <button onClick={() => deleteTask(task.id)}
                      className="text-red-400 bg-red-50 px-3 py-1.5 rounded-lg text-xs border border-red-100">
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
