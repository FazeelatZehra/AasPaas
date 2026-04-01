import React from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, Briefcase, MapPin, ArrowRight, Star } from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const Home = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-orange-600 p-8 md:p-16 text-white">
        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            AasPaas: Your Local Marketplace
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-orange-100"
          >
            Connecting you with small businesses and home-based vendors right in your neighborhood.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Link to="/discover">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
                Explore Nearby
              </Button>
            </Link>
            <Link to="/post-request">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Post a Request
              </Button>
            </Link>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-orange-500 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-orange-700 rounded-full blur-3xl opacity-30" />
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard 
          title="I'm a Customer"
          description="Find unique products and services from local vendors."
          icon={Search}
          link="/discover"
          color="bg-blue-50 text-blue-600"
        />
        <ActionCard 
          title="I'm a Business"
          description="Register your small business and find local customers."
          icon={Briefcase}
          link="/business-registration"
          color="bg-green-50 text-green-600"
        />
        <ActionCard 
          title="Need Something?"
          description="Post a request and let local businesses come to you."
          icon={PlusCircle}
          link="/post-request"
          color="bg-purple-50 text-purple-600"
        />
      </section>

      {/* Categories */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold text-gray-900">Popular Categories</h2>
          <Link to="/discover" className="text-orange-600 font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Food', 'Repairs', 'Home Services', 'Handmade'].map((cat) => (
            <Link 
              key={cat} 
              to={`/discover?category=${cat}`}
              className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <span className="font-semibold text-gray-800">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Nearby Highlights Placeholder */}
      <section className="bg-gray-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
        <div className="max-w-xl relative z-10">
          <h2 className="text-3xl font-bold mb-4">Empowering Local Heroes</h2>
          <p className="text-gray-400 mb-8">
            From the street vendor selling fresh fruit to the home-baker creating masterpieces, 
            AasPaas brings them all to your fingertips.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>Hyperlocal</span>
            </div>
            <div className="w-1 h-1 bg-gray-700 rounded-full" />
            <span>AI-Powered</span>
            <div className="w-1 h-1 bg-gray-700 rounded-full" />
            <span>Community Driven</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-600/20 to-transparent pointer-events-none" />
      </section>
    </div>
  );
};

const ActionCard = ({ title, description, icon: Icon, link, color }: any) => (
  <Link to={link} className={cn("p-6 rounded-2xl border border-transparent hover:border-gray-200 transition-all shadow-sm hover:shadow-md bg-white", color.split(' ')[0])}>
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", color)}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
    <div className="flex items-center gap-1 text-sm font-bold text-orange-600 group">
      Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
);

export default Home;
