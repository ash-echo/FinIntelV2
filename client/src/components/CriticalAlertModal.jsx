import React from 'react';
import { ShieldAlert, XCircle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CriticalAlertModal({ alert, onClose }) {
    if (!alert) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-neutral-900 border-2 border-red-500 rounded-3xl max-w-lg w-full overflow-hidden shadow-[0_0_100px_rgba(255,0,60,0.5)]"
                >
                    <div className="bg-red-600 p-6 flex justify-between items-start">
                        <div className="flex items-center gap-3 text-black">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <ShieldAlert size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Simulation Halted</h2>
                                <p className="font-bold text-xs uppercase tracking-widest opacity-80">Critical Risk Protocol Triggered</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                            <XCircle size={28} className="text-black" />
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="text-center">
                            <div className="inline-block px-4 py-1 rounded-full bg-red-500/10 border border-red-500/40 text-red-500 text-xs font-bold uppercase tracking-widest mb-4">
                                Automatic System Override
                            </div>
                            <p className="text-lg font-medium leading-relaxed text-gray-200">
                                {alert.message}
                            </p>
                            <p className="text-sm font-mono text-gray-400 mt-2">{alert.timestamp}</p>
                        </div>

                        <div className="bg-neutral-950 rounded-xl p-4 border border-white/10 space-y-3">
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span className="text-gray-500">Trigger Source</span>
                                <span className="font-mono text-cyan-400">Manual Injection</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Action Taken</span>
                                <span className="font-bold text-red-500 uppercase flex items-center gap-2">
                                    <Activity size={14} /> Immediate Block
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-red-900/40"
                        >
                            Acknowledge & Dismiss
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
