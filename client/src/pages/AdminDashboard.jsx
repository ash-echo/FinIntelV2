import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, Clock, AlertCircle, Server, Shield, Activity, Play, Square } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import socket from '../services/socket';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
    const [isSimRunning, setIsSimRunning] = useState(false);
    const [stats, setStats] = useState({
        blockedCount: 0,
        averageRiskScore: 0,
        threatLevel: 'LOW',
        activeNodes: 2
    });

    // Live Audit Log State
    const [auditLogs, setAuditLogs] = useState([
        { id: 1, time: new Date().toLocaleTimeString(), message: 'System initialized. Waiting for federation handshake...', type: 'info' }
    ]);

    // Live Chart Data (Initialize with empty timeframe to show grid)
    const [chartData, setChartData] = useState(() => {
        return Array(20).fill(0).map((_, i) => ({
            time: new Date(Date.now() - (20 - i) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            risk: 0,
            blocks: 0
        }));
    });

    useEffect(() => {
        // 1. Sync Sim Status
        socket.on('sim-status', (status) => setIsSimRunning(status));
        socket.emit('get-sim-status');

        // 2. Listen for Stats Updates
        const handleStats = (data) => {
            const global = data.global;
            setStats(prev => ({
                ...prev,
                blockedCount: global.blockedCount,
                averageRiskScore: global.averageRiskScore,
                threatLevel: global.threatLevel
            }));

            // Update Chart
            setChartData(prev => {
                const newData = [...prev, {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    risk: Math.round(global.averageRiskScore),
                    blocks: global.blockedCount
                }];
                return newData.slice(-20); // Keep last 20 points
            });
        };
        socket.on('stats-update', handleStats);

        // 3. Listen for Critical Alerts (Audit Log)
        const handleCritical = (alert) => {
            addLog(alert.message, 'critical');
        };
        socket.on('critical-stop', handleCritical);

        return () => {
            socket.off('sim-status');
            socket.off('stats-update', handleStats);
            socket.off('critical-stop', handleCritical);
        };
    }, []);

    // Helper to add logs
    const addLog = (message, type = 'info') => {
        setAuditLogs(prev => [{
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            message,
            type
        }, ...prev].slice(0, 50));
    };

    const handleExport = () => {
        // Generate Mock ISO-20022 Style CSV
        const headers = "MsgId,CreDtTm,InitgPty,Sts,RskScr,Dtl";
        const rows = auditLogs.map(log => {
            const cleanMsg = log.message.replace(/,/g, ' '); // simple escape
            return `MSG-${log.id},${log.time},ADMIN_NODE,${log.type.toUpperCase()},${stats.averageRiskScore},${cleanMsg}`;
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ISO-20022_Compliance_Report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addLog('ISO-20022 Report Generated & Downloaded', 'success');
    };

    const toggleSim = () => {
        if (isSimRunning) {
            socket.emit('stop-sim');
            addLog('Administrator manually halted simulation', 'warning');
        } else {
            socket.emit('start-sim');
            addLog('Administrator started federation simulation', 'success');
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Shield className="text-neon-cyan" /> Compliance & Audit Logs
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Real-time regulatory oversight and node governance</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={toggleSim}
                        className={`px-6 py-3 font-bold rounded-lg transition-all flex items-center gap-3 shadow-lg ${isSimRunning
                            ? 'bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                            : 'bg-neon-cyan/10 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black'
                            }`}
                    >
                        {isSimRunning ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                        {isSimRunning ? 'HALT SIMULATION' : 'INITIATE SIMULATION'}
                    </button>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors text-gray-300"
                    >
                        <Download size={18} /> Export ISO-20022 Report
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard
                    icon={Server}
                    label="Active Nodes"
                    value={stats.activeNodes}
                    subValue="Bank A, Bank B Online"
                    color="text-emerald-400"
                    bg="bg-emerald-500/10"
                />
                <KPICard
                    icon={Activity}
                    label="Avg Risk Score"
                    value={Math.round(stats.averageRiskScore)}
                    subValue="Global Average"
                    color="text-blue-400"
                    bg="bg-blue-500/10"
                />
                <KPICard
                    icon={Shield}
                    label="Threats Blocked"
                    value={stats.blockedCount}
                    subValue="Since System Start"
                    color="text-amber-400"
                    bg="bg-amber-500/10"
                />
                <KPICard
                    icon={AlertCircle}
                    label="Compliance Status"
                    value={stats.threatLevel}
                    subValue="Current HE Level"
                    color={stats.threatLevel === 'HIGH' ? 'text-red-500' : 'text-emerald-500'}
                    bg={stats.threatLevel === 'HIGH' ? 'bg-red-500/10' : 'bg-emerald-500/10'}
                />
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-12 gap-6">

                {/* Left: Real-Time Chart */}
                <div className="col-span-12 lg:col-span-8 glass-panel p-6 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-300 flex items-center gap-2">
                            <Activity size={18} className="text-neon-cyan" />
                            LIVE COMPLIANCE VELOCITY
                        </h3>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Risk Score
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-red-500/50"></span> Blocking Events
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="time" stroke="#666" fontSize={10} tickMargin={10} />
                                <YAxis stroke="#666" fontSize={10} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="risk"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRisk)"
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Live Audit Log */}
                <div className="col-span-12 lg:col-span-4 glass-panel p-0 rounded-xl overflow-hidden flex flex-col border border-white/5 h-[450px]">
                    <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                        <h3 className="font-bold text-gray-300 flex items-center gap-2">
                            <FileText size={16} /> IMMUTABLE AUDIT LOG
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                            SECURE
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        <AnimatePresence initial={false}>
                            {auditLogs.map((log) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`p-3 rounded-lg border text-sm ${log.type === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                                        log.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' :
                                            log.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' :
                                                'bg-white/5 border-white/5 text-gray-300'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] font-mono px-1.5 rounded ${log.type === 'critical' ? 'bg-red-500 text-black' : 'bg-white/10 text-gray-400'
                                            }`}>
                                            {log.time}
                                        </span>
                                        {log.type === 'critical' && <AlertCircle size={12} className="text-red-500" />}
                                    </div>
                                    <p className="leading-snug">{log.message}</p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Sub-Component for KPI Cards
function KPICard({ icon: Icon, label, value, subValue, color, bg }) {
    return (
        <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors group">
            <div className={`p-4 rounded-lg ${bg} ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{label}</p>
                <p className="text-2xl font-bold text-white my-0.5">{value}</p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    {subValue}
                </p>
            </div>
        </div>
    );
}
