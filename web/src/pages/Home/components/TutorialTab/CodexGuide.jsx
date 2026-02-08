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
  Alert,
} from '../../../../components/retroui';
import { Github, Terminal, Copy } from 'lucide-react';
import { copy, showSuccess } from '../../../../helpers';

const CodexGuide = () => {
  const { t } = useTranslation();
  const [activeOS, setActiveOS] = useState('macos');
  const siteAddress = 'https://yyds.215.im';

  const installCommands = {
    npm: 'npm install -g @openai/codex',
    brew: 'brew install --cask codex',
  };

  const configContent = `# ~/.codex/config.toml
model_provider = "Wong"
model = "gpt-5.2"
model_reasoning_effort = "high"
disable_response_storage = true
preferred_auth_method = "apikey"
[model_providers.Wong]
name = "Wong"
base_url = "${siteAddress}/v1"
wire_api = "responses"
requires_openai_auth = true
env_key = "WONG_API_KEY"`;

  const envCommands = {
    windows: {
      temporary: `set WONG_API_KEY=your-api-key`,
      permanent: `setx WONG_API_KEY "your-api-key"`,
    },
    macos: {
      temporary: `export WONG_API_KEY=your-api-key`,
      permanent: `# 添加到 ~/.zshrc 或 ~/.bash_profile
echo 'export WONG_API_KEY=your-api-key' >> ~/.zshrc
source ~/.zshrc`,
    },
    linux: {
      temporary: `export WONG_API_KEY=your-api-key`,
      permanent: `# 添加到 ~/.bashrc
echo 'export WONG_API_KEY=your-api-key' >> ~/.bashrc
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

  const ListItem = ({ children, warning }) => (
    <div
      className={`py-2 ${warning ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-black dark:text-white'}`}
    >
      {children}
    </div>
  );

  return (
    <div className='space-y-4'>
      <Alert variant='info'>
        {t(
          'OpenAI Codex CLI 是 OpenAI 官方推出的本地编程代理工具，支持通过自定义代理使用，推荐使用 cc-switch 进行管理',
        )}
      </Alert>

      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Terminal className='w-5 h-5' />
            <CardTitle>{t('安装 Codex CLI')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <CodeBlock code={installCommands.npm} label={t('使用 npm 安装')} />
          <CodeBlock
            code={installCommands.brew}
            label={t('使用 Homebrew 安装 (macOS)')}
          />
          <div className='flex items-center gap-2 mt-4 flex-wrap'>
            <span className='text-gray-600 dark:text-gray-400'>
              {t('或从 GitHub 下载二进制文件')}
            </span>
            <Button
              size='sm'
              variant='secondary'
              onClick={() =>
                window.open(
                  'https://github.com/openai/codex/releases/latest',
                  '_blank',
                )
              }
            >
              <Github className='w-4 h-4 mr-1' />
              {t('GitHub Releases')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('配置代理')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 border-l-4 border-amber-500 pl-4 mb-4'>
            <ListItem>
              {t(
                '1. 请确保在 "codex" 专用分组创建 API Key（该分组仅支持 Codex CLI）',
              )}
            </ListItem>
            <ListItem>
              {t('2. 创建或编辑配置文件 ~/.codex/config.toml')}
            </ListItem>
          </div>
          <CodeBlock code={configContent} label={t('config.toml 配置示例')} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('设置环境变量')}</CardTitle>
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
                  code={envCommands[activeOS].temporary}
                  label={t('临时设置（当前终端会话有效）')}
                />
                <CodeBlock
                  code={envCommands[activeOS].permanent}
                  label={t('永久设置（需要重启终端生效）')}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('启动使用')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 border-l-4 border-green-500 pl-4 mb-4'>
            <ListItem>{t('配置完成后，在终端运行 codex 即可启动')}</ListItem>
            <ListItem>
              <span className='text-gray-600 dark:text-gray-400'>
                {t(
                  '首次运行会提示登录，选择 "Sign in with API key" 使用 API Key 登录',
                )}
              </span>
            </ListItem>
          </div>
          <CodeBlock code='codex' label={t('启动 Codex CLI')} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('注意事项')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 border-l-4 border-red-500 pl-4'>
            <ListItem warning>
              {t('请将 your-api-key 替换为您在 codex 分组创建的实际 API Key')}
            </ListItem>
            <ListItem>
              {t('Codex CLI 支持多种模型，可在 config.toml 中修改 model 参数')}
            </ListItem>
            <ListItem>
              <div className='flex items-center gap-2 flex-wrap'>
                <span>{t('更多配置选项请参考官方文档')}</span>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() =>
                    window.open('https://developers.openai.com/codex', '_blank')
                  }
                >
                  {t('查看文档')}
                </Button>
              </div>
            </ListItem>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodexGuide;
