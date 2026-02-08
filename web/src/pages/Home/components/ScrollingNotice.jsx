import React from 'react';
import { useTranslation } from 'react-i18next';

const ScrollingNotice = () => {
  const { t } = useTranslation();
  const text = t('使用API前请认真看完首页的教程、常见问题和通知公告，谢谢。');

  return (
    <div className='w-full overflow-hidden py-3 px-4 border-2 border-black dark:border-white bg-amber-100 dark:bg-amber-900/30'>
      <div
        className='whitespace-nowrap text-sm font-medium text-black dark:text-white'
        style={{
          animation: 'scrollText 20s linear infinite',
        }}
      >
        📢 {text}
      </div>
      <style>{`
        @keyframes scrollText {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default ScrollingNotice;
