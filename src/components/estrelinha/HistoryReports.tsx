import { AppState, HistoryLog } from '@/hooks/useAppData';
import { useMemo } from 'react';

interface Props {
    state: AppState;
}

export default function HistoryReports({ state }: Props) {
    const history = state.history || [];

    const stats = useMemo(() => {
        const totalTasks = history.filter(h => h.type === 'task_completed').length;
        const totalRewards = history.filter(h => h.type === 'reward_redeemed').length;
        const starsEarned = history.filter(h => h.points > 0).reduce((acc, curr) => acc + curr.points, 0);
        const starsSpent = Math.abs(history.filter(h => h.points < 0).reduce((acc, curr) => acc + curr.points, 0));

        return { totalTasks, totalRewards, starsEarned, starsSpent };
    }, [history]);

    // Group history by date
    const groupedHistory = useMemo(() => {
        const groups: Record<string, HistoryLog[]> = {};
        history.forEach(h => {
            const date = new Date(h.timestamp).toLocaleDateString('pt-BR');
            if (!groups[date]) groups[date] = [];
            groups[date].push(h);
        });
        // Sort dates descending
        return Object.entries(groups).sort((a, b) =>
            new Date(b[0].split('/').reverse().join('-')).getTime() -
            new Date(a[0].split('/').reverse().join('-')).getTime()
        );
    }, [history]);

    if (history.length === 0) {
        return (
            <div className="text-center p-10 text-slate-400">
                <i className="fa-solid fa-chart-line text-4xl mb-4"></i>
                <p>Ainda não há histórico de atividades.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100 shadow-sm">
                    <div className="text-sm text-green-600 font-bold uppercase tracking-wider mb-1">Tarefas Feitas</div>
                    <div className="text-3xl font-bold text-green-700">{stats.totalTasks}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 shadow-sm">
                    <div className="text-sm text-yellow-600 font-bold uppercase tracking-wider mb-1">Total Estrelas</div>
                    <div className="text-3xl font-bold text-yellow-700">{stats.starsEarned}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm">
                    <div className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-1">Recompensas</div>
                    <div className="text-3xl font-bold text-blue-700">{stats.totalRewards}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 shadow-sm">
                    <div className="text-sm text-purple-600 font-bold uppercase tracking-wider mb-1">Estrelas Gastas</div>
                    <div className="text-3xl font-bold text-purple-700">{stats.starsSpent}</div>
                </div>
            </div>

            {/* History List */}
            <div>
                <h3 className="font-bold text-slate-700 mb-4 px-1">Histórico de Atividades</h3>
                <div className="space-y-6">
                    {groupedHistory.map(([date, items]) => (
                        <div key={date}>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1 bg-slate-100 inline-block px-2 py-1 rounded-lg">
                                {date}
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                                {items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((item) => (
                                    <div key={item.id} className="p-4 flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border-2 ${item.type === 'task_completed' ? 'bg-green-100 text-green-600 border-green-200' :
                                                item.type === 'reward_redeemed' ? 'bg-yellow-100 text-yellow-600 border-yellow-200' :
                                                    item.points > 0 ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-red-100 text-red-600 border-red-200'
                                            }`}>
                                            <i className={`fa-solid ${item.type === 'task_completed' ? 'fa-check' :
                                                    item.type === 'reward_redeemed' ? 'fa-gift' :
                                                        item.points > 0 ? 'fa-plus' : 'fa-minus'
                                                }`}></i>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-700">{item.title}</div>
                                            <div className="text-xs text-slate-400">
                                                {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className={`font-bold text-lg ${item.points > 0 ? 'text-green-500' : 'text-slate-400'}`}>
                                            {item.points > 0 ? '+' : ''}{item.points}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
