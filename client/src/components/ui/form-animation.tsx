import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FormAnimationProps {
  children: ReactNode;
  className?: string;
}

export function FormAnimation({ children, className = "" }: FormAnimationProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      {children}
    </motion.div>
  );
}

export function FormSection({ children, className = "" }: FormAnimationProps) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.section>
  );
}

export function FormField({ children, className = "" }: FormAnimationProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30
      }}
    >
      {children}
    </motion.div>
  );
}

// Staggered form fields animation
export function FormFields({ children, className = "" }: FormAnimationProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

// Form field item for use within FormFields
export function FormFieldItem({ children, className = "" }: FormAnimationProps) {
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  return (
    <motion.div
      className={className}
      variants={item}
    >
      {children}
    </motion.div>
  );
}

// Button animation
export function AnimatedButton({ children, className = "" }: FormAnimationProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {children}
    </motion.div>
  );
}

// Page transition animation
export function PageTransition({ children, className = "" }: FormAnimationProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Success animation (checkmark)
export function SuccessAnimation({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`flex items-center justify-center ${className}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300,
        damping: 20
      }}
    >
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </motion.svg>
      </div>
    </motion.div>
  );
}