import { Link } from 'react-router-dom';
import { ChefHat, Github, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">RecipeIQ</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              AI-powered recipe recommendations personalized to your taste, dietary needs, and available ingredients.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[Twitter, Github, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              {['Features', 'Pricing', 'Changelog', 'Docs'].map((item) => (
                <li key={item}><Link to="#" className="hover:text-primary-400 transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {['About', 'Blog', 'Privacy', 'Terms'].map((item) => (
                <li key={item}><Link to="#" className="hover:text-primary-400 transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} RecipeIQ. Developed by Ganesh kumar, Rama krishna Sanath, Tharun venkat, Premasree.</p>
          <p className="text-gray-600">Cook Smarter with AI</p>
        </div>
      </div>
    </footer>
  );
}
