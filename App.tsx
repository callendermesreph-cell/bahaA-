import React, { useState, useEffect } from 'react';
import { fetchDailyNews } from './services/geminiService';
import { requestNotificationPermission, checkAndTriggerScheduledNotification } from './services/notificationService';
import { NewsResponse, FetchState } from './types';
import { Header } from './components/Header';
import { NewsCard } from './components/NewsCard';
import { Loader2, AlertCircle, BookOpen, ExternalLink, RefreshCw, Globe, Bell } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<FetchState>(FetchState.IDLE);
  const [newsData, setNewsData] = useState<NewsResponse | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [language, setLanguage] = useState<'tr' | 'en'>('tr'); // Default to Turkish
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    const now = new Date();
    // Format date based on language
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(now.toLocaleDateString(locale, options));
  }, [language]);

  useEffect(() => {
    // Auto-fetch on load
    loadNews();
    
    // Setup Notifications
    const setupNotifications = async () => {
      const granted = await requestNotificationPermission();
      setNotificationEnabled(granted);
      
      if (granted) {
        // Check immediately on load
        checkAndTriggerScheduledNotification();
        
        // Check every minute
        const intervalId = setInterval(() => {
          checkAndTriggerScheduledNotification();
        }, 60000);
        
        return () => clearInterval(intervalId);
      }
    };
    
    setupNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNews = async () => {
    setStatus(FetchState.LOADING);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    try {
      const data = await fetchDailyNews(today);
      setNewsData(data);
      setStatus(FetchState.SUCCESS);
    } catch (error) {
      setStatus(FetchState.ERROR);
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'tr' ? 'en' : 'tr'));
  };

  const requestNotifyManual = async () => {
    const granted = await requestNotificationPermission();
    setNotificationEnabled(granted);
    if (granted) {
      alert(language === 'tr' ? 'Bildirimler aktif! Her gün 11:00\'de haber verilecek.' : 'Notifications enabled! You will be notified daily at 11:00.');
      checkAndTriggerScheduledNotification(); // Test check
    } else {
      alert(language === 'tr' ? 'Bildirim izni verilmedi.' : 'Notification permission denied.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      <Header currentDate={currentDate} />

      <main className="max-w-3xl mx-auto px-4 pt-8">
        
        {/* Intro / Control Panel */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {language === 'tr' ? 'Son Gelişmeler' : 'Latest Intelligence'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-400">
                {language === 'tr' 
                  ? 'Yapay zeka dünyasından güncel haberler ve fırsatlar.' 
                  : 'Curated AI updates, releases, and opportunities.'}
              </p>
              {!notificationEnabled && (
                <button 
                  onClick={requestNotifyManual}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-primary-400 px-2 py-1 rounded border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Bell className="w-3 h-3" />
                  {language === 'tr' ? 'Bildirimleri Aç' : 'Enable Alerts'}
                </button>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all border border-slate-700"
            >
              <Globe className="w-4 h-4 text-primary-400" />
              <span>{language === 'tr' ? 'EN' : 'TR'}</span>
            </button>

            <button 
              onClick={loadNews}
              disabled={status === FetchState.LOADING}
              className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-900/20"
            >
              {status === FetchState.LOADING ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>
                {language === 'tr' 
                  ? (status === FetchState.LOADING ? 'Taranıyor...' : 'Yenile') 
                  : (status === FetchState.LOADING ? 'Analyzing...' : 'Refresh')}
              </span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {status === FetchState.LOADING && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
              <p className="animate-pulse">
                {language === 'tr' ? 'Global kaynaklar taranıyor...' : 'Scanning global tech sources...'}
              </p>
            </div>
          )}

          {status === FetchState.ERROR && (
            <div className="bg-red-900/20 border border-red-900/50 rounded-2xl p-6 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-200">
                {language === 'tr' ? 'Bağlantı Hatası' : 'Connection Interrupted'}
              </h3>
              <p className="text-red-300/70 mt-2 mb-4">
                {language === 'tr' ? 'Güncel veriler alınamadı.' : 'Unable to retrieve the latest intelligence stream.'}
              </p>
              <button onClick={loadNews} className="text-primary-400 hover:underline">
                {language === 'tr' ? 'Tekrar Dene' : 'Try again'}
              </button>
            </div>
          )}

          {status === FetchState.SUCCESS && newsData?.items.length === 0 && (
            <div className="p-8 text-center border border-slate-800 rounded-2xl bg-slate-900/50">
              <p className="text-slate-400">
                {language === 'tr' ? 'Haber bulunamadı.' : 'No formatted news items found.'}
              </p>
            </div>
          )}

          {status === FetchState.SUCCESS && newsData?.items && (
            <div className="space-y-8">
              {newsData.items.map((item, index) => (
                <NewsCard 
                  key={index}
                  index={index}
                  title={language === 'tr' ? item.titleTr : item.titleEn}
                  content={language === 'tr' ? item.contentTr : item.contentEn}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sources Footer */}
        {status === FetchState.SUCCESS && newsData?.sources && newsData.sources.length > 0 && (
          <div className="mt-16 pt-8 border-t border-slate-800/50">
            <div className="flex items-center space-x-2 mb-6">
              <BookOpen className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-semibold text-white">
                {language === 'tr' ? 'Doğrulanmış Kaynaklar' : 'Verified Sources'}
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {newsData.sources.map((source, idx) => (
                <a 
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-primary-500/50 hover:bg-slate-800 transition-all group"
                >
                  <span className="text-sm text-slate-300 truncate mr-3">{source.title}</span>
                  <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-primary-400 flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

      </main>

      <footer className="mt-20 py-8 text-center text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} bahaAİ. Powered by Gemini 2.5 Flash.</p>
      </footer>
    </div>
  );
};

export default App;