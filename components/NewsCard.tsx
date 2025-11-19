import React from 'react';
import { Share2, ExternalLink } from 'lucide-react';
import { PLACEHOLDER_IMAGES } from '../constants';

interface NewsCardProps {
  title: string;
  content: string;
  index: number;
}

export const NewsCard: React.FC<NewsCardProps> = ({ title, content, index }) => {
  const imageUrl = PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];

  // Handle sharing
  const handleShare = async () => {
    const shareData = {
      title: title,
      text: `${title}\n\nRead more on AI Daily Pulse.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(`${title}\n${window.location.href}`);
      alert('Link copied to clipboard!');
    }
  };

  // Simple Markdown rendering for the content body
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={i} className="ml-4 list-disc text-slate-300 mb-1">
            {parseBold(line.substring(2))}
          </li>
        );
      }
      if (line.trim() === '') return <br key={i} />;
      return (
        <p key={i} className="mb-3 text-slate-300 leading-relaxed">
          {parseBold(line)}
        </p>
      );
    });
  };

  // Helper to render bold text
  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-primary-400 font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <article className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-slate-700 transition-all duration-300 animate-fade-in mb-8 group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt="AI News Illustration" 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
        <div className="absolute bottom-4 left-6 right-6">
          <h3 className="text-xl font-bold text-white leading-tight shadow-black drop-shadow-md">
            {title.replace(/^#+\s/, '')}
          </h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="text-sm text-slate-300 space-y-2">
          {renderContent(content)}
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/50">
          <button 
            onClick={handleShare}
            className="flex items-center space-x-2 text-slate-400 hover:text-primary-400 transition-colors text-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Update</span>
          </button>
          <span className="text-xs text-slate-500 font-mono">AI GENERATED BRIEF</span>
        </div>
      </div>
    </article>
  );
};