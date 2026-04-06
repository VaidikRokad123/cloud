import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setTransitionStage('fadeOut');
    setProgress(0);
    
    // Animate progress bar
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 10;
      });
    }, 30);

    return () => clearInterval(progressTimer);
  }, [location.pathname]);

  useEffect(() => {
    if (transitionStage === 'fadeOut') {
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setProgress(100);
        setTransitionStage('fadeIn');
        
        // Hide progress bar after completion
        setTimeout(() => setProgress(0), 300);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [transitionStage, children]);

  return (
    <>
      {/* Progress bar */}
      <div
        className={`fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#22c55e] z-50 transition-all duration-300 ${
          progress > 0 && progress < 100 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ width: `${progress}%` }}
      />

      {/* Loading overlay */}
      <div
        className={`fixed inset-0 bg-[#050505]/20 backdrop-blur-sm z-40 pointer-events-none transition-opacity duration-200 ${
          transitionStage === 'fadeOut' ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Page content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          transitionStage === 'fadeOut'
            ? 'opacity-0 translate-y-8 scale-[0.97]'
            : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        {displayChildren}
      </div>
    </>
  );
}
