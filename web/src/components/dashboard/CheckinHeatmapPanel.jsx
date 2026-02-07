/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Typography, Spin, Tooltip, Modal } from '@douyinfe/semi-ui';
import { Gift, CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import Turnstile from 'react-turnstile';
import { API, showError, showSuccess, renderQuota } from '../../helpers';

const CheckinHeatmapPanel = ({ t, status, turnstileEnabled, turnstileSiteKey, CARD_PROPS }) => {
  const [loading, setLoading] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [turnstileModalVisible, setTurnstileModalVisible] = useState(false);
  const [turnstileWidgetKey, setTurnstileWidgetKey] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [checkinData, setCheckinData] = useState({
    enabled: false,
    stats: {
      checked_in_today: false,
      total_checkins: 0,
      total_quota: 0,
      checkin_count: 0,
      records: [],
    },
  });

  // 创建日期到额度的映射
  const checkinRecordsMap = useMemo(() => {
    const map = {};
    const records = checkinData.stats?.records || [];
    records.forEach((record) => {
      map[record.checkin_date] = record.quota_awarded;
    });
    return map;
  }, [checkinData.stats?.records]);

  // 获取当前月份的日历数据
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 获取本月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 获取本月第一天是周几 (0=周日)
    const startDayOfWeek = firstDay.getDay();

    // 获取今天日期（本地时间）
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 生成日历格子
    const days = [];

    // 填充上月的空白
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: null, date: null });
    }

    // 填充本月的日期
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        date: dateStr,
        isToday: dateStr === todayStr,
        quota: checkinRecordsMap[dateStr],
      });
    }

    return days;
  }, [currentDate, checkinRecordsMap]);

  // 获取签到状态
  const fetchCheckinStatus = async () => {
    setLoading(true);
    try {
      const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const res = await API.get(`/api/user/checkin?month=${month}`);
      const { success, data, message } = res.data;
      if (success) {
        setCheckinData(data);
      } else {
        showError(message || t('获取签到状态失败'));
      }
    } catch (error) {
      showError(t('获取签到状态失败'));
    } finally {
      setLoading(false);
    }
  };

  const postCheckin = async (token) => {
    const url = token
      ? `/api/user/checkin?turnstile=${encodeURIComponent(token)}`
      : '/api/user/checkin';
    return API.post(url);
  };

  const shouldTriggerTurnstile = (message) => {
    if (!turnstileEnabled) return false;
    if (typeof message !== 'string') return true;
    return message.includes('Turnstile');
  };

  const doCheckin = async (token) => {
    setCheckinLoading(true);
    try {
      const res = await postCheckin(token);
      const { success, data, message } = res.data;
      if (success) {
        showSuccess(
          t('签到成功！获得') + ' ' + renderQuota(data.quota_awarded),
        );
        fetchCheckinStatus();
        setTurnstileModalVisible(false);
      } else {
        if (!token && shouldTriggerTurnstile(message)) {
          if (!turnstileSiteKey) {
            showError('Turnstile is enabled but site key is empty.');
            return;
          }
          setTurnstileModalVisible(true);
          return;
        }
        if (token && shouldTriggerTurnstile(message)) {
          setTurnstileWidgetKey((v) => v + 1);
        }
        showError(message || t('签到失败'));
      }
    } catch (error) {
      showError(t('签到失败'));
    } finally {
      setCheckinLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  useEffect(() => {
    if (status?.checkin_enabled) {
      fetchCheckinStatus();
    }
  }, [status?.checkin_enabled, currentDate]);

  if (!status?.checkin_enabled) {
    return null;
  }

  const weekDays = [t('日'), t('一'), t('二'), t('三'), t('四'), t('五'), t('六')];
  const monthNames = [
    t('1月'), t('2月'), t('3月'), t('4月'), t('5月'), t('6月'),
    t('7月'), t('8月'), t('9月'), t('10月'), t('11月'), t('12月')
  ];

  return (
    <Card {...CARD_PROPS}>
      <Modal
        title={t('安全验证')}
        visible={turnstileModalVisible}
        footer={null}
        centered
        onCancel={() => {
          setTurnstileModalVisible(false);
          setTurnstileWidgetKey((v) => v + 1);
        }}
      >
        <div className="flex justify-center py-2">
          <Turnstile
            key={turnstileWidgetKey}
            sitekey={turnstileSiteKey}
            onVerify={(token) => {
              doCheckin(token);
            }}
            onExpire={() => {
              setTurnstileWidgetKey((v) => v + 1);
            }}
          />
        </div>
      </Modal>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CalendarCheck size={18} className="text-green-600" />
          </div>
          <div>
            <Typography.Text className="text-base font-semibold">
              {t('签到日历')}
            </Typography.Text>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t('累计签到')} {checkinData.stats?.total_checkins || 0} {t('天')}
            </div>
          </div>
        </div>
        <Button
          type="primary"
          theme="solid"
          size="small"
          icon={<Gift size={14} />}
          onClick={() => doCheckin()}
          loading={checkinLoading || loading}
          disabled={loading || checkinData.stats?.checked_in_today}
          className="!bg-green-600 hover:!bg-green-700 !rounded-lg"
        >
          {loading
            ? t('加载中')
            : checkinData.stats?.checked_in_today
              ? t('已签到')
              : t('签到')}
        </Button>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft size={16} className="text-gray-500" />
        </button>
        <Typography.Text className="text-sm font-medium">
          {currentDate.getFullYear()}{t('年')} {monthNames[currentDate.getMonth()]}
        </Typography.Text>
        <button
          onClick={handleNextMonth}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Calendar */}
      <Spin spinning={loading}>
        <div className="select-none">
          {/* 星期头 */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map((day, idx) => (
              <div
                key={idx}
                className="text-center text-[10px] text-gray-400 font-medium py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((item, idx) => {
              if (!item.day) {
                return <div key={idx} className="aspect-square" />;
              }

              const isCheckedIn = item.quota !== undefined;

              const dayElement = (
                <div className="aspect-square flex items-center justify-center">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center cursor-default"
                    style={isCheckedIn ? {
                      background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
                      color: 'white',
                    } : {}}
                  >
                    <span className={`text-xs font-medium ${isCheckedIn ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      {item.day}
                    </span>
                  </div>
                </div>
              );

              if (isCheckedIn) {
                return (
                  <Tooltip
                    key={idx}
                    content={`${item.date}: ${t('获得')} ${renderQuota(item.quota)}`}
                    position="top"
                  >
                    {dayElement}
                  </Tooltip>
                );
              }

              return <div key={idx}>{dayElement}</div>;
            })}
          </div>
        </div>
      </Spin>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">
            {checkinData.stats?.checkin_count || 0}
          </div>
          <div className="text-[10px] text-gray-500">{t('本月签到')}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {renderQuota(checkinData.stats?.total_quota || 0, 6)}
          </div>
          <div className="text-[10px] text-gray-500">{t('累计获得')}</div>
        </div>
      </div>
    </Card>
  );
};

export default CheckinHeatmapPanel;
