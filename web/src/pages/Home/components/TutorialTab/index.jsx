import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../../../../components/retroui';
import OpenAIGuide from './OpenAIGuide';
import ClaudeCodeGuide from './ClaudeCodeGuide';
import CodexGuide from './CodexGuide';

const TutorialTab = () => {
  const { t } = useTranslation();

  return (
    <div className='w-full'>
      <Tabs defaultValue='openai' className='w-full'>
        <div
          className='mb-5 overflow-x-auto scrollbar-hide'
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <TabsList className='w-max'>
            <TabsTrigger value='openai'>{t('OpenAI 配置')}</TabsTrigger>
            <TabsTrigger value='claude'>{t('Claude Code')}</TabsTrigger>
            <TabsTrigger value='codex'>{t('Codex CLI')}</TabsTrigger>
          </TabsList>
        </div>

        <div className='w-full'>
          <TabsContent
            value='openai'
            className='focus:outline-none mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500'
          >
            <OpenAIGuide />
          </TabsContent>
          <TabsContent
            value='claude'
            className='focus:outline-none mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500'
          >
            <ClaudeCodeGuide />
          </TabsContent>
          <TabsContent
            value='codex'
            className='focus:outline-none mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500'
          >
            <CodexGuide />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default TutorialTab;
