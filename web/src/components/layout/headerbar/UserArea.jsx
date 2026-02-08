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

import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Button, Dropdown, Typography } from '@douyinfe/semi-ui';
import { ChevronDown } from 'lucide-react';
import {
  IconExit,
  IconUserSetting,
  IconCreditCard,
  IconKey,
} from '@douyinfe/semi-icons';
import { stringToColor } from '../../../helpers';
import SkeletonWrapper from '../components/SkeletonWrapper';
import { useActualTheme } from '../../../context/Theme';

const UserArea = ({
  userState,
  isLoading,
  isMobile,
  isSelfUseMode,
  logout,
  navigate,
  t,
}) => {
  const dropdownRef = useRef(null);
  const actualTheme = useActualTheme();
  const isDark = actualTheme === 'dark';

  const menuStyle = {
    backgroundColor: isDark ? 'rgb(39, 39, 42)' : 'white',
    border: `2px solid ${isDark ? 'rgb(161, 161, 170)' : 'black'}`,
    boxShadow: isDark
      ? '3px 3px 0 0 rgba(255,255,255,0.2)'
      : '3px 3px 0 0 #000',
    borderRadius: 0,
  };

  const itemStyle = {
    padding: '6px 12px',
    fontSize: '14px',
    color: isDark ? 'white' : 'black',
  };

  const iconColor = isDark ? 'rgb(209, 213, 219)' : 'rgb(75, 85, 99)';
  if (isLoading) {
    return (
      <SkeletonWrapper
        loading={true}
        type='userArea'
        width={50}
        isMobile={isMobile}
      />
    );
  }

  if (userState.user) {
    return (
      <div className='relative' ref={dropdownRef}>
        <Dropdown
          position='bottomRight'
          getPopupContainer={() => dropdownRef.current}
          render={
            <Dropdown.Menu style={menuStyle}>
              <Dropdown.Item
                onClick={() => navigate('/console/personal')}
                style={itemStyle}
              >
                <div className='flex items-center gap-2'>
                  <IconUserSetting size='small' style={{ color: iconColor }} />
                  <span>{t('个人设置')}</span>
                </div>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => navigate('/console/token')}
                style={itemStyle}
              >
                <div className='flex items-center gap-2'>
                  <IconKey size='small' style={{ color: iconColor }} />
                  <span>{t('令牌管理')}</span>
                </div>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => navigate('/console/topup')}
                style={itemStyle}
              >
                <div className='flex items-center gap-2'>
                  <IconCreditCard size='small' style={{ color: iconColor }} />
                  <span>{t('钱包管理')}</span>
                </div>
              </Dropdown.Item>
              <Dropdown.Item onClick={logout} style={itemStyle}>
                <div className='flex items-center gap-2'>
                  <IconExit size='small' style={{ color: iconColor }} />
                  <span>{t('退出')}</span>
                </div>
              </Dropdown.Item>
            </Dropdown.Menu>
          }
        >
          <Button
            theme='borderless'
            type='tertiary'
            className='flex items-center gap-1.5 !p-1.5 !rounded-none active:!translate-x-[2px] active:!translate-y-[2px] active:!shadow-none'
            style={{
              backgroundColor: isDark ? 'rgb(39, 39, 42)' : 'white',
              border: `2px solid ${isDark ? 'rgb(161, 161, 170)' : 'black'}`,
              boxShadow: isDark
                ? '2px 2px 0 0 rgba(255,255,255,0.2)'
                : '2px 2px 0 0 #000',
            }}
          >
            <Avatar
              size='extra-small'
              color={stringToColor(userState.user.username)}
              className='mr-1 !border-0'
            >
              {userState.user.username[0].toUpperCase()}
            </Avatar>
            <span className='hidden md:inline'>
              <Typography.Text
                className='!text-xs !font-medium mr-1'
                style={{ color: isDark ? 'rgb(209, 213, 219)' : 'inherit' }}
              >
                {userState.user.username}
              </Typography.Text>
            </span>
            <ChevronDown
              size={14}
              style={{
                color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
              }}
            />
          </Button>
        </Dropdown>
      </div>
    );
  } else {
    const showRegisterButton = !isSelfUseMode;

    return (
      <div className='flex items-center gap-2'>
        <Link to='/login' className='flex'>
          <button className='flex items-center justify-center px-3 py-1.5 text-xs font-bold border-2 border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all'>
            {t('登录')}
          </button>
        </Link>
        {showRegisterButton && (
          <div className='hidden md:block'>
            <Link to='/register' className='flex'>
              <button className='flex items-center justify-center px-3 py-1.5 text-xs font-bold border-2 border-black dark:border-white bg-[#ffdb33] dark:bg-[rgb(0,95,190)] text-black dark:text-white hover:bg-[#f5d000] dark:hover:bg-[rgb(0,80,170)] shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all'>
                {t('注册')}
              </button>
            </Link>
          </div>
        )}
      </div>
    );
  }
};

export default UserArea;
