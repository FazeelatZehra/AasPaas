export interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  phone: string;
  ownerId: string;
  createdAt: number;
  rating?: number;
}

export interface UserRequest {
  id: string;
  title: string;
  description: string;
  budget: number | null;
  deadline: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  userId: string;
  createdAt: number;
  status: 'open' | 'closed';
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'customer' | 'business';
}
