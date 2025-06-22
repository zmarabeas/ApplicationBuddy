'use client';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedIcon from '@/components/ui/animated-icon';
import { 
  Chrome, 
  Zap, 
  Shield, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Download,
  Users,
  TrendingUp,
  Star,
  Mail,
  Github,
  Linkedin,
  LogOut
} from 'lucide-react';

export default function LandingPage() {
  const [, navigate] = useLocation();
  const { currentUser, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="fixed w-full bg-background/80 backdrop-blur-md z-50 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <AnimatedIcon size={20} />
              </div>
              <h1 className="text-xl font-bold text-foreground">ApplicationBuddy</h1>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Get Started
                  </Button>
                </>
              )}
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
            <Badge className="mb-6">
              <Chrome className="w-4 h-4 mr-2" />
              Chrome Extension Available
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Automate Your
              <span className="block text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Job Applications
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Stop filling out the same information over and over. Our AI-powered browser extension 
              automatically fills job applications while you focus on what matters - landing interviews.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {currentUser ? (
                <>
                  <Button
                    size="lg"
                    onClick={() => navigate('/dashboard')}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Go to Dashboard
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/resume')}
                    className="border-2 hover:bg-muted transition-all duration-200 px-8 py-3 text-lg"
                  >
                    Upload Resume
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Install Extension
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/register')}
                    className="border-2 hover:bg-muted transition-all duration-200 px-8 py-3 text-lg"
                  >
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </>
              )}
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>10,000+ Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span>4.8/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>95% Success Rate</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your job search experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Install Extension
              </h3>
              <p className="text-muted-foreground">
                Add our Chrome extension to your browser in just one click. 
                No complex setup required.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Build Your Profile
              </h3>
              <p className="text-muted-foreground">
                Create your professional profile once. We'll use this information 
                to fill applications automatically.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Apply with One Click
              </h3>
              <p className="text-muted-foreground">
                Navigate to any job application form and click our extension. 
                Watch as it fills everything automatically.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to streamline your job search
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-all duration-200 border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Smart Auto-Fill
              </h3>
              <p className="text-muted-foreground">
                AI-powered form detection that works on any job application website. 
                No more copy-pasting your information.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-200 border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Secure & Private
              </h3>
              <p className="text-muted-foreground">
                Your data stays on your device. We never store sensitive information 
                and use industry-standard encryption.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-200 border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Save Hours
              </h3>
              <p className="text-muted-foreground">
                What used to take 15 minutes now takes 30 seconds. 
                Apply to 10x more jobs in the same time.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-200 border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Error-Free Applications
              </h3>
              <p className="text-muted-foreground">
                Eliminate typos and formatting errors. Every application 
                looks professional and complete.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-200 border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Track Progress
              </h3>
              <p className="text-muted-foreground">
                Monitor your application status, follow up on responses, 
                and optimize your job search strategy.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-200 border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Works Everywhere
              </h3>
              <p className="text-muted-foreground">
                Compatible with LinkedIn, Indeed, Glassdoor, and thousands 
                of other job sites and company career pages.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who are already saving time and landing more interviews.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {currentUser ? (
              <>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/resume')}
                  className="border-white text-white hover:bg-white/10 transition-all duration-200 px-8 py-3 text-lg"
                >
                  Upload Resume
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/register')}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/help')}
                  className="border-white text-white hover:bg-white/10 transition-all duration-200 px-8 py-3 text-lg"
                >
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/40">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-4">Product</h3>
              <ul className="space-y-3">
                <li><button onClick={() => navigate('/help')} className="text-base text-muted-foreground hover:text-foreground transition-colors">Features</button></li>
                <li><button onClick={() => navigate('/help')} className="text-base text-muted-foreground hover:text-foreground transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate('/help')} className="text-base text-muted-foreground hover:text-foreground transition-colors">Chrome Extension</button></li>
                <li><button onClick={() => navigate('/help')} className="text-base text-muted-foreground hover:text-foreground transition-colors">API</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-4">Company</h3>
              <ul className="space-y-3">
                <li><button onClick={() => navigate('/help')} className="text-base text-muted-foreground hover:text-foreground transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('/help')} className="text-base text-muted-foreground hover:text-foreground transition-colors">Blog</button></li>
                <li><button onClick={() => navigate('/help')} className="text-base text-muted-foreground hover:text-foreground transition-colors">Careers</button></li>
                <li><button onClick={() => navigate('/help')} className="text-base text-muted-foreground hover:text-foreground transition-colors">Press</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><button onClick={() => navigate('/privacy')} className="text-base text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms')} className="text-base text-muted-foreground hover:text-foreground transition-colors">Terms of Service</button></li>
                <li><button onClick={() => navigate('/help')} className="text-base text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</button></li>
                <li><button onClick={() => navigate('/help')} className="text-base text-muted-foreground hover:text-foreground transition-colors">GDPR</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-4">Support</h3>
              <ul className="space-y-3">
                <li><button onClick={() => navigate('/help')} className="text-base text-muted-foreground hover:text-foreground transition-colors">Help Center</button></li>
                <li><button onClick={() => navigate('/help')} className="text-base text-muted-foreground hover:text-foreground transition-colors">Contact Us</button></li>
                <li><button onClick={() => navigate('/status')} className="text-base text-muted-foreground hover:text-foreground transition-colors">Status</button></li>
                <li><button onClick={() => navigate('/help')} className="text-base text-muted-foreground hover:text-foreground transition-colors">Community</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <AnimatedIcon size={20} />
              </div>
              <span className="text-foreground font-semibold">ApplicationBuddy</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <button onClick={() => navigate('/help')} className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('/help')} className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('/help')} className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>&copy; 2025 ApplicationBuddy. All rights reserved. Made with ❤️ for job seekers everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 