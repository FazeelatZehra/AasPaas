import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Phone, Star, MessageSquare } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { parseUserQuery } from '../lib/gemini';
import { toast } from 'sonner';
import { db, collection, getDocs, query, where } from '../lib/firebase';
import { Business } from '../types';
import { cn } from '@/src/lib/utils';

const CATEGORIES = ['All', 'Food', 'Repairs', 'Home Services', 'Handmade', 'Clothing', 'Electronics'];

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'businesses'));
        if (selectedCategory !== 'All') {
          q = query(collection(db, 'businesses'), where('category', '==', selectedCategory));
        }
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
        setBusinesses(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch businesses");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [selectedCategory]);

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsAiSearching(true);
    try {
      const result = await parseUserQuery(searchQuery);
      setAiResult(result);
      if (result.category) {
        const matchedCategory = CATEGORIES.find(c => c.toLowerCase() === result.category.toLowerCase());
        if (matchedCategory) setSelectedCategory(matchedCategory);
      }
      toast.success("AI analyzed your request!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze query");
    } finally {
      setIsAiSearching(false);
    }
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Discover Nearby</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Try 'I need a cake under ₹500 nearby'..." 
              className="pl-10"
            />
          </div>
          <Button onClick={handleAiSearch} isLoading={isAiSearching}>
            AI Search
          </Button>
        </div>
        
        {aiResult && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center gap-4"
          >
            <div className="bg-orange-100 p-2 rounded-lg">
              <Star className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-sm">
              <span className="font-bold text-orange-800">AI Intent:</span>{' '}
              <span className="text-orange-700">
                Searching for <span className="font-bold">{aiResult.category}</span> 
                {aiResult.budget ? ` with budget ₹${aiResult.budget}` : ''} 
                {aiResult.urgency ? ` (${aiResult.urgency} urgency)` : ''}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setAiResult(null)} className="ml-auto text-orange-600">
              Clear
            </Button>
          </motion.div>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              selectedCategory === cat 
                ? "bg-orange-600 text-white shadow-md" 
                : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Business List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-500">No businesses found in this category.</p>
          <Button variant="ghost" onClick={() => setSelectedCategory('All')} className="mt-2">
            Show all businesses
          </Button>
        </div>
      )}
    </div>
  );
};

const BusinessCard: React.FC<{ business: Business }> = ({ business }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group"
  >
    <div className="h-48 bg-gray-100 relative overflow-hidden">
      <img 
        src={`https://picsum.photos/seed/${business.id}/800/600`} 
        alt={business.name} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold shadow-sm">
        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
        <span>{business.rating || 'New'}</span>
      </div>
      <div className="absolute bottom-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold">
        {business.category}
      </div>
    </div>
    <div className="p-6 space-y-4">
      <div>
        <h3 className="text-xl font-bold text-gray-900">{business.name}</h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
          <MapPin className="w-4 h-4" />
          <span>{business.location.address}</span>
        </div>
      </div>
      <p className="text-gray-600 text-sm line-clamp-2">
        {business.description}
      </p>
      <div className="flex gap-2 pt-2">
        <a href={`tel:${business.phone}`} className="flex-1">
          <Button className="w-full gap-2" size="sm">
            <Phone className="w-4 h-4" /> Call
          </Button>
        </a>
        <a href={`https://wa.me/${business.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1">
          <Button variant="outline" className="w-full gap-2" size="sm">
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </Button>
        </a>
      </div>
    </div>
  </motion.div>
);

export default Discover;
