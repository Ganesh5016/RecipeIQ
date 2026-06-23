import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ChefHat, Brain, Clock, Shield, TrendingUp, Star, ChevronDown, Check } from 'lucide-react';
import { analyticsAPI } from '../services/api.js';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

function Counter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

const FEATURES = [
  { icon: Brain, title: 'AI-Powered Recommendations', desc: 'Get personalized recipes based on your taste, dietary needs, and available ingredients using advanced Groq AI.' },
  { icon: Sparkles, title: 'Smart Ingredient Matching', desc: 'Enter what you have and get instant recipe suggestions that maximize your ingredient usage.' },
  { icon: ChefHat, title: 'AI Chef Chatbot', desc: 'Get 24/7 cooking guidance, substitution tips, and culinary advice from your personal AI chef.' },
  { icon: TrendingUp, title: 'Nutrition Analyzer', desc: 'Detailed nutritional breakdowns with charts for every recipe to help you meet your health goals.' },
  { icon: Clock, title: 'Meal Planner', desc: 'AI-generated weekly meal plans tailored to your fitness goals, diet, and calorie targets.' },
  { icon: Shield, title: 'Allergy Safe', desc: 'All recommendations respect your dietary restrictions and allergies for safe cooking every time.' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Home Cook', text: 'RecipeIQ transformed how I cook! The AI suggestions are spot-on and I never waste ingredients anymore.', rating: 5, avatar: 'PS' },
  { name: 'Marcus Chen', role: 'Fitness Enthusiast', text: 'The nutrition analyzer and meal planner help me stay on track with my muscle gain goals. Absolutely love it!', rating: 5, avatar: 'MC' },
  { name: 'Ananya Patel', role: 'Busy Parent', text: 'I can plan an entire week of meals in minutes. The grocery list feature is a lifesaver for my family.', rating: 5, avatar: 'AP' },
];

const FAQS = [
  { q: 'How does the AI recipe generation work?', a: 'RecipeIQ uses Groq\'s advanced LLM to analyze your ingredients, dietary preferences, and cooking constraints to generate completely customized recipes in seconds.' },
  { q: 'Is RecipeIQ free to use?', a: 'Yes! RecipeIQ is completely free. Sign up and start generating personalized recipes immediately.' },
  { q: 'Can I save and share my recipes?', a: 'Absolutely. Save recipes to your favorites, export them as PDFs, and build your personal recipe collection.' },
  { q: 'Does it handle dietary restrictions?', a: 'Yes. RecipeIQ supports vegetarian, vegan, keto, paleo, gluten-free, diabetic diets, and specific allergen exclusions.' },
];

export default function LandingPage() {
  const [stats, setStats] = useState({ totalUsers: 10000, totalRecipes: 50000, totalFavorites: 200000 });
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    analyticsAPI.getPublic().then((data) => setStats(data)).catch(() => {});
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center hero-gradient pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
              className="absolute text-4xl opacity-10"
              style={{ left: `${10 + i * 20}%`, top: `${20 + (i % 3) * 20}%` }}
            >
              {['🍕', '🥗', '🍜', '🥘', '🍱'][i]}
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Powered by Groq AI
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              Cook Smarter<br />
              <span className="gradient-text">with AI</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Get personalized recipe recommendations based on your ingredients, dietary needs, and taste preferences. Your AI chef is ready.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-base px-8 py-4">
                Start Cooking Free
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-4">
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto mt-16"
          >
            {[
              { value: stats.totalUsers, suffix: '+', label: 'Users' },
              { value: stats.totalRecipes, suffix: '+', label: 'Recipes' },
              { value: stats.totalFavorites, suffix: '+', label: 'Saved' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-primary-600 dark:text-primary-400">
                  <Counter end={value} suffix={suffix} />
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Everything you need to cook smarter</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              RecipeIQ combines AI intelligence with culinary expertise to transform how you cook.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 hover:border-primary-200 dark:hover:border-primary-800 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">How RecipeIQ Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Three simple steps to your perfect meal</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Tell us what you have', desc: 'Enter your available ingredients, dietary preferences, and cooking constraints.' },
              { step: '2', title: 'AI does the work', desc: 'Our Groq-powered AI analyzes your inputs and generates perfectly matched recipes.' },
              { step: '3', title: 'Cook & enjoy', desc: 'Follow step-by-step instructions, track nutrition, and save your favorites.' },
            ].map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/20">
                  <span className="text-2xl font-black text-white">{step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Loved by home cooks</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, rating, avatar }, i) => (
              <motion.div
                key={name}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{name}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">{q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-500 to-accent-600">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="max-w-3xl mx-auto px-4 text-center"
        >
          <h2 className="text-4xl font-black text-white mb-4">Ready to cook smarter?</h2>
          <p className="text-primary-100 text-lg mb-8">Join thousands of home cooks using AI to transform their kitchen experience.</p>
          <Link to="/register" className="inline-block bg-white text-primary-600 font-bold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors shadow-xl">
            Get Started for Free
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
