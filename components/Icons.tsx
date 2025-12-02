import React from 'react';
import { 
  Heart, 
  ThumbsDown, 
  AlertTriangle, 
  Plus, 
  Search, 
  User, 
  Gift, 
  ArrowLeft,
  Trash2,
  Edit2,
  Save,
  Sparkles,
  Coffee,
  Shirt,
  Gamepad2,
  Utensils,
  LayoutGrid,
  Users
} from 'lucide-react';
import { Category } from '../types';

export const Icons = {
  Heart,
  ThumbsDown,
  AlertTriangle,
  Plus,
  Search,
  User,
  Gift,
  ArrowLeft,
  Trash2,
  Edit2,
  Save,
  Sparkles,
  LayoutGrid,
  Users
};

export const CategoryIcon = ({ category, className }: { category: Category; className?: string }) => {
  switch (category) {
    case Category.FOOD: return <Utensils className={className} />;
    case Category.DRINK: return <Coffee className={className} />;
    case Category.CLOTHING: return <Shirt className={className} />;
    case Category.HOBBY: return <Gamepad2 className={className} />;
    case Category.GIFT: return <Gift className={className} />;
    default: return <Sparkles className={className} />;
  }
};