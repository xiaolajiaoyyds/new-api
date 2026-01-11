import React from 'react';
import { Switch, Typography } from '@douyinfe/semi-ui';

const { Text } = Typography;

const ArchivedUsersDescription = ({ compactMode, setCompactMode, t }) => {
  return (
    <div className='flex items-center gap-4'>
      <Text>{t('归档用户管理')}</Text>
      <div className='flex items-center gap-2'>
        <Text type='tertiary' size='small'>
          {t('紧凑模式')}
        </Text>
        <Switch
          checked={compactMode}
          onChange={setCompactMode}
          size='small'
        />
      </div>
    </div>
  );
};

export default ArchivedUsersDescription;
