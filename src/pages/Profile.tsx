import React, { useState, useEffect } from 'react';
import { User, Briefcase, MapPin, Phone, Mail, Star, Settings, LogOut, ChevronRight, ShieldCheck, Heart, History } from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '../lib/AuthContext';
import { signInWithGoogle, logOut, db, collection, getDocs, query, where } from '../lib/firebase';
import { Business, UserRequest } from '../types';
import { toast } from 'sonner';

const Profile = () => {
  const { user, loading, isAuthReady } = useAuth();
  const [myBusinesses, setMyBusinesses] = useState<Business[]>([]);
  const [myRequestsCount, setMyRequestsCount] = useState(0);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignore this one as it usually happens on double-clicks
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in window was closed before completion.');
      } else {
        toast.error('Failed to sign in. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchMyData = async () => {
        try {
          // Fetch my businesses
          const bQuery = query(collection(db, 'businesses'), where('ownerId', '==', user.uid));
          const bSnapshot = await getDocs(bQuery);
          setMyBusinesses(bSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business)));

          // Fetch my requests count
          const rQuery = query(collection(db, 'requests'), where('userId', '==', user.uid));
          const rSnapshot = await getDocs(rQuery);
          setMyRequestsCount(rSnapshot.size);
        } catch (error) {
          console.error(error);
        }
      };
      fetchMyData();
    }
  }, [user]);

  if (!isAuthReady || loading) return <div className="p-20 text-center">Loading...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center space-y-8 py-20">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
          <User className="w-10 h-10 text-orange-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to AasPaas</h1>
          <p className="text-gray-500">Log in to manage your profile, post requests, and register your business.</p>
        </div>
        <Button 
          onClick={handleSignIn} 
          disabled={isSigningIn}
          className="w-full py-4 text-lg gap-3"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Profile Header */}
      <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-orange-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-12 h-12 text-orange-600" />
            )}
          </div>
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
            <p className="text-gray-500 text-sm flex items-center justify-center md:justify-start gap-1">
              <Mail className="w-4 h-4" /> {user.email}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full uppercase">
                {user.role}
              </span>
            </div>
          </div>
          <div className="md:ml-auto">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="w-4 h-4" /> Edit Profile
            </Button>
          </div>
        </div>
        
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -translate-y-1/2 translate-x-1/2" />
      </section>

      {/* Stats/Quick Info */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Requests" value={myRequestsCount.toString()} />
        <StatCard label="Businesses" value={myBusinesses.length.toString()} />
        <StatCard label="Saved" value="0" />
      </div>

      {/* Menu Sections */}
      <div className="space-y-4">
        {deferredPrompt && (
          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Install AasPaas</h3>
                <p className="text-xs text-gray-500">Access the marketplace directly from your home screen.</p>
              </div>
            </div>
            <Button onClick={handleInstallClick} className="w-full">Install Now</Button>
          </div>
        )}

        <h2 className="text-lg font-bold text-gray-900 ml-2">Account Settings</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <MenuItem icon={History} label="My Requests" description="View and manage your posted requests" />
          <MenuItem icon={Heart} label="Saved Businesses" description="Quick access to your favorite vendors" />
          <MenuItem 
            icon={Briefcase} 
            label={user.role === 'business' ? "Manage Business" : "Register Business"} 
            description={user.role === 'business' ? "Update your business details" : "Start selling on AasPaas"} 
            onClick={() => window.location.href = '/business-registration'} 
          />
          <MenuItem icon={ShieldCheck} label="Privacy & Security" description="Manage your data and account security" />
          <MenuItem icon={LogOut} label="Log Out" description="Sign out of your account" className="text-red-600" onClick={logOut} />
        </div>
      </div>

      {/* Business Section */}
      {myBusinesses.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-900 ml-2">Your Businesses</h2>
          {myBusinesses.map(business => (
            <div key={business.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{business.name}</h3>
                    <p className="text-xs text-gray-500">{business.category} • {business.rating || 'New'} Rating</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const StatCard = ({ label, value }: any) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center space-y-1">
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</p>
  </div>
);

const MenuItem = ({ icon: Icon, label, description, className, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group"
  >
    <div className={cn("w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors", className)}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="text-left flex-1">
      <p className={cn("font-bold text-gray-900", className)}>{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
  </button>
);

export default Profile;
