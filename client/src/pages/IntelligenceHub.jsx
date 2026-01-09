import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Shield, Lock, Globe, Share2, AlertTriangle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const socket = io('http://localhost:3001');

// Mock Correlation Data for Radar Chart (The "Profile" of the attack)
const DEFAULT_RADAR_DATA = [
    { subject: 'Velocity', A: 100, B: 100, fullMark: 150 },
    { subject: 'Amount', A: 100, B: 100, fullMark: 150 },
    { subject: 'Geo-Hop', A: 100, B: 100, fullMark: 150 },
    { subject: 'Device', A: 100, B: 100, fullMark: 150 },
    { subject: 'Time', A: 100, B: 100, fullMark: 150 },
    { subject: 'Pattern', A: 100, B: 100, fullMark: 150 },
];

export default function IntelligenceHub() {
    const [globalStats, setGlobalStats] = useState(null);
    const [riskHistory, setRiskHistory] = useState([]);
    const [radarData, setRadarData] = useState(DEFAULT_RADAR_DATA);

    useEffect(() => {
        const handleStatsUpdate = (data) => {
            setGlobalStats(data.global);

            // Update Radar Chart with Real Backend Data
            if (data.global.vectorStats) {
                setRadarData(data.global.vectorStats);
            }

            setRiskHistory(prev => {
                const point = {
                    time: new Date(data.timestamp).toLocaleTimeString(),
                    risk: Math.round(data.global.averageRiskScore),
                    threat: data.global.threatLevel === 'HIGH' ? 3 : data.global.threatLevel === 'MEDIUM' ? 2 : 1
                };
                return [...prev, point].slice(-30);
            });
        };

        socket.on('stats-update', handleStatsUpdate);
        return () => socket.off('stats-update', handleStatsUpdate);
    }, []);

    if (!globalStats) return <div className="p-10 text-center text-gray-500 font-mono">ESTABLISHING FEDERATED CONNECTION...</div>;

    const threatColor = globalStats.threatLevel === 'HIGH' ? '#ff003c' :
        globalStats.threatLevel === 'MEDIUM' ? '#ffb000' : '#10b981';

    return (
        <div className="grid grid-cols-12 gap-6 pb-10">

            {/* HEADER / THREAT LEVEL */}
            <div className="col-span-12 glass-panel p-8 rounded-2xl flex items-center justify-between overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 blur-xl pointer-events-none" style={{ backgroundColor: threatColor }} />

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="text-gray-400" size={18} />
                        <span className="text-xs font-mono text-gray-500 tracking-widest">ECOSYSTEM STATUS</span>
                    </div>
                    <h1 className="text-4xl font-bold flex items-center gap-4">
                        GLOBAL THREAT LEVEL:
                        <span style={{ color: threatColor }} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                            {globalStats.threatLevel}
                        </span>
                    </h1>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Blocked Threats</p>
                        <p className="text-3xl font-bold">{globalStats.blockedCount}</p>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="text-right">
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Avg Risk Score</p>
                        <p className="text-3xl font-bold" style={{ color: threatColor }}>
                            {Math.round(globalStats.averageRiskScore)}
                        </p>
                    </div>
                </div>
            </div>

            {/* CORE GRAPH: Aggregated Risk Trend */}
            <div className="col-span-8 glass-panel p-6 rounded-xl min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Share2 size={18} className="text-neon-cyan" />
                        Federated Risk Velocity (Aggregated)
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/5 text-xs text-gray-400 relative group cursor-help">
                        <Lock size={12} />
                        <span>Differential Privacy Enabled</span>
                        <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-neutral-900 border border-white/10 rounded shadow-xl text-xs z-50 invisible group-hover:visible">
                            Only statistical aggregates are transmitted. No raw transaction identifiers or PII leave entity nodes.
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={riskHistory}>
                            <defs>
                                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={threatColor} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={threatColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="time" stroke="#444" tick={{ fontSize: 10 }} tickMargin={10} minTickGap={30} />
                            <YAxis stroke="#444" domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                itemStyle={{ color: '#ccc' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="risk"
                                stroke={threatColor}
                                fillOpacity={1}
                                fill="url(#colorRisk)"
                                isAnimationActive={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* SIDEBAR: Correlation Matrix & Stats */}
            <div className="col-span-4 flex flex-col gap-6">

                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => {
                            socket.emit('trigger-cross-bank');
                            alert('Federation Attack Simulation Started: Watch the logs!');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                        <Shield size={16} /> Test Cross-Bank Defense
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 rounded-lg hover:bg-neon-cyan/20 transition-colors">
                        <Share2 size={16} /> Live Network Graph
                    </button>
                </div>

                {/* RADAR CHART: Cross-Entity Correlation */}
                <div className="glass-panel p-6 rounded-xl flex-1 flex flex-col">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <Zap size={18} className="text-neon-amber" />
                        Attack Vector Correlator
                    </h3>
                    <div className="flex-1 min-h-[250px] -ml-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar name="Bank A" dataKey="A" stroke="#00f3ff" fill="#00f3ff" fillOpacity={0.3} />
                                <Radar name="Bank B" dataKey="B" stroke="#ffb000" fill="#ffb000" fillOpacity={0.3} />
                                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-center text-xs text-gray-500 mt-2">
                        Map showing vector similarity between entities. High overlap indicates coordinated attack.
                    </p>
                </div>

                {/* INFO CARD */}
                <div className="glass-panel p-6 rounded-xl">
                    <h4 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                        <Shield size={16} /> PRIVACY GUARANTEE
                    </h4>
                    <ul className="space-y-3 mt-4">
                        <li className="flex items-start gap-3 text-xs text-gray-400">
                            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Raw transactions remain local to Bank A & Bank B.
                        </li>
                        <li className="flex items-start gap-3 text-xs text-gray-400">
                            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Aggregator computes only on statistical distributions.
                        </li>
                        <li className="flex items-start gap-3 text-xs text-gray-400">
                            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Zero-knowledge proof validation enabled (simulated).
                        </li>
                    </ul>
                </div>
            </div>

        </div>
    );
}
