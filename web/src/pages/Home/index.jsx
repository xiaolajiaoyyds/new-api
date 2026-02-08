import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, getLogo, getSystemName } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  HelpCircle,
  Trophy,
  ShieldAlert,
  Rocket,
  Bell,
} from 'lucide-react';
import NoticeModal from '../../components/layout/NoticeModal';
import TutorialTab from './components/TutorialTab';
import LeaderboardTab from './components/LeaderboardTab';
import FAQTab from './components/FAQTab';
import BanListTab from './components/BanListTab';
import FloatingChatButton from './components/FloatingChatButton';
import ArchivedUserCheck from './components/ArchivedUserCheck';
import {
  Button,
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../../components/retroui';

const tabItems = [
  { value: 'tutorial', label: '使用教程', icon: BookOpen },
  { value: 'faq', label: '常见问题', icon: HelpCircle },
  { value: 'leaderboard', label: '排行榜', icon: Trophy },
  { value: 'banlist', label: '封禁公示', icon: ShieldAlert },
];

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [noticeVisible, setNoticeVisible] = useState(false);
  const logo = getLogo();
  const systemName = getSystemName();

  useEffect(() => {
    const last = localStorage.getItem('notice_close_date');
    if (last !== new Date().toDateString()) {
      API.get('/api/notice')
        .then((r) => {
          if (r.data?.success && r.data.data?.trim()) setNoticeVisible(true);
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div className='min-h-screen bg-zinc-100 dark:bg-zinc-950 transition-colors'>
      <FloatingChatButton />
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />

      <div className='max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12'>
        <div className='mb-8 relative'>
          <div className='absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)] pointer-events-none' />

          <Card padding='none' className='overflow-hidden'>
            <div className='h-2 bg-[#ffdb33] dark:bg-[rgb(0,95,190)]' />

            <CardContent className='p-6 sm:p-8'>
              <div className='flex flex-col sm:flex-row items-center gap-6'>
                <div className='relative shrink-0'>
                  <div className='w-20 h-20 sm:w-24 sm:h-24 border-4 border-black dark:border-white bg-white dark:bg-zinc-800 p-2 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.2)]'>
                    <img
                      src={logo}
                      alt='logo'
                      className='w-full h-full object-contain'
                    />
                  </div>
                  <div className='absolute -top-1 -right-1 w-3 h-3 bg-[#ffdb33] dark:bg-[rgb(0,95,190)] border-2 border-black dark:border-white' />
                </div>

                <div className='flex-1 text-center sm:text-left'>
                  <h1 className='text-2xl sm:text-3xl font-black tracking-tight mb-2 text-black dark:text-white'>
                    {systemName}
                  </h1>
                  <p className='text-zinc-600 dark:text-zinc-400 text-sm sm:text-base mb-4 font-medium'>
                    {t('嘘嘘嘘')}
                  </p>
                  <div className='flex flex-wrap items-center gap-3 justify-center sm:justify-start'>
                    <Button
                      variant='primary'
                      size='lg'
                      onClick={() => navigate('/console')}
                    >
                      <Rocket className='w-4 h-4 mr-2' />
                      {t('开始使用')}
                    </Button>
                    <Button
                      variant='outline'
                      size='lg'
                      onClick={() => setNoticeVisible(true)}
                    >
                      <Bell className='w-4 h-4 mr-2' />
                      {t('系统公告')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue='tutorial'>
          <div
            className='overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 mb-6'
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <TabsList>
              {tabItems.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value}>
                  <Icon className='w-4 h-4 mr-1.5 shrink-0' />
                  {t(label)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value='tutorial'>
            <TutorialTab />
          </TabsContent>
          <TabsContent value='faq'>
            <FAQTab />
          </TabsContent>
          <TabsContent value='leaderboard'>
            <LeaderboardTab />
          </TabsContent>
          <TabsContent value='banlist'>
            <BanListTab />
          </TabsContent>
        </Tabs>

        <div className='mt-10'>
          <ArchivedUserCheck />
        </div>
      </div>
    </div>
  );
};

export default Home;
