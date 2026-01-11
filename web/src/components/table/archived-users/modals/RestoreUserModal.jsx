import React from 'react';
import { Modal, Typography } from '@douyinfe/semi-ui';

const { Text } = Typography;

const RestoreUserModal = ({ visible, onCancel, onConfirm, user, t }) => {
  return (
    <Modal
      title={t('恢复用户')}
      visible={visible}
      onCancel={onCancel}
      onOk={() => onConfirm(user?.id)}
      okText={t('确认恢复')}
      cancelText={t('取消')}
    >
      <Text>
        {t('确定要恢复用户')} <Text strong>{user?.username}</Text> {t('吗？')}
      </Text>
      <br />
      <Text type='tertiary' size='small'>
        {t('恢复后用户将可以正常登录和使用系统')}
      </Text>
    </Modal>
  );
};

export default RestoreUserModal;
