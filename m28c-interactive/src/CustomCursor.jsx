import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor({ reduceMotion = false }) {
  const [visible, setVisible] = useState(false);
  const [cursorState, setCursorState] = useState({
    type: 'default', // 'default' | 'hover' | 'magnetic'
    width: 12,
    height: 12,
    color: 'rgba(216, 161, 41, 0.8)', // --accent-color
    borderColor: 'rgba(216, 161, 41, 1)',
    backgroundColor: 'transparent',
  });

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth cursor motion using spring physics
  const springConfig = { damping: 30, stiffness: 250, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check if device is mobile/touch-screen
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice || reduceMotion) {
      setVisible(false);
      return;
    }

    const moveCursor = (e) => {
      // Set raw coordinates unless snapping to a magnetic element
      if (cursorState.type !== 'magnetic') {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [visible, cursorState.type, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;

    // Delegate hover listeners to catch dynamic elements
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      // Find if element or parent is interactive
      const interactiveEl = target.closest('button, a, select, input, textarea, [role="button"], .nav-item, .clickable');
      if (interactiveEl) {
        const isMagnetic = interactiveEl.classList.contains('magnetic') || interactiveEl.hasAttribute('data-magnetic');
        
        if (isMagnetic) {
          const rect = interactiveEl.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          mouseX.set(centerX);
          mouseY.set(centerY);

          setCursorState({
            type: 'magnetic',
            width: rect.width + 12,
            height: rect.height + 12,
            color: 'rgba(16, 185, 129, 0.15)', // --success-glow
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            borderRadius: interactiveEl.style.borderRadius || '8px',
          });
        } else {
          setCursorState({
            type: 'hover',
            width: 32,
            height: 32,
            color: 'rgba(216, 161, 41, 0.2)', // --accent-glow
            borderColor: 'rgba(216, 161, 41, 1)',
            backgroundColor: 'rgba(216, 161, 41, 0.1)',
            borderRadius: '50%',
          });
        }
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      if (!target) return;

      const interactiveEl = target.closest('button, a, select, input, textarea, [role="button"], .nav-item, .clickable');
      if (interactiveEl) {
        setCursorState({
          type: 'default',
          width: 12,
          height: 12,
          color: 'rgba(216, 161, 41, 0.8)',
          borderColor: 'rgba(216, 161, 41, 1)',
          backgroundColor: 'transparent',
          borderRadius: '50%',
        });
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [reduceMotion]);

  if (!visible || reduceMotion) return null;

  return (
    <>
      {/* Outer Glow Ring */}
      <motion.div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: cursorState.width,
          height: cursorState.height,
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          borderRadius: cursorState.borderRadius || '50%',
          border: `1.5px solid ${cursorState.borderColor}`,
          backgroundColor: cursorState.backgroundColor,
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: cursorState.type === 'magnetic' ? 'normal' : 'difference',
        }}
        animate={{
          width: cursorState.width,
          height: cursorState.height,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      />
      {/* Tiny Core Pointer */}
      {cursorState.type !== 'magnetic' && (
        <motion.div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: 4,
            height: 4,
            x: mouseX,
            y: mouseY,
            translateX: '-50%',
            translateY: '-50%',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            pointerEvents: 'none',
            zIndex: 10000,
          }}
        />
      )}
    </>
  );
}
