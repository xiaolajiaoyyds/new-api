import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
} from '../../../../components/retroui';
import { Github, Terminal, Copy } from 'lucide-react';
import { copy, showSuccess } from '../../../../helpers';

const ClaudeCodeGuide = () => {
  const { t } = useTranslation();
  const [activeOS, setActiveOS] = useState('macos');
  const siteAddress = 'https://yyds.215.im';

  const commands = {
    windows: {
      temporary: `set ANTHROPIC_BASE_URL=${siteAddress}
set ANTHROPIC_AUTH_TOKEN=your-api-key`,
      permanent: `setx ANTHROPIC_BASE_URL "${siteAddress}"
setx ANTHROPIC_AUTH_TOKEN "your-api-key"`,
    },
    macos: {
      temporary: `export ANTHROPIC_BASE_URL=${siteAddress}
export ANTHROPIC_AUTH_TOKEN=your-api-key`,
      permanent: `# 添加到 ~/.zshrc 或 ~/.bash_profile
echo 'export ANTHROPIC_BASE_URL=${siteAddress}' >> ~/.zshrc
echo 'export ANTHROPIC_AUTH_TOKEN=your-api-key' >> ~/.zshrc
source ~/.zshrc`,
    },
    linux: {
      temporary: `export ANTHROPIC_BASE_URL=${siteAddress}
export ANTHROPIC_AUTH_TOKEN=your-api-key`,
      permanent: `# 添加到 ~/.bashrc
echo 'export ANTHROPIC_BASE_URL=${siteAddress}' >> ~/.bashrc
echo 'export ANTHROPIC_AUTH_TOKEN=your-api-key' >> ~/.bashrc
source ~/.bashrc`,
    },
  };

  const handleCopy = async (text) => {
    const ok = await copy(text);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  const CodeBlock = ({ code, label }) => (
    <div>
      <div className='flex items-center justify-between mb-2'>
        <span className='text-sm text-gray-600 dark:text-gray-400 font-medium'>
          {label}
        </span>
        <Button size='sm' variant='secondary' onClick={() => handleCopy(code)}>
          <Copy className='w-4 h-4' />
        </Button>
      </div>
      <pre className='bg-gray-100 dark:bg-zinc-800 p-4 border-2 border-black dark:border-white font-mono text-sm overflow-x-auto whitespace-pre-wrap'>
        <code>{code}</code>
      </pre>
    </div>
  );

  const ListItem = ({ children, secondary }) => (
    <div
      className={`py-2 ${secondary ? 'text-gray-600 dark:text-gray-400' : 'text-black dark:text-white'}`}
    >
      {children}
    </div>
  );

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Terminal className='w-5 h-5' />
            <CardTitle>{t('使用前准备')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 border-l-4 border-amber-500 pl-4'>
            <ListItem>
              {t(
                '1. 请确保在 "claude code" 专用分组创建 API Key（该分组仅用于 Claude Code CLI）',
              )}
            </ListItem>
            <ListItem>
              <div className='flex items-center gap-2 flex-wrap'>
                <span>{t('2. 推荐使用 cc-switch 工具快速切换环境')}</span>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={() =>
                    window.open(
                      'https://github.com/farion1231/cc-switch/releases',
                      '_blank',
                    )
                  }
                >
                  <Github className='w-4 h-4 mr-1' />
                  {t('下载 cc-switch')}
                </Button>
              </div>
            </ListItem>
            <ListItem secondary>
              {t(
                'cc-switch 是一个图形化工具，可以方便地管理多个 Claude Code 配置',
              )}
            </ListItem>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('终端配置指南')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeOS} onValueChange={setActiveOS} className='mb-4'>
            <TabsList>
              <TabsTrigger value='macos'>macOS</TabsTrigger>
              <TabsTrigger value='linux'>Linux</TabsTrigger>
              <TabsTrigger value='windows'>Windows</TabsTrigger>
            </TabsList>
            <TabsContent value={activeOS}>
              <div className='space-y-6 mt-4'>
                <CodeBlock
                  code={commands[activeOS].temporary}
                  label={t('临时设置（当前终端会话有效）')}
                />
                <CodeBlock
                  code={commands[activeOS].permanent}
                  label={t('永久设置（需要重启终端生效）')}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('注意事项')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 border-l-4 border-red-500 pl-4'>
            <ListItem>
              <span className='text-amber-600 dark:text-amber-400 font-medium'>
                {t(
                  '请将 your-api-key 替换为您在 claude code 分组创建的实际 API Key',
                )}
              </span>
            </ListItem>
            <ListItem>
              {t('永久设置后需要重新打开终端或执行 source 命令才能生效')}
            </ListItem>
            <ListItem>
              {t('Windows 用户使用 setx 命令后需要重新打开命令提示符')}
            </ListItem>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaudeCodeGuide;
