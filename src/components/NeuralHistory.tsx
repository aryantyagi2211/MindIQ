import { motion } from "framer-motion";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';
import { format } from "date-fns";
import { Brain, TrendingUp, History } from "lucide-react";

interface NeuralHistoryProps {
    history: any[];
}

export default function NeuralHistory({ history }: NeuralHistoryProps) {
    if (!history || history.length === 0) return null;

    const chartData = [...history]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(r => ({
            date: format(new Date(r.created_at), "MMM d"),
            score: r.overall_score,
            fullDate: format(new Date(r.created_at), "PPP"),
        }));

    const latest = history[0];
    const radarData = [
        { subject: 'Logic', value: latest.logic || 0 },
        { subject: 'Creativity', value: latest.creativity || 0 },
        { subject: 'Intuition', value: latest.intuition || 0 },
        { subject: 'EQ', value: latest.emotional_intelligence || 0 },
        { subject: 'Systems', value: latest.systems_thinking || 0 },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Score Evolution Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-2 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                            <TrendingUp className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Neural Evolution</h3>
                            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Score Trend Analysis</p>
                        </div>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="rgba(255,255,255,0.2)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.2)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    border: '1px solid rgba(255,191,0,0.2)',
                                    borderRadius: '12px',
                                    fontSize: '10px'
                                }}
                                itemStyle={{ color: '#eab308' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#eab308"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorScore)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Dimensional Balance (Radar Chart) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />

                <div className="text-center mb-4">
                    <div className="inline-flex p-2 rounded-lg bg-yellow-500/10 mb-2">
                        <Brain className="h-4 w-4 text-yellow-500" />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Cognitive Balance</h3>
                </div>

                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }}
                            />
                            <Radar
                                name="Latest Score"
                                dataKey="value"
                                stroke="#eab308"
                                fill="#eab308"
                                fillOpacity={0.4}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
}
