'use client';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { FaRocket, FaUserFriends, FaChartLine } from 'react-icons/fa';
import { MdSecurity, MdAccessibility } from 'react-icons/md';

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation */}
      <nav className="fixed w-full bg-background/80 backdrop-blur-sm z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">ApplicationBuddy</h1>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/auth/login')}
                className="text-muted-foreground hover:text-foreground"
              >
                Log in
              </Button>
              <Button
                onClick={() => navigate('/auth/register')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign up
              </Button>
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6">
              Your Job Search,{' '}
              <span className="text-primary">Simplified</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Stop wasting time on repetitive job applications. Let technology work for you, 
              so you can focus on what matters - landing your dream job.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/auth/register')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Your Journey
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">
              Technology That Works For You
            </h2>
            <p className="mt-4 text-xl text-muted-foreground">
              We've built the tools you need to succeed in your job search
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FaRocket className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Smart Auto-Fill
              </h3>
              <p className="text-muted-foreground">
                Fill out job applications in seconds, not hours. Our browser extension does the heavy lifting for you.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FaUserFriends className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Profile Management
              </h3>
              <p className="text-muted-foreground">
                Keep all your professional information in one place. Update once, apply everywhere.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FaChartLine className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Application Tracking
              </h3>
              <p className="text-muted-foreground">
                Never lose track of your applications again. Stay organized and follow up effectively.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Built With Trust & Security
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <MdSecurity className="w-6 h-6 text-primary mt-1" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-foreground">Secure by Design</h3>
                    <p className="text-muted-foreground">Your data is encrypted and protected with industry-leading security.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MdAccessibility className="w-6 h-6 text-primary mt-1" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-foreground">Accessible to All</h3>
                    <p className="text-muted-foreground">Built with accessibility in mind, ensuring everyone can use our platform.</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="p-8">
              <blockquote className="text-muted-foreground italic">
                "ApplicationBuddy transformed my job search. What used to take hours now takes minutes, 
                and I can focus on preparing for interviews instead of filling out forms."
              </blockquote>
              <div className="mt-4 flex items-center space-x-4">
                <Avatar>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">SJ</span>
                  </div>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">Sarah Johnson</p>
                  <p className="text-muted-foreground">Software Engineer</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#" className="text-base text-muted-foreground hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="text-base text-muted-foreground hover:text-foreground">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-muted-foreground hover:text-foreground">About</a></li>
                <li><a href="#" className="text-base text-muted-foreground hover:text-foreground">Blog</a></li>
                <li><a href="#" className="text-base text-muted-foreground hover:text-foreground">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="/privacy" className="text-base text-muted-foreground hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="text-base text-muted-foreground hover:text-foreground">Terms</a></li>
                <li><a href="#" className="text-base text-muted-foreground hover:text-foreground">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Support</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="/help" className="text-base text-muted-foreground hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="text-base text-muted-foreground hover:text-foreground">Contact</a></li>
                <li><a href="#" className="text-base text-muted-foreground hover:text-foreground">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8">
            <p className="text-base text-muted-foreground text-center">
              © 2024 ApplicationBuddy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 