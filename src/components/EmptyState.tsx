import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
  className?: string;
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  actionText, 
  actionLink, 
  onActionClick,
  className = "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-12 shadow-sm border border-gray-100 dark:border-gray-800 min-h-[50vh]"
}: EmptyStateProps) {
  return (
    <div className={`${className} flex flex-col items-center justify-center text-center transition-colors`}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-6 text-gray-400 dark:text-gray-500 shadow-inner"
      >
        {icon}
      </motion.div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-4">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed font-medium">{description}</p>
      
      {actionLink && actionText && (
        <Link to={actionLink} className="bg-orange-600 hover:bg-orange-700 hover:shadow-md hover:shadow-orange-500/20 text-white font-bold py-3 px-8 rounded-xl transition-all inline-block active:scale-95">
          {actionText}
        </Link>
      )}

      {onActionClick && actionText && !actionLink && (
        <button onClick={onActionClick} className="bg-orange-600 hover:bg-orange-700 hover:shadow-md hover:shadow-orange-500/20 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95">
          {actionText}
        </button>
      )}
    </div>
  );
}
