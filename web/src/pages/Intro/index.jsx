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

import React, { useEffect, useState } from 'react';
import { API, showError } from '../../helpers';
import { marked } from 'marked';
import { Empty } from '@douyinfe/semi-ui';
import {
  IllustrationConstruction,
  IllustrationConstructionDark,
} from '@douyinfe/semi-illustrations';
import { useTranslation } from 'react-i18next';

const Intro = () => {
  const { t } = useTranslation();
  const [intro, setIntro] = useState('');
  const [introLoaded, setIntroLoaded] = useState(false);

  const displayIntro = async () => {
    setIntro(localStorage.getItem('intro') || '');
    const res = await API.get('/api/intro');
    const { success, message, data } = res.data;
    if (success) {
      let introContent = data;
      if (!data.startsWith('https://')) {
        introContent = marked.parse(data);
      }
      setIntro(introContent);
      localStorage.setItem('intro', introContent);
    } else {
      showError(message);
      setIntro(t('加载内容失败...'));
    }
    setIntroLoaded(true);
  };

  useEffect(() => {
    displayIntro().then();
  }, []);

  const emptyStyle = {
    padding: '24px',
  };

  return (
    <div className='mt-[60px] px-2'>
      {introLoaded && intro === '' ? (
        <div className='flex justify-center items-center h-screen p-8'>
          <Empty
            image={
              <IllustrationConstruction style={{ width: 150, height: 150 }} />
            }
            darkModeImage={
              <IllustrationConstructionDark
                style={{ width: 150, height: 150 }}
              />
            }
            description={t('管理员暂时未设置任何内容')}
            style={emptyStyle}
          />
        </div>
      ) : (
        <>
          {intro.startsWith('https://') ? (
            <iframe
              src={intro}
              style={{ width: '100%', height: '100vh', border: 'none' }}
            />
          ) : (
            <div
              style={{ fontSize: 'larger' }}
              dangerouslySetInnerHTML={{ __html: intro }}
            ></div>
          )}
        </>
      )}
    </div>
  );
};

export default Intro;
