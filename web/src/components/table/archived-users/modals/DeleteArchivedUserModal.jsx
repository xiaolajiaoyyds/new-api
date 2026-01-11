import React from 'react';
import { Modal, Typography } from '@douyinfe/semi-ui';

const { Text } = Typography;

const DeleteArchivedUserModal = ({ visible, onCancel, onConfirm, user, t }) => {
  return (
    <Modal
      title={t('永久删除归档记录')}
      visible={visible}
      onCancel={onCancel}
      onOk={() => onConfirm(user?.id)}
      okText={t('确认删除')}
      cancelText={t('取消')}
      okButtonProps={{ type: 'danger' }}
    >
      <Text type='danger'>
        {t('确定要永久删除用户')} <Text strong>{user?.username}</Text> {t('的归档记录吗？')}
      </Text>
      <br />
      <Text type='danger' size='small'>
        {t('此操作不可恢复！')}
      </Text>
    </Modal>
  );
};

export default DeleteArchivedUserModal;
