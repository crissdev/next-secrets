import { useEffect, useState } from 'react';

export function LoadingDots(props: { delay?: number }) {
  // Show 3 dots that animate in a loop
  // Show dots only after provided minimum delay

  const delay = props.delay || 500;
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : '.'));
    }, delay);

    return () => clearInterval(interval);
  }, [delay]);

  return <span>{dots}</span>;
}
