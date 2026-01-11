import React from 'react';
import { Modal, InputNumber, Input, Typography } from '@douyinfe/semi-ui';

const { Text } = Typography;

const CleanupModal = ({
  visible,
  onCancel,
  onConfirm,
  previewCount,
  minDays,
  setMinDays,
  startId,
  setStartId,
  endId,
  setEndId,
  onPreview,
  loading,
  t,
}) => {
  const [reason, setReason] = React.useState('');

  return (
    <Modal
      title={t('清理不活跃用户')}
      visible={visible}
      onCancel={onCancel}
      onOk={() => onConfirm(minDays, startId, endId, reason)}
      okText={t('确认清理')}
      cancelText={t('取消')}
      confirmLoading={loading}
      okButtonProps={{ type: 'danger' }}
    >
      <div className='space-y-4'>
        <div>
          <Text>{t('注册天数阈值（天）')}</Text>
          <InputNumber
            value={minDays}
            onChange={(value) => setMinDays(value)}
            min={1}
            max={365}
            style={{ width: '100%', marginTop: 8 }}
          />
          <Text type='tertiary' size='small'>
            {t('只清理注册时间超过此天数的不活跃用户')}
          </Text>
        </div>

        <div className='flex gap-4'>
          <div className='flex-1'>
            <Text>{t('起始用户ID')}</Text>
            <InputNumber
              value={startId}
              onChange={(value) => setStartId(value || 0)}
              min={0}
              style={{ width: '100%', marginTop: 8 }}
              placeholder={t('留空表示不限制')}
            />
          </div>
          <div className='flex-1'>
            <Text>{t('结束用户ID')}</Text>
            <InputNumber
              value={endId}
              onChange={(value) => setEndId(value || 0)}
              min={0}
              style={{ width: '100%', marginTop: 8 }}
              placeholder={t('留空表示不限制')}
            />
          </div>
        </div>
        <Text type='tertiary' size='small'>
          {t('设置用户ID范围，0表示不限制。例如：1-10705 表示只清理ID在此范围内的用户')}
        </Text>

        <div>
          <Text>{t('清理原因（可选）')}</Text>
          <Input
            value={reason}
            onChange={setReason}
            placeholder={t('不活跃用户清理')}
            style={{ marginTop: 8 }}
          />
        </div>

        <div
          className='p-3 rounded'
          style={{ background: 'var(--semi-color-warning-light-default)' }}
        >
          <Text strong>{t('预览结果')}</Text>
          <br />
          <Text>
            {t('符合清理条件的用户数量')}: <Text strong>{previewCount}</Text>
          </Text>
          <br />
          <Text type='tertiary' size='small'>
            {t('清理条件：已用额度=0 且 请求次数=0 且 未使用邀请码注册')}
          </Text>
        </div>

        <div
          className='p-3 rounded'
          style={{ background: 'var(--semi-color-danger-light-default)' }}
        >
          <Text type='danger'>
            {t('警告：此操作将把符合条件的用户移至归档表，用户数据可随时恢复。')}
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default CleanupModal;
