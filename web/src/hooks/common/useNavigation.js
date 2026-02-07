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

import { useMemo, useContext } from 'react';
import { StatusContext } from '../../context/Status';

export const useNavigation = (t, docsLink, headerNavModules) => {
  const [statusState] = useContext(StatusContext);

  const mainNavLinks = useMemo(() => {
    // 默认配置，如果没有传入配置则显示所有模块
    const defaultModules = {
      home: true,
      customLink: false,
      console: true,
      pricing: true,
      chatRoom: true,
      docs: true,
      about: true,
    };

    // 使用传入的配置或默认配置
    const modules = headerNavModules || defaultModules;

    // 获取聊天室启用状态
    const chatRoomEnabled = statusState?.status?.chat_room_enabled ?? false;

    // 获取自定义链接配置
    const customLinkName = modules.customLink?.name || '';
    const customLinkUrl = modules.customLink?.url || '';
    const customLinkEnabled = modules.customLink?.enabled && customLinkName && customLinkUrl;

    const allLinks = [
      {
        text: t('首页'),
        itemKey: 'home',
        to: '/',
      },
      // 自定义外链
      ...(customLinkEnabled
        ? [
            {
              text: customLinkName,
              itemKey: 'customLink',
              isExternal: true,
              externalLink: customLinkUrl,
            },
          ]
        : []),
      {
        text: t('控制台'),
        itemKey: 'console',
        to: '/console',
      },
      {
        text: t('模型广场'),
        itemKey: 'pricing',
        to: '/pricing',
      },
      {
        text: t('聊天室'),
        itemKey: 'chatRoom',
        to: '/chat-room',
      },
      ...(docsLink
        ? [
            {
              text: t('文档'),
              itemKey: 'docs',
              isExternal: true,
              externalLink: docsLink,
            },
          ]
        : []),
      {
        text: modules.intro?.name || t('测速'),
        itemKey: 'intro',
        to: '/intro',
      },
      {
        text: modules.about?.name || t('关于'),
        itemKey: 'about',
        to: '/about',
      },
    ];

    // 根据配置过滤导航链接
    return allLinks.filter((link) => {
      if (link.itemKey === 'docs') {
        return docsLink && modules.docs !== false;
      }
      if (link.itemKey === 'pricing') {
        // 支持新的pricing配置格式
        return typeof modules.pricing === 'object'
          ? modules.pricing.enabled !== false
          : modules.pricing !== false;
      }
      if (link.itemKey === 'customLink') {
        return customLinkEnabled;
      }
      if (link.itemKey === 'chatRoom') {
        // 同时检查顶栏配置和聊天室功能开关
        return modules.chatRoom !== false && chatRoomEnabled;
      }
      return modules[link.itemKey] !== false;
    });
  }, [t, docsLink, headerNavModules, statusState?.status?.chat_room_enabled]);

  return {
    mainNavLinks,
  };
};
