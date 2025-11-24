'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion'; // Import Framer Motion
import { 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  Menu 
} from 'lucide-react';

// --- Animation Variants ---
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* --- Navbar --- */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-6 py-6 flex justify-between items-center"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">N</span>
          </div>
          <span className="text-xl font-bold tracking-tight">nexusHR</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-slate-300 text-sm font-medium">
          <a href="#" className="hover:text-white transition">Features</a>
          <a href="#" className="hover:text-white transition">Benefits</a>
          <a href="#" className="hover:text-white transition">Privacy</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            Request Demo
          </button>
          <button 
            onClick={() => router.push("/signin")}
            className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:border-slate-500 transition"
          >
            Login
          </button>
        </div>

        <button className="md:hidden text-slate-300">
          <Menu size={24} />
        </button>
      </motion.nav>

      {/* --- Hero Section --- */}
      <section className="container mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 variants={fadeIn} className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            The Future of HR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              Management is Here.
            </span>
          </motion.h1>
          <motion.p variants={fadeIn} className="text-slate-400 text-lg mb-8 max-w-lg leading-relaxed">
            nexusHR is the all-in-one platform for managing your team. From seamless onboarding to integrated payroll.
          </motion.p>
          <motion.button 
            variants={fadeIn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/signin")}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition shadow-[0_0_20px_rgba(79,70,229,0.5)] flex items-center gap-2"
          >
            Get Started for Free
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>

        {/* Hero Image / Dashboard Placeholder - With Floating Animation */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="relative bg-[#131824] border border-slate-800 rounded-xl p-4 shadow-2xl aspect-[4/3] flex flex-col overflow-hidden"
          >
            {/* Fake UI Header */}
            <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
               <div className="w-3 h-3 rounded-full bg-red-500"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
               <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            {/* Fake UI Body */}
            <div className="flex-1 grid grid-cols-3 gap-4">
              <div className="col-span-1 bg-slate-800/50 rounded-lg h-full animate-pulse"></div>
              <div className="col-span-2 flex flex-col gap-4">
                <div className="h-32 bg-slate-800/50 rounded-lg w-full"></div>
                <div className="flex-1 bg-slate-800/50 rounded-lg w-full flex items-end p-4 gap-2">
                    <div className="w-1/5 h-1/2 bg-indigo-500 rounded-t"></div>
                    <div className="w-1/5 h-3/4 bg-blue-500 rounded-t"></div>
                    <div className="w-1/5 h-2/3 bg-indigo-500 rounded-t"></div>
                    <div className="w-1/5 h-full bg-blue-500 rounded-t"></div>
                    <div className="w-1/5 h-1/2 bg-indigo-500 rounded-t"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* --- Features Grid --- */}
      <section className="py-24 bg-[#0F131F]">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Everything you need in one powerful platform</h2>
            <p className="text-slate-400">Streamline your HR processes, centralize employee data, and empower your managers with our comprehensive suite of tools.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <FeatureCard 
              icon={<Users className="text-indigo-400" size={28} />}
              title="Employee Profiles"
              desc="Centralize all important information like contracts, working candidates, etc."
            />
            <FeatureCard 
              icon={<Clock className="text-indigo-400" size={28} />}
              title="Time & Attendance"
              desc="Track sick leave, vacation time, and work hours remotely or in office."
            />
             <FeatureCard 
              icon={<CreditCard className="text-indigo-400" size={28} />}
              title="Payroll Integration"
              desc="Run efficient payroll processes with accurate time reports and automation."
            />
             <FeatureCard 
              icon={<TrendingUp className="text-indigo-400" size={28} />}
              title="Performance Upkeep"
              desc="Create clear lines of performance review and feedback for growth."
            />
          </motion.div>
        </div>
      </section>

      {/* --- Split Section --- */}
      <section className="container mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
        >
          <div className="bg-slate-800 h-80 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] to-transparent opacity-60"></div>
            <img 
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000" 
              alt="Meeting" 
              className="w-full h-full object-cover opacity-80 hover:scale-105 transition duration-700"
            />
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, x: 50 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
        >
          <span className="text-indigo-400 font-semibold text-sm tracking-wider uppercase mb-2 block">Benefits</span>
          <h2 className="text-3xl font-bold mb-6">Save Time and Improve Engagement</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
             Sync employee data directly from onboarding to payroll. Give your HR team the automation they need to focus on strategic initiatives instead of paperwork.
          </p>
          
          <ul className="space-y-4">
            {[
              "Streamline HR processes and reduce administrative overhead.",
              "Centralize employee data for easy access and reporting.",
              "Empower managers with tools to handle their own effective teams."
            ].map((item, idx) => (
              <motion.li 
                key={idx} 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={20} />
                <span className="text-slate-300">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* --- Testimonials --- */}
      <section className="py-24 bg-[#0F131F]">
        <div className="container mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16"
          >
            Trusted by HR Leaders Worldwide
          </motion.h2>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            <TestimonialCard 
              quote="nexusHR has completely transformed how we manage our remote teams. It's the single source of truth we needed."
              name="Jane Doe"
              role="HR Director, Acme Co."
              imgUrl="https://i.pravatar.cc/150?u=1"
            />
            <TestimonialCard 
              quote="The automation features have saved us countless hours each week. I can finally focus on culture."
              name="John Smith"
              role="CEO, Tech Global"
              imgUrl="https://i.pravatar.cc/150?u=2"
            />
            <TestimonialCard 
              quote="From onboarding to payroll, everything flows seamlessly. The support team is also incredible."
              name="Sarah Lee"
              role="Operations Manager, BuildIt"
              imgUrl="https://i.pravatar.cc/150?u=3"
            />
          </motion.div>
        </div>
      </section>

      {/* --- Bottom CTA --- */}
      <section className="container mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-12 text-center relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your HR?</h2>
                <p className="text-blue-100 mb-8 max-w-xl mx-auto">Join thousands of companies streamlining their HR with nexusHR. Get started today and see how our platform can help.</p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                    <input 
                        type="email" 
                        placeholder="Enter your email address" 
                        className="px-6 py-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full"
                    />
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg transition whitespace-nowrap"
                    >
                        Get Started
                    </motion.button>
                </div>
            </div>
        </motion.div>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
                 <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center text-white text-xs font-bold">N</div>
                 <span>© 2024 nexusHR Inc.</span>
            </div>
            <div className="flex gap-6">
                <a href="#" className="hover:text-slate-300">Privacy Policy</a>
                <a href="#" className="hover:text-slate-300">Terms of Service</a>
                <a href="#" className="hover:text-slate-300">Contact</a>
            </div>
        </div>
      </footer>

    </div>
  );
}

// --- Helper Components (Wrapped in motion) ---

function FeatureCard({ icon, title, desc }) {
    return (
        <motion.div 
            variants={fadeIn}
            whileHover={{ y: -5 }}
            className="bg-[#131824] p-8 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition duration-300 group"
        >
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </motion.div>
    )
}

function TestimonialCard({ quote, name, role, imgUrl }) {
    return (
        <motion.div 
            variants={fadeIn}
            className="bg-[#131824] p-8 rounded-xl border border-slate-800 relative hover:bg-slate-800/50 transition"
        >
            <p className="text-slate-300 italic mb-6">"{quote}"</p>
            <div className="flex items-center gap-4">
                <img src={imgUrl} alt={name} className="w-12 h-12 rounded-full border-2 border-slate-700" />
                <div>
                    <h4 className="font-bold text-white text-sm">{name}</h4>
                    <p className="text-slate-500 text-xs">{role}</p>
                </div>
            </div>
        </motion.div>
    )
}