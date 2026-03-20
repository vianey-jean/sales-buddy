
import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <Button
        onClick={scrollToTop}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center gap-2"
      >
        <ArrowUp className="h-5 w-5" />
       
      </Button>
    </div>
  );
};

export default ScrollToTop;
