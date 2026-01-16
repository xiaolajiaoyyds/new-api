import React from 'react';
import { useTranslation } from 'react-i18next';

const ScrollingNotice = () => {
  const { t } = useTranslation();
  const text = t('使用API前请认真看完首页的教程、常见问题和通知公告，谢谢。');

  return (
    <div className="w-full overflow-hidden py-2 opacity-60 hover:opacity-90 transition-opacity">
      <div
        className="whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
        style={{
          animation: 'scrollText 20s linear infinite',
        }}
      >
        {text}
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
