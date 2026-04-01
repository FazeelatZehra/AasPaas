import React, { useState } from 'react';
import { Briefcase, Sparkles, MapPin, Phone, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { generateBusinessDescription } from '../lib/gemini';
import { toast } from 'sonner';
import { db, collection, addDoc, doc, updateDoc } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

const BusinessRegistration = () => {
  const { user, isAuthReady } = useAuth();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    phone: '',
    description: ''
  });

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.category || !formData.address) {
      toast.error("Please fill in name, category, and address first");
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await generateBusinessDescription(formData.name, formData.category, formData.address);
      setFormData({ ...formData, description: result });
      toast.success("AI generated a professional description!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate description");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to register a business");
      return;
    }

    setIsSubmitting(true);
    try {
      const businessData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        location: {
          lat: 12.9716, // Placeholder
          lng: 77.5946, // Placeholder
          address: formData.address
        },
        phone: formData.phone,
        ownerId: user.uid,
        createdAt: Date.now(),
        rating: 0
      };

      await addDoc(collection(db, 'businesses'), businessData);
      
      // Update user role to business
      if (user.role !== 'business') {
        await updateDoc(doc(db, 'users', user.uid), { role: 'business' });
      }

      toast.success("Business registered successfully!");
      setStep(2);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'businesses');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthReady) return <div className="p-20 text-center">Loading...</div>;
  if (!user) return <div className="p-20 text-center space-y-4">
    <p className="text-gray-500">Please log in to register your business.</p>
    <Button onClick={() => window.location.href = '/profile'}>Go to Profile</Button>
  </div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Register Your Business</h1>
        <p className="text-gray-500">Join AasPaas and connect with customers in your neighborhood.</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form 
            key="step1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input 
                  label="Business Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., The Local Bakery"
                  required
                />
              </div>
              <Input 
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="e.g., Food, Repair, Service"
                required
              />
              <Input 
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="e.g., +91 98765 43210"
                required
              />
              <div className="md:col-span-2">
                <Input 
                  label="Business Address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="e.g., MG Road, Sector 4, Bangalore"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <div className="flex justify-between items-end">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">
                    Business Description
                  </label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleGenerateDescription}
                    isLoading={isGenerating}
                    className="text-orange-600 hover:text-orange-700 h-auto py-1 px-2"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI Generate
                  </Button>
                </div>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell customers what makes your business special..."
                  className="w-full h-32 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full py-4 text-lg" isLoading={isSubmitting}>
              Register Business <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 bg-white p-12 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Registration Complete!</h2>
              <p className="text-gray-500">Your business is now visible to local customers. Start checking the request feed to find new opportunities.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => window.location.href = '/request-feed'}>
                View Request Feed
              </Button>
              <Button variant="ghost" onClick={() => window.location.href = '/'}>
                Go to Home
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessRegistration;
