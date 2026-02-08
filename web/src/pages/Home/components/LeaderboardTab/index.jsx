import React, { useEffect, useState } from 'react';
import { User, Box, Squirrel } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API, showError } from '../../../../helpers';
import { renderNumber } from '../../../../helpers/render';
import {
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  RadioGroup,
  Radio,
  Table,
  Avatar,
  Badge,
} from '../../../../components/retroui';

const LeaderboardTab = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('users');
  const [userData, setUserData] = useState([]);
  const [modelData, setModelData] = useState([]);
  const [balanceData, setBalanceData] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [myBalanceRank, setMyBalanceRank] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [userPeriod, setUserPeriod] = useState('all');
  const [modelPeriod, setModelPeriod] = useState('all');

  useEffect(() => {
    fetchUserData(userPeriod);
  }, [userPeriod]);

  useEffect(() => {
    if (activeTab === 'models') {
      fetchModelData(modelPeriod);
    }
    if (activeTab === 'balance' && balanceData.length === 0) {
      fetchBalanceData();
    }
  }, [activeTab, modelPeriod]);

  const fetchUserData = async (period = 'all') => {
    setUserLoading(true);
    try {
      const res = await API.get(`/api/leaderboard?period=${period}`);
      const { success, message, data: resData } = res.data;
      if (success) {
        setUserData(resData?.leaderboard || []);
        setMyRank(resData?.my_rank || null);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message || t('获取排行榜数据失败'));
    } finally {
      setUserLoading(false);
    }
  };

  const fetchModelData = async (period = 'all') => {
    setModelLoading(true);
    try {
      const res = await API.get(`/api/leaderboard/models?period=${period}`);
      const { success, message, data: resData } = res.data;
      if (success) {
        setModelData(resData || []);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message || t('获取模型排行榜数据失败'));
    } finally {
      setModelLoading(false);
    }
  };

  const fetchBalanceData = async () => {
    setBalanceLoading(true);
    try {
      const res = await API.get('/api/leaderboard/balance');
      const { success, message, data: resData } = res.data;
      if (success) {
        setBalanceData(resData?.leaderboard || []);
        setMyBalanceRank(resData?.my_rank || null);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message || t('获取余额排行榜数据失败'));
    } finally {
      setBalanceLoading(false);
    }
  };

  const stringToColor = (str) => {
    if (!str) return '#999';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  const getLevelVariant = (level) => {
    const variants = {
      0: 'default',
      1: 'success',
      2: 'info',
      3: 'purple',
      4: 'warning',
    };
    return variants[level] || 'default';
  };

  const renderUserCell = (record) => {
    const hasLinuxDO = record.linux_do_username && record.linux_do_avatar;
    let displayText;
    if (hasLinuxDO) {
      const hasName =
        record.display_name && record.display_name !== record.linux_do_username;
      displayText = hasName
        ? `${record.display_name}（${record.linux_do_username}）`
        : record.linux_do_username;
    } else {
      displayText = record.display_name || t('匿名用户');
    }
    const avatarName = hasLinuxDO
      ? record.linux_do_username
      : record.display_name || t('匿名用户');

    return (
      <div className='flex items-center gap-2'>
        <div className='relative'>
          <Avatar
            size='sm'
            src={hasLinuxDO ? record.linux_do_avatar : null}
            color={stringToColor(avatarName)}
            fallback={avatarName?.charAt(0)?.toUpperCase() || '?'}
          />
          {hasLinuxDO && record.linux_do_level > 0 && (
            <Badge
              variant={getLevelVariant(record.linux_do_level)}
              size='sm'
              className='absolute -bottom-1 -right-2 text-[10px] px-1 py-0 min-w-[16px] h-4'
            >
              {record.linux_do_level}
            </Badge>
          )}
        </div>
        <span className='text-black dark:text-white'>{displayText}</span>
      </div>
    );
  };

  const renderRankCell = (text) => {
    let emoji = '';
    let className = 'text-black dark:text-white';
    if (text === 1) {
      emoji = '🥇';
      className = 'text-amber-500 font-bold text-lg';
    }
    if (text === 2) {
      emoji = '🥈';
      className = 'text-gray-400 font-bold text-lg';
    }
    if (text === 3) {
      emoji = '🥉';
      className = 'text-amber-700 font-bold text-lg';
    }
    return (
      <span className={className}>
        {emoji} #{text}
      </span>
    );
  };

  const userColumns = [
    {
      title: t('排名'),
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: renderRankCell,
    },
    {
      title: t('用户'),
      dataIndex: 'linux_do_username',
      key: 'user',
      render: (_, record) => renderUserCell(record),
    },
    {
      title: t('请求次数'),
      dataIndex: 'request_count',
      key: 'request_count',
      render: (text) => renderNumber(text || 0),
    },
    {
      title: t('Token 用量'),
      dataIndex: 'used_quota',
      key: 'used_quota',
      render: (text) => renderNumber(text || 0),
    },
    {
      title: t('消费金额'),
      dataIndex: 'amount_usd',
      key: 'amount_usd',
      render: (text) => `$${(text || 0).toFixed(2)}`,
    },
  ];

  const modelColumns = [
    {
      title: t('排名'),
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: renderRankCell,
    },
    {
      title: t('模型'),
      dataIndex: 'model_name',
      key: 'model_name',
      render: (text) => (
        <div className='flex items-center gap-2'>
          <Box className='w-4 h-4' style={{ color: stringToColor(text) }} />
          <span className='text-black dark:text-white font-mono'>{text}</span>
        </div>
      ),
    },
    {
      title: t('调用次数'),
      dataIndex: 'request_count',
      key: 'request_count',
      render: (text) => renderNumber(text || 0),
    },
    {
      title: t('Token 用量'),
      dataIndex: 'total_tokens',
      key: 'total_tokens',
      render: (text) => renderNumber(text || 0),
    },
    {
      title: t('消费金额'),
      dataIndex: 'amount_usd',
      key: 'amount_usd',
      render: (text) => `$${(text || 0).toFixed(2)}`,
    },
  ];

  const balanceColumns = [
    {
      title: t('排名'),
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: renderRankCell,
    },
    {
      title: t('用户'),
      dataIndex: 'linux_do_username',
      key: 'user',
      render: (_, record) => renderUserCell(record),
    },
    {
      title: t('余额'),
      dataIndex: 'amount_usd',
      key: 'amount_usd',
      render: (text) => `$${(text || 0).toFixed(2)}`,
    },
  ];

  const MyRankCard = ({ rank, icon: Icon, color, showBalance }) => (
    <Card className='mb-4 overflow-hidden' padding='none'>
      <div
        className='h-1'
        style={{
          background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
        }}
      />
      <CardContent className='p-4 sm:p-5'>
        <div className='flex flex-col gap-4 sm:gap-5'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3 min-w-0'>
              <div
                className='w-9 h-9 shrink-0 flex items-center justify-center border-2 border-black dark:border-white'
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className='w-5 h-5' style={{ color }} />
              </div>
              <div className='min-w-0'>
                <div className='font-bold text-black dark:text-white leading-none mb-1'>
                  {t('我的排名')}
                </div>
                <div className='truncate'>{renderUserCell(rank)}</div>
              </div>
            </div>

            <div className='text-right'>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                {t('当前名次')}
              </div>
              <div className='text-2xl font-extrabold' style={{ color }}>
                #{rank.rank}
              </div>
            </div>
          </div>

          {showBalance ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='border-2 border-black dark:border-white p-3'>
                <div className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                  {t('余额')}
                </div>
                <div className='text-xl font-bold text-black dark:text-white'>
                  ${(rank.amount_usd || 0).toFixed(2)}
                </div>
              </div>
              <div className='border-2 border-black dark:border-white p-3'>
                <div className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                  {t('排名')}
                </div>
                <div className='text-xl font-bold' style={{ color }}>
                  #{rank.rank}
                </div>
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              <div className='border-2 border-black dark:border-white p-3'>
                <div className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                  {t('排名')}
                </div>
                <div className='text-lg font-bold' style={{ color }}>
                  #{rank.rank}
                </div>
              </div>
              <div className='border-2 border-black dark:border-white p-3'>
                <div className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                  {t('请求次数')}
                </div>
                <div className='text-lg font-bold text-black dark:text-white'>
                  {renderNumber(rank.request_count || 0)}
                </div>
              </div>
              <div className='border-2 border-black dark:border-white p-3'>
                <div className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                  {t('Token 用量')}
                </div>
                <div className='text-lg font-bold text-black dark:text-white'>
                  {renderNumber(rank.used_quota || 0)}
                </div>
              </div>
              <div className='border-2 border-black dark:border-white p-3'>
                <div className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                  {t('消费金额')}
                </div>
                <div className='text-lg font-bold text-black dark:text-white'>
                  ${(rank.amount_usd || 0).toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const PeriodSelector = ({ value, onChange }) => (
    <RadioGroup
      type='button'
      value={value}
      onChange={onChange}
      className='mb-4'
    >
      <Radio value='24h'>{t('24小时')}</Radio>
      <Radio value='7d'>{t('7天')}</Radio>
      <Radio value='14d'>{t('14天')}</Radio>
      <Radio value='30d'>{t('一个月')}</Radio>
      <Radio value='all'>{t('总榜')}</Radio>
    </RadioGroup>
  );

  return (
    <div className='p-4'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='users'>
            <User className='w-4 h-4 mr-1 inline' />
            {t('用户消耗排行')}
          </TabsTrigger>
          <TabsTrigger value='models'>
            <Box className='w-4 h-4 mr-1 inline' />
            {t('模型调用排行')}
          </TabsTrigger>
          <TabsTrigger value='balance'>
            <Squirrel className='w-4 h-4 mr-1 inline' />
            {t('囤囤鼠排行')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='users'>
          <div className='mt-4'>
            <PeriodSelector
              value={userPeriod}
              onChange={(e) => setUserPeriod(e.target.value)}
            />
            {myRank && <MyRankCard rank={myRank} icon={User} color='#1d4ed8' />}
            <Table
              loading={userLoading}
              columns={userColumns}
              dataSource={userData}
              rowKey='rank'
              emptyText={t('暂无数据')}
            />
          </div>
        </TabsContent>

        <TabsContent value='models'>
          <div className='mt-4'>
            <PeriodSelector
              value={modelPeriod}
              onChange={(e) => setModelPeriod(e.target.value)}
            />
            <Table
              loading={modelLoading}
              columns={modelColumns}
              dataSource={modelData}
              rowKey='rank'
              emptyText={t('暂无数据')}
            />
          </div>
        </TabsContent>

        <TabsContent value='balance'>
          <div className='mt-4'>
            {myBalanceRank && (
              <MyRankCard
                rank={myBalanceRank}
                icon={Squirrel}
                color='#d97706'
                showBalance
              />
            )}
            <Table
              loading={balanceLoading}
              columns={balanceColumns}
              dataSource={balanceData}
              rowKey='rank'
              emptyText={t('暂无数据')}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardTab;
