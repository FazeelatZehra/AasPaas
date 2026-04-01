import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Calendar, IndianRupee, Phone, MessageSquare, Clock, Filter, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { db, collection, getDocs, query, where, orderBy } from '../lib/firebase';
import { UserRequest } from '../types';
import { toast } from 'sonner';

const CATEGORIES = ['All', 'Food', 'Repairs', 'Home Services', 'Handmade', 'Clothing', 'Electronics'];

const RequestFeed = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
        if (selectedCategory !== 'All') {
          q = query(collection(db, 'requests'), where('category', '==', selectedCategory), orderBy('createdAt', 'desc'));
        }
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserRequest));
        setRequests(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [selectedCategory]);

  const filteredRequests = requests.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Request Feed</h1>
          <p className="text-gray-500">Find customers looking for your services nearby.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requests..." 
            className="pl-9 py-1.5 text-sm"
          />
        </div>
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

      {/* Request List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-500">No requests found in this category.</p>
          <Button variant="ghost" onClick={() => setSelectedCategory('All')} className="mt-2">
            Show all requests
          </Button>
        </div>
      )}
    </div>
  );
};

const RequestCard: React.FC<{ request: UserRequest }> = ({ request }) => {
  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
              {request.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {timeAgo(request.createdAt)}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
            {request.title}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600 flex items-center justify-end">
            <IndianRupee className="w-4 h-4" />
            <span>{request.budget || 'N/A'}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium uppercase">Budget</span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
        {request.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span className="truncate">{request.location.address}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span>By {request.deadline}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1 gap-2" size="sm">
          <Phone className="w-4 h-4" /> Call User
        </Button>
        <Button variant="outline" className="flex-1 gap-2" size="sm">
          <MessageSquare className="w-4 h-4" /> WhatsApp
        </Button>
      </div>
    </motion.div>
  );
};

export default RequestFeed;
