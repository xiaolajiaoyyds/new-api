import React from 'react';
import { Button, Space } from '@douyinfe/semi-ui';
import { IconDelete } from '@douyinfe/semi-icons';

const ArchivedUsersActions = ({ onCleanup, t }) => {
  return (
    <Space className='w-full md:w-auto order-2 md:order-1'>
      <Button
        icon={<IconDelete />}
        type='danger'
        onClick={onCleanup}
      >
        {t('清理不活跃用户')}
      </Button>
    </Space>
  );
};

export default ArchivedUsersActions;
