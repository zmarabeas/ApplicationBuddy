import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FaRocket, FaUserFriends, FaChartLine } from 'react-icons/fa';
import { MdSecurity, MdAccessibility } from 'react-icons/md';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-indigo-600">ApplicationBuddy</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Log in
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Job Search,{' '}
              <span className="text-indigo-600">Simplified</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Stop wasting time on repetitive job applications. Let technology work for you, 
              so you can focus on what matters - landing your dream job.
            </p>
            <button
              onClick={() => router.push('/signup')}
              className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-4 rounded-lg text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Your Journey
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Technology That Works For You
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              We've built the tools you need to succeed in your job search
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FaRocket className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Auto-Fill
              </h3>
              <p className="text-gray-600">
                Fill out job applications in seconds, not hours. Our browser extension does the heavy lifting for you.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FaUserFriends className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Profile Management
              </h3>
              <p className="text-gray-600">
                Keep all your professional information in one place. Update once, apply everywhere.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FaChartLine className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Application Tracking
              </h3>
              <p className="text-gray-600">
                Never lose track of your applications again. Stay organized and follow up effectively.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Built With Trust & Security
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <MdSecurity className="w-6 h-6 text-indigo-600 mt-1" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Secure by Design</h3>
                    <p className="text-gray-600">Your data is encrypted and protected with industry-leading security.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MdAccessibility className="w-6 h-6 text-indigo-600 mt-1" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Accessible to All</h3>
                    <p className="text-gray-600">Built with accessibility in mind, ensuring everyone can use our platform.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <blockquote className="text-gray-600 italic">
                "ApplicationBuddy transformed my job search. What used to take hours now takes minutes, 
                and I can focus on preparing for interviews instead of filling out forms."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold text-gray-900">Sarah Johnson</p>
                <p className="text-gray-500">Software Engineer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Features</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">About</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Terms</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Contact</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-100 pt-8">
            <p className="text-base text-gray-400 text-center">
              © 2024 ApplicationBuddy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 