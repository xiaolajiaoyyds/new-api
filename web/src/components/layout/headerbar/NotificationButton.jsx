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

import React from 'react';
import { Button, Badge } from '@douyinfe/semi-ui';
import { Bell } from 'lucide-react';

const NotificationButton = ({ unreadCount, onNoticeOpen, t }) => {
  const buttonElement = (
    <div
      onClick={onNoticeOpen}
      aria-label={t('系统公告')}
      className='p-1.5 border-2 border-black dark:border-white bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-700 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer transition-all'
    >
      <Bell size={18} />
    </div>
  );

  if (unreadCount > 0) {
    return (
      <Badge count={unreadCount} type='danger' overflowCount={99}>
        {buttonElement}
      </Badge>
    );
  }

  return buttonElement;
};

export default NotificationButton;
