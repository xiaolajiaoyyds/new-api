import React, { useEffect } from 'react';
import CardPro from '../../common/ui/CardPro';
import ArchivedUsersTable from './ArchivedUsersTable';
import ArchivedUsersActions from './ArchivedUsersActions';
import ArchivedUsersFilters from './ArchivedUsersFilters';
import ArchivedUsersDescription from './ArchivedUsersDescription';
import CleanupModal from './modals/CleanupModal';
import { useArchivedUsersData } from '../../../hooks/archived-users/useArchivedUsersData';
import { useIsMobile } from '../../../hooks/common/useIsMobile';
import { createCardProPagination } from '../../../helpers/utils';

const ArchivedUsersPage = () => {
  const archivedUsersData = useArchivedUsersData();
  const isMobile = useIsMobile();

  const {
    showCleanupModal,
    setShowCleanupModal,
    previewCount,
    minDays,
    setMinDays,
    startId,
    setStartId,
    endId,
    setEndId,
    previewInactiveUsers,
    cleanupInactiveUsers,
    cleanupLoading,
    formInitValues,
    setFormApi,
    searchArchivedUsers,
    loading,
    searching,
    compactMode,
    setCompactMode,
    t,
  } = archivedUsersData;

  const handleOpenCleanup = async () => {
    await previewInactiveUsers(minDays, startId, endId);
    setShowCleanupModal(true);
  };

  useEffect(() => {
    if (showCleanupModal) {
      previewInactiveUsers(minDays, startId, endId);
    }
  }, [minDays, startId, endId, showCleanupModal]);

  return (
    <>
      <CleanupModal
        visible={showCleanupModal}
        onCancel={() => setShowCleanupModal(false)}
        onConfirm={cleanupInactiveUsers}
        previewCount={previewCount}
        minDays={minDays}
        setMinDays={setMinDays}
        startId={startId}
        setStartId={setStartId}
        endId={endId}
        setEndId={setEndId}
        onPreview={previewInactiveUsers}
        loading={cleanupLoading}
        t={t}
      />

      <CardPro
        type='type1'
        descriptionArea={
          <ArchivedUsersDescription
            compactMode={compactMode}
            setCompactMode={setCompactMode}
            t={t}
          />
        }
        actionsArea={
          <div className='flex flex-col md:flex-row justify-between items-center gap-2 w-full'>
            <ArchivedUsersActions
              onCleanup={handleOpenCleanup}
              t={t}
            />

            <div className='w-full md:w-full lg:w-auto order-1 md:order-2'>
              <ArchivedUsersFilters
                formInitValues={formInitValues}
                setFormApi={setFormApi}
                searchArchivedUsers={searchArchivedUsers}
                loading={loading}
                searching={searching}
                t={t}
              />
            </div>
          </div>
        }
        paginationArea={createCardProPagination({
          currentPage: archivedUsersData.activePage,
          pageSize: archivedUsersData.pageSize,
          total: archivedUsersData.totalCount,
          onPageChange: archivedUsersData.handlePageChange,
          onPageSizeChange: archivedUsersData.handlePageSizeChange,
          isMobile: isMobile,
          t: archivedUsersData.t,
        })}
        t={archivedUsersData.t}
      >
        <ArchivedUsersTable {...archivedUsersData} />
      </CardPro>
    </>
  );
};

export default ArchivedUsersPage;
