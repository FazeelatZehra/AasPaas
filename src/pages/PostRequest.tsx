import React, { useState } from 'react';
import { PlusCircle, Sparkles, MapPin, Calendar, IndianRupee, ArrowRight, CheckCircle2 } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { parseRequestText } from '../lib/gemini';
import { toast } from 'sonner';
import { db, collection, addDoc } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

const PostRequest = () => {
  const { user, isAuthReady } = useAuth();
  const [step, setStep] = useState(1);
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: '',
    urgency: 'medium' as 'low' | 'medium' | 'high'
  });

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await parseRequestText(rawText);
      setFormData({
        title: result.suggestedTitle || '',
        description: result.suggestedDescription || '',
        budget: result.budget?.toString() || '',
        deadline: '',
        category: result.category || '',
        urgency: result.urgency || 'medium'
      });
      setStep(2);
      toast.success("AI improved your request!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze request");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to post a request");
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        title: formData.title,
        description: formData.description,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        deadline: formData.deadline,
        category: formData.category,
        urgency: formData.urgency,
        location: {
          lat: 12.9716, // Placeholder
          lng: 77.5946, // Placeholder
          address: "Bangalore, India" // Placeholder
        },
        userId: user.uid,
        createdAt: Date.now(),
        status: 'open'
      };

      await addDoc(collection(db, 'requests'), requestData);
      toast.success("Request posted successfully!");
      setStep(3);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'requests');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthReady) return <div className="p-20 text-center">Loading...</div>;
  if (!user) return <div className="p-20 text-center space-y-4">
    <p className="text-gray-500">Please log in to post a request.</p>
    <Button onClick={() => window.location.href = '/profile'}>Go to Profile</Button>
  </div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Post a Request</h1>
        <p className="text-gray-500">Tell local businesses what you need and get responses quickly.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 px-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-orange-600' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="space-y-4">
              <label className="block text-lg font-bold text-gray-900">
                What are you looking for?
              </label>
              <textarea 
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Example: I need a customized photo frame for a birthday gift by this weekend. Budget around 500."
                className="w-full h-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
              />
              <div className="flex items-center gap-2 text-sm text-orange-600 font-medium bg-orange-50 p-3 rounded-xl">
                <Sparkles className="w-4 h-4" />
                <span>Our AI will help you structure this for better responses.</span>
              </div>
            </div>
            <Button 
              onClick={handleAnalyze} 
              isLoading={isAnalyzing}
              className="w-full py-4 text-lg"
              disabled={!rawText.trim()}
            >
              Continue with AI <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <button 
              onClick={() => setStep(2)}
              className="w-full text-sm text-gray-500 hover:text-orange-600 font-medium transition-colors"
            >
              Skip AI and fill manually
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.form 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input 
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Customized Photo Frame"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1 mb-1.5">
                  Description
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your requirements in detail..."
                  className="w-full h-32 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  required
                />
              </div>
              <Input 
                label="Budget (₹)"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                placeholder="500"
              />
              <Input 
                label="Deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                required
              />
              <div className="md:col-span-2">
                <Input 
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g., Handmade, Gifts"
                  required
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" className="flex-[2]" isLoading={isSubmitting}>
                Post Request
              </Button>
            </div>
          </motion.form>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 bg-white p-12 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Request Posted!</h2>
              <p className="text-gray-500">Local businesses will be notified and can respond to you shortly.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => window.location.href = '/'}>
                Go to Home
              </Button>
              <Button variant="ghost" onClick={() => setStep(1)}>
                Post another request
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostRequest;
