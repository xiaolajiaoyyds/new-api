import React, { useMemo, useState } from 'react';
import { Empty } from '@douyinfe/semi-ui';
import CardTable from '../../common/ui/CardTable';
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@douyinfe/semi-illustrations';
import { getArchivedUsersColumns } from './ArchivedUsersColumnDefs';
import RestoreUserModal from './modals/RestoreUserModal';
import DeleteArchivedUserModal from './modals/DeleteArchivedUserModal';

const ArchivedUsersTable = (archivedUsersData) => {
  const {
    archivedUsers,
    loading,
    activePage,
    pageSize,
    totalCount,
    compactMode,
    handlePageChange,
    handlePageSizeChange,
    restoreUser,
    deleteArchivedUser,
    t,
  } = archivedUsersData;

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalUser, setModalUser] = useState(null);

  const handleShowRestoreModal = (user) => {
    setModalUser(user);
    setShowRestoreModal(true);
  };

  const handleShowDeleteModal = (user) => {
    setModalUser(user);
    setShowDeleteModal(true);
  };

  const handleRestoreConfirm = async (id) => {
    await restoreUser(id);
    setShowRestoreModal(false);
  };

  const handleDeleteConfirm = async (id) => {
    await deleteArchivedUser(id);
    setShowDeleteModal(false);
  };

  const columns = useMemo(() => {
    return getArchivedUsersColumns({
      t,
      showRestoreModal: handleShowRestoreModal,
      showDeleteModal: handleShowDeleteModal,
    });
  }, [t]);

  const tableColumns = useMemo(() => {
    if (compactMode) {
      return columns.filter((col) =>
        ['original_user_id', 'username', 'email', 'archived_at', 'action'].includes(col.key),
      );
    }
    return columns;
  }, [columns, compactMode]);

  return (
    <>
      <CardTable
        columns={tableColumns}
        dataSource={archivedUsers}
        scroll={compactMode ? undefined : { x: 'max-content' }}
        pagination={{
          currentPage: activePage,
          pageSize: pageSize,
          total: totalCount,
          pageSizeOpts: [10, 20, 50, 100],
          showSizeChanger: true,
          onPageSizeChange: handlePageSizeChange,
          onPageChange: handlePageChange,
        }}
        hidePagination={true}
        loading={loading}
        rowKey='id'
        empty={
          <Empty
            image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
            darkModeImage={
              <IllustrationNoResultDark style={{ width: 150, height: 150 }} />
            }
            description={t('暂无归档用户')}
            style={{ padding: 30 }}
          />
        }
        className='overflow-hidden'
        size='middle'
      />

      <RestoreUserModal
        visible={showRestoreModal}
        onCancel={() => setShowRestoreModal(false)}
        onConfirm={handleRestoreConfirm}
        user={modalUser}
        t={t}
      />

      <DeleteArchivedUserModal
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        user={modalUser}
        t={t}
      />
    </>
  );
};

export default ArchivedUsersTable;
