import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Share2, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function FeatureCard({ icon: Icon, title, description, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass-panel p-6 rounded-xl hover:bg-white/5 transition-colors group cursor-default"
        >
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon size={24} className="text-neon-cyan" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white/90">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </motion.div>
    );
}

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[85vh] relative overflow-hidden">

            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/20 blur-[120px] rounded-full pointer-events-none opacity-30" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center z-10 max-w-4xl"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neon-cyan mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                    PRIVACY-PRESERVING INTELLIGENCE V1.0
                </div>

                <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
                    <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                        Collaborative Fraud
                    </span>
                    <span className="block text-white neon-text-cyan">
                        Detection Network
                    </span>
                </h1>

                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                    Unite independent financial institutions against global threats.
                    Share risk signals, not data. Detect sophisticated attacks in real-time.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <Link to="/intelligence" className="group relative px-8 py-4 rounded-lg bg-neon-cyan text-black font-bold tracking-wide overflow-hidden">
                        <span className="relative z-10 flex items-center gap-2">
                            ENTER COMMAND CENTER <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-white/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Link>
                    <Link to="/bank-a" className="px-8 py-4 rounded-lg glass-panel hover:bg-white/10 transition-colors font-medium text-white">
                        VIEW SIMULATION NODES
                    </Link>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-5xl z-10">
                <FeatureCard
                    icon={Shield}
                    title="Entity Isolation"
                    description="Each bank operates a completely independent risk node. Raw transaction data never leaves the premises."
                    delay={0.2}
                />
                <FeatureCard
                    icon={Share2}
                    title="Federated Aggregation"
                    description="Only anonymous risk scores and vectors are shared to calculate the Global Threat Level."
                    delay={0.4}
                />
                <FeatureCard
                    icon={Lock}
                    title="Zero-Knowledge Insights"
                    description="Gain ecosystem-wide visibility into attack patterns without exposing customer PII."
                    delay={0.6}
                />
            </div>
        </div>
    );
}
