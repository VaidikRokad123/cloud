import { Link } from 'react-router-dom';
import { HiOutlineCloud, HiOutlineChartBar, HiOutlineLightningBolt, HiOutlineShieldCheck, HiArrowRight } from 'react-icons/hi';

const features = [
  {
    icon: HiOutlineChartBar,
    title: 'Real-time Analytics',
    desc: 'Track spending across AWS, Azure, and GCP with interactive dashboards and trend analysis.',
  },
  {
    icon: HiOutlineLightningBolt,
    title: 'Smart Optimization',
    desc: 'AI-powered suggestions to reduce costs, right-size instances, and eliminate idle resources.',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Budget Alerts',
    desc: 'Set thresholds and receive alerts before you overspend across any provider or service.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary-950 text-white flex flex-col">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 lg:px-12 h-16 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <HiOutlineCloud className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">CloudCost</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded-lg transition-colors"
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium text-primary-300 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Now monitoring 3 cloud providers
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-5">
            Take control of your
            <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent"> cloud costs</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Monitor, analyze, and optimize your cloud infrastructure spending across AWS, Azure, and Google Cloud — all in one unified dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary-600/25 hover:shadow-primary-500/40"
            >
              Get Started Free
              <HiArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium px-6 py-3 rounded-xl transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-20 max-w-4xl mx-auto w-full">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/5 rounded-xl p-5 text-left hover:bg-white/[0.07] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-600">
        © 2024 CloudCost. Built for modern infrastructure teams.
      </footer>
    </div>
  );
}
