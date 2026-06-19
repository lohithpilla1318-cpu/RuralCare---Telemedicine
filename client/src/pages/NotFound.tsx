import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <span className="text-8xl mb-4 animate-bounce">🧭</span>
      <h1 className="text-4xl font-black text-primary mb-2">404</h1>
      <h2 className="text-xl font-bold mb-4">
        Page Not Found / पृष्ठ नहीं मिला
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        The link you followed may be broken or the page may have been moved. Return to the main page to consult doctors or order medicines.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl shadow-lg active:scale-95 transition-all text-sm uppercase"
      >
        Go Home / मुख्य पृष्ठ पर जाएं
      </button>
    </div>
  );
};
