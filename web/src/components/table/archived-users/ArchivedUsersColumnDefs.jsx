import React from 'react';
import { Button, Dropdown } from '@douyinfe/semi-ui';
import { IconMore, IconRefresh, IconUndo, IconDelete } from '@douyinfe/semi-icons';
import { renderQuota } from '../../../helpers/render';
import { timestamp2string } from '../../../helpers/utils';

export const getArchivedUsersColumns = ({
  t,
  showRestoreModal,
  showDeleteModal,
}) => {
  return [
    {
      title: t('ID'),
      dataIndex: 'original_user_id',
      key: 'original_user_id',
      width: 80,
    },
    {
      title: t('用户名'),
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: t('显示名称'),
      dataIndex: 'display_name',
      key: 'display_name',
      width: 150,
    },
    {
      title: t('邮箱'),
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: t('分组'),
      dataIndex: 'group',
      key: 'group',
      width: 100,
    },
    {
      title: t('额度'),
      dataIndex: 'quota',
      key: 'quota',
      width: 120,
      render: (text) => renderQuota(text, 2),
    },
    {
      title: t('已用额度'),
      dataIndex: 'used_quota',
      key: 'used_quota',
      width: 120,
      render: (text) => renderQuota(text, 2),
    },
    {
      title: t('请求次数'),
      dataIndex: 'request_count',
      key: 'request_count',
      width: 100,
    },
    {
      title: t('邀请码'),
      dataIndex: 'invitation_code_used',
      key: 'invitation_code_used',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: t('注册时间'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => (text ? timestamp2string(text) : '-'),
    },
    {
      title: t('归档时间'),
      dataIndex: 'archived_at',
      key: 'archived_at',
      width: 180,
      render: (text) => (text ? timestamp2string(text) : '-'),
    },
    {
      title: t('归档原因'),
      dataIndex: 'archived_reason',
      key: 'archived_reason',
      width: 150,
    },
    {
      title: t('操作'),
      key: 'action',
      fixed: 'right',
      width: 80,
      render: (text, record) => (
        <Dropdown
          trigger='click'
          position='bottomRight'
          render={
            <Dropdown.Menu>
              <Dropdown.Item
                icon={<IconUndo />}
                onClick={() => showRestoreModal(record)}
              >
                {t('恢复用户')}
              </Dropdown.Item>
              <Dropdown.Item
                icon={<IconDelete />}
                type='danger'
                onClick={() => showDeleteModal(record)}
              >
                {t('永久删除')}
              </Dropdown.Item>
            </Dropdown.Menu>
          }
        >
          <Button icon={<IconMore />} theme='borderless' />
        </Dropdown>
      ),
    },
  ];
};
