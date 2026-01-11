import { useState, useEffect } from 'react';
import { API, showError, showSuccess } from '../../helpers';
import { ITEMS_PER_PAGE } from '../../constants';
import { useTranslation } from 'react-i18next';
import { useTableCompactMode } from '../common/useTableCompactMode';

export const useArchivedUsersData = () => {
  const { t } = useTranslation();

  const [archivedUsers, setArchivedUsers] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const [totalCount, setTotalCount] = useState(0);

  const [previewCount, setPreviewCount] = useState(0);
  const [minDays, setMinDays] = useState(7);
  const [startId, setStartId] = useState(0);
  const [endId, setEndId] = useState(0);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  const [formApi, setFormApi] = useState(null);
  const [compactMode, setCompactMode] = useTableCompactMode('archived-users');

  const formInitValues = { searchKeyword: '' };

  const getFormValues = () => {
    const formValues = formApi ? formApi.getValues() : {};
    return { searchKeyword: formValues.searchKeyword || '' };
  };

  const loadArchivedUsers = async (page = 1, size = pageSize) => {
    setLoading(true);
    try {
      const res = await API.get(`/api/archived-user/?p=${page}&page_size=${size}`);
      const { success, message, data } = res.data;
      if (success) {
        setActivePage(data.page <= 0 ? 1 : data.page);
        setTotalCount(data.total);
        setArchivedUsers(data.items || []);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message);
    }
    setLoading(false);
  };

  const searchArchivedUsers = async () => {
    const { searchKeyword } = getFormValues();
    if (searchKeyword === '') {
      await loadArchivedUsers(1, pageSize);
      return;
    }

    setSearching(true);
    try {
      const res = await API.get(
        `/api/archived-user/search?keyword=${searchKeyword}&p=1&page_size=${pageSize}`,
      );
      const { success, message, data } = res.data;
      if (success) {
        setActivePage(data.page || 1);
        setTotalCount(data.total);
        setArchivedUsers(data.items || []);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message);
    }
    setSearching(false);
  };

  const previewInactiveUsers = async (days = minDays, sId = startId, eId = endId) => {
    setLoading(true);
    try {
      const res = await API.get(`/api/archived-user/inactive/preview?min_days=${days}&start_id=${sId}&end_id=${eId}`);
      const { success, message, data } = res.data;
      if (success) {
        setPreviewCount(data.count);
        setMinDays(data.min_days);
        setStartId(data.start_id);
        setEndId(data.end_id);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message);
    }
    setLoading(false);
  };

  const loadInactiveUsers = async (days = minDays, sId = startId, eId = endId) => {
    setLoading(true);
    try {
      const res = await API.get(`/api/archived-user/inactive?min_days=${days}&start_id=${sId}&end_id=${eId}`);
      const { success, message, data } = res.data;
      if (success) {
        setInactiveUsers(data || []);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message);
    }
    setLoading(false);
  };

  const cleanupInactiveUsers = async (days, sId, eId, reason = '') => {
    setCleanupLoading(true);
    try {
      const res = await API.post('/api/archived-user/inactive/cleanup', {
        min_days: days,
        start_id: sId,
        end_id: eId,
        reason: reason || t('不活跃用户清理'),
      });
      const { success, message, data } = res.data;
      if (success) {
        showSuccess(t('成功清理 {{count}} 个不活跃用户', { count: data.cleaned_count }));
        setShowCleanupModal(false);
        await loadArchivedUsers(1, pageSize);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message);
    }
    setCleanupLoading(false);
  };

  const restoreUser = async (id) => {
    setLoading(true);
    try {
      const res = await API.post(`/api/archived-user/${id}/restore`);
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('用户恢复成功'));
        await refresh();
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message);
    }
    setLoading(false);
  };

  const deleteArchivedUser = async (id) => {
    setLoading(true);
    try {
      const res = await API.delete(`/api/archived-user/${id}`);
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('归档记录已永久删除'));
        await refresh();
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message);
    }
    setLoading(false);
  };

  const refresh = async (page = activePage) => {
    const { searchKeyword } = getFormValues();
    if (searchKeyword === '') {
      await loadArchivedUsers(page, pageSize);
    } else {
      await searchArchivedUsers();
    }
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    const { searchKeyword } = getFormValues();
    if (searchKeyword === '') {
      loadArchivedUsers(page, pageSize);
    } else {
      searchArchivedUsers();
    }
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setActivePage(1);
    const { searchKeyword } = getFormValues();
    if (searchKeyword === '') {
      loadArchivedUsers(1, size);
    } else {
      searchArchivedUsers();
    }
  };

  useEffect(() => {
    loadArchivedUsers(1, pageSize);
  }, [pageSize]);

  return {
    archivedUsers,
    inactiveUsers,
    loading,
    searching,
    activePage,
    pageSize,
    totalCount,

    previewCount,
    minDays,
    setMinDays,
    startId,
    setStartId,
    endId,
    setEndId,
    showCleanupModal,
    setShowCleanupModal,
    showPreviewModal,
    setShowPreviewModal,
    cleanupLoading,

    formApi,
    formInitValues,
    compactMode,
    setCompactMode,

    loadArchivedUsers,
    searchArchivedUsers,
    previewInactiveUsers,
    loadInactiveUsers,
    cleanupInactiveUsers,
    restoreUser,
    deleteArchivedUser,
    refresh,

    setActivePage,
    setPageSize,
    setFormApi,
    setLoading,

    handlePageChange,
    handlePageSizeChange,
    getFormValues,

    t,
  };
};
