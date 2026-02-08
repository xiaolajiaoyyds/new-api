import React, { useEffect, useState, useContext } from 'react';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API, showError } from '../../../../helpers';
import { UserContext } from '../../../../context/User';
import { Table, Button, Badge, Avatar, Empty } from '../../../../components/retroui';
import AppealModal from './AppealModal';

const BanListTab = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [userState] = useContext(UserContext);
  const [appealModalVisible, setAppealModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchBanList = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/ban-list');
      const { success, data, message } = res.data;
      if (success) {
        setBannedUsers(data || []);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(t('获取封禁名单失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanList();
  }, []);

  const handleAppealClick = (user) => {
    setSelectedUser(user);
    setAppealModalVisible(true);
  };

  const isCurrentUserBanned = (userId) => {
    return userState?.user?.id === userId && userState?.user?.status === 2;
  };

  const columns = [
    {
      title: t('LinuxDO 用户'),
      dataIndex: 'linux_do_username',
      key: 'linux_do_user',
      render: (text, record) => (
        <div className="flex items-center gap-2">
          {record.linux_do_avatar ? (
            <Avatar size="sm" src={record.linux_do_avatar} />
          ) : (
            <Avatar size="sm">
              <User className="w-4 h-4" />
            </Avatar>
          )}
          <span className="font-bold text-black dark:text-white">{text || '-'}</span>
        </div>
      ),
    },
    {
      title: t('站内用户名'),
      dataIndex: 'display_name',
      key: 'display_name',
      render: (text) => <span className="text-black dark:text-white">{text || '-'}</span>,
    },
    {
      title: t('封禁理由'),
      dataIndex: 'ban_reason',
      key: 'ban_reason',
      render: (text) => (
        <span className="text-red-600 dark:text-red-400">{text || t('未说明')}</span>
      ),
    },
    {
      title: t('申诉状态'),
      dataIndex: 'has_pending_appeal',
      key: 'appeal_status',
      width: 120,
      render: (hasPending) =>
        hasPending ? (
          <Badge variant="warning">{t('申诉中')}</Badge>
        ) : (
          <Badge variant="default">{t('未申诉')}</Badge>
        ),
    },
    {
      title: t('操作'),
      key: 'action',
      width: 100,
      render: (_, record) => {
        const canAppeal = isCurrentUserBanned(record.id) && !record.has_pending_appeal;
        return canAppeal ? (
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleAppealClick(record)}
          >
            {t('申诉')}
          </Button>
        ) : null;
      },
    },
  ];

  return (
    <div className="p-4">
      {bannedUsers.length > 0 ? (
        <Table
          columns={columns}
          dataSource={bannedUsers}
          rowKey="id"
          loading={loading}
          emptyText={t('暂无封禁用户')}
        />
      ) : loading ? (
        <Table columns={columns} dataSource={[]} loading={true} />
      ) : (
        <Empty
          icon={User}
          description={t('暂无封禁用户')}
        />
      )}

      <AppealModal
        visible={appealModalVisible}
        onClose={() => {
          setAppealModalVisible(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setAppealModalVisible(false);
          setSelectedUser(null);
          fetchBanList();
        }}
        user={selectedUser}
      />
    </div>
  );
};

export default BanListTab;
