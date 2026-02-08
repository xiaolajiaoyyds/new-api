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
import { Link, useLocation } from 'react-router-dom';
import SkeletonWrapper from '../components/SkeletonWrapper';

const Navigation = ({
  mainNavLinks,
  isMobile,
  isLoading,
  userState,
  pricingRequireAuth,
}) => {
  const location = useLocation();

  const renderNavLinks = () => {
    const baseClasses =
      'flex-shrink-0 flex items-center gap-1 font-bold px-3 py-1.5 border-2 border-black dark:border-white transition-all';
    const shadowClasses =
      'shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none';

    return mainNavLinks.map((link) => {
      const linkContent = <span>{link.text}</span>;

      let targetPath = link.to;
      if (!link.isExternal) {
        if (link.itemKey === 'console' && !userState.user) {
          targetPath = '/login';
        }
        if (
          link.itemKey === 'pricing' &&
          pricingRequireAuth &&
          !userState.user
        ) {
          targetPath = '/login';
        }
        if (link.itemKey === 'chatRoom' && !userState.user) {
          targetPath = '/login';
        }
      }

      const isActive = !link.isExternal && location.pathname === targetPath;

      const bgClasses = isActive
        ? 'bg-[#ffdb33] dark:bg-[rgb(0,95,190)] text-black dark:text-white'
        : 'bg-white dark:bg-zinc-800 hover:bg-[#ffdb33] dark:hover:bg-[rgb(0,95,190)] hover:text-black dark:hover:text-white';

      const linkClasses = `${baseClasses} ${bgClasses} ${shadowClasses}`;

      if (link.isExternal) {
        return (
          <a
            key={link.itemKey}
            href={link.externalLink}
            target='_blank'
            rel='noopener noreferrer'
            className={linkClasses}
          >
            {linkContent}
          </a>
        );
      }

      return (
        <Link key={link.itemKey} to={targetPath} className={linkClasses}>
          {linkContent}
        </Link>
      );
    });
  };

  return (
    <nav className='flex flex-1 items-center justify-center gap-1 lg:gap-2 mx-2 md:mx-4 py-1 overflow-x-auto whitespace-nowrap scrollbar-hide'>
      <SkeletonWrapper
        loading={isLoading}
        type='navigation'
        count={4}
        width={60}
        height={16}
        isMobile={isMobile}
      >
        {renderNavLinks()}
      </SkeletonWrapper>
    </nav>
  );
};

export default Navigation;
