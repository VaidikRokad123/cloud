import { useRef } from 'react';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();
  const buttonRef = useRef(null);

  const handleToggle = async (e) => {
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Check if browser supports View Transitions API
    if (!document.startViewTransition) {
      // Fallback: Create manual circular reveal animation
      const circle = document.createElement('div');
      circle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background-color: ${dark ? '#ffffff' : '#0B0F19'};
        z-index: 9999;
        pointer-events: none;
        transition: width 0.4s ease-out, height 0.4s ease-out;
        will-change: width, height;
      `;
      
      document.body.appendChild(circle);

      // Calculate max radius to cover entire screen
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      ) * 2;

      // Start animation immediately
      requestAnimationFrame(() => {
        circle.style.width = `${maxRadius}px`;
        circle.style.height = `${maxRadius}px`;
      });

      // Toggle theme quickly
      setTimeout(() => {
        toggleTheme();
      }, 200);

      // Remove circle after animation
      setTimeout(() => {
        circle.remove();
      }, 400);
    } else {
      // Use View Transitions API
      const transition = document.startViewTransition(() => {
        toggleTheme();
      });

      // Set custom properties for animation origin
      document.documentElement.style.setProperty('--x', `${(x / window.innerWidth) * 100}%`);
      document.documentElement.style.setProperty('--y', `${(y / window.innerHeight) * 100}%`);
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[.06] dark:hover:text-slate-300 transition-all duration-200"
      title={dark ? 'Switch to Light mode' : 'Switch to Dark mode'}
    >
      {dark ? <HiOutlineSun className="w-[18px] h-[18px]" /> : <HiOutlineMoon className="w-[18px] h-[18px]" />}
    </button>
  );
}
