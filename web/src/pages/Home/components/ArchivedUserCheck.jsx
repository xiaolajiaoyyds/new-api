import React, { useState, useEffect } from 'react';
import { Modal, Typography, Toast } from '@douyinfe/semi-ui';
import { Search } from 'lucide-react';
import { API } from '../../../helpers';
import { useTranslation } from 'react-i18next';
import { renderQuota } from '../../../helpers/render';
import { timestamp2string } from '../../../helpers/utils';
import { Button, Input, Card } from '../../../components/retroui'; // 严格使用组件库
import { cn } from '../../../helpers/utils';

const { Text } = Typography;

const ArchivedUserCheck = () => {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [showRecoverConfirm, setShowRecoverConfirm] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!localStorage.getItem('user')) {
        return;
      }
      try {
        const res = await API.get('/api/user/self');
        if (res.data.success) {
          setCurrentUser(res.data.data);
        }
      } catch {
        setCurrentUser(null);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    setNotFound(false);
    try {
      const res = await API.get(
        `/api/archived-user/check?keyword=${encodeURIComponent(keyword.trim())}`,
      );
      const { success, found, data } = res.data;
      if (success && found) {
        setResult(data);
        setModalVisible(true);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
    setLoading(false);
  };

  const canRecover = () => {
    if (!currentUser || !result) return false;
    if (!currentUser.linux_do_username || !result.linux_do_username)
      return false;
    return currentUser.linux_do_username === result.linux_do_username;
  };

  const handleRecoverQuota = () => {
    setShowRecoverConfirm(true);
  };

  const confirmRecoverQuota = async () => {
    setShowRecoverConfirm(false);
    setRecoverLoading(true);

    try {
      const res = await API.post('/api/archived-user/recover-quota', {
        archived_id: result.id,
      });
      const { success, message, data } = res.data;

      if (success) {
        Toast.success(
          t('额度恢复成功！已恢复 {{quota}}', {
            quota: renderQuota(data?.recovered_quota || 0, 2),
          }),
        );
        setModalVisible(false);
        setResult(null);
        setKeyword('');
      } else {
        Toast.error(message || t('恢复失败，请稍后重试'));
      }
    } catch (error) {
      Toast.error(error.response?.data?.message || t('恢复失败，请稍后重试'));
    }

    setRecoverLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className='w-full'>
      <Card variant='default' padding='lg'>
        <div className='text-center mb-6'>
          <h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2'>
            {t('账号状态查询')}
          </h3>
          <p className='text-sm text-zinc-500 dark:text-zinc-400'>
            {t('查询被归档或清理的账号记录')}
          </p>
        </div>

        <div className='flex gap-2'>
          <div className='flex-1'>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('用户名 / ID')}
              icon={<Search className='w-4 h-4' />}
              size='lg'
              className='bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
            />
          </div>
          <Button
            variant='primary'
            size='lg'
            onClick={handleSearch}
            disabled={loading}
            className='px-6 shrink-0'
          >
            {loading ? t('...') : t('查询')}
          </Button>
        </div>

        {notFound && (
          <div className='mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center border border-emerald-100 dark:border-emerald-900/30'>
            <p className='text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2'>
              <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
              {t('未找到记录，账号状态正常')}
            </p>
          </div>
        )}
      </Card>

      <Modal
        title={
          <span className='font-bold text-zinc-900 dark:text-zinc-100'>
            {t('账号已归档')}
          </span>
        }
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={
          <div className='flex gap-2 justify-end pt-4'>
            {canRecover() && (
              <Button
                variant='primary'
                onClick={handleRecoverQuota}
                disabled={recoverLoading}
              >
                {t('恢复额度')}
              </Button>
            )}
            <Button variant='outline' onClick={() => setModalVisible(false)}>
              {t('关闭')}
            </Button>
          </div>
        }
        centered
        bodyStyle={{ padding: '24px' }}
      >
        {result && (
          <div className='space-y-6'>
            <div className='p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30'>
              <p className='text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-2'>
                <span className='w-1.5 h-1.5 rounded-full bg-red-500' />
                {t('账号因长期不活跃已被系统自动清理')}
              </p>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <InfoItem label={t('用户名')} value={result.username} />
              <InfoItem
                label={t('显示名称')}
                value={result.display_name || '-'}
              />
              <InfoItem
                label={t('剩余额度')}
                value={renderQuota(result.quota, 2)}
                highlight
              />
              <InfoItem
                label={t('已用额度')}
                value={renderQuota(result.used_quota, 2)}
              />
              <InfoItem
                label={t('清理时间')}
                value={timestamp2string(result.archived_at)}
                className='col-span-2'
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={t('确认操作')}
        visible={showRecoverConfirm}
        onCancel={() => setShowRecoverConfirm(false)}
        centered
        footer={
          <div className='flex gap-2 justify-end pt-4'>
            <Button
              variant='outline'
              onClick={() => setShowRecoverConfirm(false)}
            >
              {t('取消')}
            </Button>
            <Button variant='primary' onClick={confirmRecoverQuota}>
              {t('确认恢复')}
            </Button>
          </div>
        }
      >
        <div className='text-zinc-600 dark:text-zinc-300'>
          {t('确认要恢复此账号的额度吗？恢复后归档记录将被删除。')}
        </div>
      </Modal>
    </div>
  );
};

const InfoItem = ({ label, value, highlight, className }) => (
  <div
    className={cn(
      'p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800',
      className,
    )}
  >
    <span className='text-xs text-zinc-500 dark:text-zinc-400 block mb-1'>
      {label}
    </span>
    <span
      className={cn(
        'text-sm font-medium text-zinc-900 dark:text-zinc-100',
        highlight && 'text-amber-600 dark:text-amber-400',
      )}
    >
      {value}
    </span>
  </div>
);

export default ArchivedUserCheck;
