import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API, showError, showSuccess } from '../../../../helpers';
import { Modal, Button, Textarea } from '../../../../components/retroui';

const AppealModal = ({ visible, onClose, onSuccess, user }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!reason || reason.trim().length < 10) {
      showError(t('申诉理由至少需要10个字符'));
      return;
    }
    if (reason.length > 1000) {
      showError(t('申诉理由不能超过1000个字符'));
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/user/appeal', { reason: reason.trim() });
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('申诉已提交，请等待管理员审核'));
        setReason('');
        onSuccess?.();
      } else {
        showError(message);
      }
    } catch (error) {
      showError(t('提交申诉失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose?.();
  };

  return (
    <Modal
      title={t('提交申诉')}
      visible={visible}
      onClose={handleClose}
      closeOnEsc={!loading}
      maskClosable={!loading}
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='secondary' onClick={handleClose} disabled={loading}>
            {t('取消')}
          </Button>
          <Button variant='primary' onClick={handleSubmit} disabled={loading}>
            {loading ? '...' : t('提交申诉')}
          </Button>
        </div>
      }
    >
      <div className='mb-4'>
        <span className='text-gray-600 dark:text-gray-400'>
          {t('您的账户因以下原因被封禁：')}
        </span>
        <div className='mt-2 p-3 bg-red-100 dark:bg-red-900/30 border-2 border-black dark:border-white'>
          <span className='font-bold text-red-600 dark:text-red-400'>
            {user?.ban_reason || t('未说明')}
          </span>
        </div>
      </div>

      <Textarea
        label={t('申诉理由')}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={t('请详细说明您的申诉理由（10-1000字符）')}
        rows={5}
      />
      <div className='text-right text-sm text-gray-500 mt-1'>
        {reason.length}/1000
      </div>
    </Modal>
  );
};

export default AppealModal;
