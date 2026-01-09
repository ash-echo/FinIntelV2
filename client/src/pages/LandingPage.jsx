import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Share2, Lock, ArrowRight, Activity, Terminal, Database, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- COMPONENTS ---

function FeatureCard({ icon: Icon, title, description, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            viewport={{ once: true }}
            className="glass-panel p-8 rounded-xl hover:bg-white/5 transition-colors group cursor-default border border-white/5 hover:border-neon-cyan/30"
        >
            <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <Icon size={28} className="text-neon-cyan" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white/90">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </motion.div>
    );
}

function SectionHelper({ title, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center max-w-4xl mx-auto"
        >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white mb-8">
                {title}
            </h2>
            <div className="text-lg text-gray-400 leading-relaxed">
                {children}
            </div>
        </motion.div>
    )
}

export default function LandingPage() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-neon-cyan selection:text-black overflow-x-hidden">

            {/* HERO SECTION */}
            <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
                {/* Background FX */}
                <motion.div style={{ y: y1 }} className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-neon-cyan/10 blur-[150px] rounded-full pointer-events-none opacity-40 mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-[0.03] z-0 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="z-10 max-w-5xl"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neon-cyan mb-8 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_10px_#00f3ff]" />
                        v2.0 • AI-POWERED • ZERO TRUST
                    </div>

                    <h1 className="text-7xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
                        <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">
                            The Future of
                        </span>
                        <span className="block text-white neon-text-cyan pb-4">
                            Fraud Intelligence.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                        The world's first <span className="text-neon-cyan font-bold">Privacy-Preserving Federated Network</span>.
                        Detect sophisticated attacks in real-time without ever sharing customer data.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link to="/intelligence" className="group relative px-10 py-5 rounded-lg bg-neon-cyan text-black font-bold tracking-wide overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.3)] hover:shadow-[0_0_50px_rgba(0,243,255,0.5)] transition-all">
                            <span className="relative z-10 flex items-center gap-2">
                                ENTER WAR ROOM <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-white/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Link>
                        <Link to="/bank-a" className="px-10 py-5 rounded-lg glass-panel hover:bg-white/10 transition-all font-medium text-white border border-white/10 flex items-center gap-3">
                            <Activity size={20} className="text-neon-cyan" /> VIEW NODE: BANK A
                        </Link>
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 text-sm font-mono flex flex-col items-center gap-2"
                >
                    SCROLL TO EXPLORE
                    <div className="w-px h-12 bg-gradient-to-b from-neon-cyan/50 to-transparent" />
                </motion.div>
            </section>


            {/* ARCHITECTURE REVEAL */}
            <section className="py-32 px-4 relative z-10 bg-black/50 backdrop-blur-sm border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <SectionHelper title="Zero-Trust Architecture">
                        <p>
                            Traditional consortiums require banks to upload sensitive customer data to a central server. This is a privacy nightmare and a regulatory violation.
                            <br /><br />
                            <span className="text-white font-bold">Sentinel Core is different.</span> We use a Hub-and-Spoke model where raw data <span className="text-neon-cyan">never leaves the bank</span>.
                        </p>
                    </SectionHelper>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                        <img
                            src="/assets/architecture.png"
                            alt="Sentinel Core Architecture"
                            className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700 hover:scale-[1.02] transition-transform"
                        />

                        <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-black to-transparent">
                            <h3 className="text-3xl font-bold text-neon-cyan mb-2">Federated Learning Grid</h3>
                            <p className="text-gray-300">Gradients (math), not data (names), are shared to the Hub.</p>
                        </div>
                    </motion.div>
                </div>
            </section>


            {/* FEATURES GRID */}
            <section className="py-32 px-4 relative z-10 bg-[#080808]">
                <div className="max-w-7xl mx-auto">
                    <SectionHelper title="Defense in Depth">
                        <p>A multi-layered security approach combining local heuristics with global intelligence.</p>
                    </SectionHelper>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={Shield}
                            title="Entity Isolation"
                            description="Each bank operates a completely independent risk node. Raw transaction data is processed on-premise."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={Server}
                            title="Gradient Sync"
                            description="Only anonymous model weight updates are transmitted. Impossible to reverse-engineer user PII."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={Database}
                            title="Graph AI"
                            description="Simulated Graph Neural Networks analyze relationship depth between wallets and IPs."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={Terminal}
                            title="Auto-Circuit Breaker"
                            description="System automatically halts settlement pipelines when global threat levels exceed 95%."
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>


            {/* WORKFLOW WALKTHROUGH */}
            <section className="py-32 px-4 relative z-10 border-t border-white/5 bg-gradient-to-b from-black to-[#0a0a0a]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">
                                The <span className="text-neon-cyan">Immunity Loop</span>
                            </h2>
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                                When Bank A is attacked, it doesn't suffer in silence. It "learns" the attack signature and uploads it to the grid.
                                <br /><br />
                                <strong className="text-white">Bank B becomes immune instantly.</strong>
                            </p>

                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-bold border border-red-500/30">1</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">Attack Injection</h4>
                                        <p className="text-sm text-gray-500">Botnet targets Bank A with high-velocity transactions.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center text-neon-cyan font-bold border border-neon-cyan/30">2</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">Learning Phase</h4>
                                        <p className="text-sm text-gray-500">Bank A's active model captures the pattern vector.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold border border-purple-500/30">3</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">Global Broadcasting</h4>
                                        <p className="text-sm text-gray-500">Hub validates the signature and patches all other nodes.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.15)] border border-white/10"
                        >
                            <img src="/assets/workflow.png" alt="Workflow" className="w-full" />
                        </motion.div>
                    </div>
                </div>
            </section>


            {/* CALL TO ACTION */}
            <section className="py-40 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/10 blur-[150px] rounded-full pointer-events-none opacity-20" />

                <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white relative z-10">
                    Ready to Deploy?
                </h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
                    <Link to="/intelligence" className="px-12 py-6 rounded-lg bg-neon-cyan text-black font-extrabold text-lg tracking-wide hover:scale-105 transition-transform shadow-[0_0_40px_rgba(0,243,255,0.4)]">
                        LAUNCH INTELLIGENCE HUB
                    </Link>
                </div>
            </section>

            <footer className="py-12 border-t border-white/10 text-center text-gray-600 text-sm">
                <p>INSTITUTIONAL GRADE SECURITY SIMULATION</p>
                <p className="mt-2 text-xs opacity-50">Deployed: Localhost Environment • v2.0.4-Build</p>
            </footer>

        </div>
    );
}
