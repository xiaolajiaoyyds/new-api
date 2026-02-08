import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  Button,
} from '../../../../components/retroui';
import { Copy } from 'lucide-react';
import { copy, showSuccess } from '../../../../helpers';

const OpenAIGuide = () => {
  const { t } = useTranslation();
  const siteAddress = 'https://yyds.215.im';

  const codeExample = `OPENAI_API_KEY=sk-xxxxxx
OPENAI_BASE_URL=${siteAddress}/v1`;

  const handleCopy = async (text) => {
    const ok = await copy(text);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  const StepCircle = ({ num }) => (
    <span className='bg-amber-500 text-black border-2 border-black dark:border-white w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0'>
      {num}
    </span>
  );

  return (
    <div className='space-y-4'>
      <Alert variant='warning'>
        {t('注意：仅 default 分组的 API Key 支持 OpenAI 格式调用')}
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>{t('基础配置')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <h4 className='font-bold text-black dark:text-white mb-2'>
              {t('站点地址')}
            </h4>
            <div className='flex items-center gap-2'>
              <code className='flex-1 bg-gray-100 dark:bg-zinc-800 px-4 py-2 border-2 border-black dark:border-white font-mono text-sm'>
                {siteAddress}
              </code>
              <Button
                size='sm'
                variant='secondary'
                onClick={() => handleCopy(siteAddress)}
              >
                <Copy className='w-4 h-4' />
              </Button>
            </div>
          </div>

          <div>
            <h4 className='font-bold text-black dark:text-white mb-2'>
              {t('配置示例')}
            </h4>
            <div className='relative'>
              <pre className='bg-gray-100 dark:bg-zinc-800 p-4 border-2 border-black dark:border-white font-mono text-sm overflow-x-auto whitespace-pre-wrap'>
                <code>{codeExample}</code>
              </pre>
              <Button
                size='sm'
                variant='secondary'
                className='absolute top-2 right-2'
                onClick={() => handleCopy(codeExample)}
              >
                <Copy className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('使用说明')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-start gap-3'>
              <StepCircle num={1} />
              <span className='text-black dark:text-white pt-0.5'>
                {t('登录后进入控制台，创建一个新的 API Key')}
              </span>
            </div>
            <div className='flex items-start gap-3'>
              <StepCircle num={2} />
              <span className='text-black dark:text-white pt-0.5'>
                {t('确保 API Key 属于 default 分组')}
              </span>
            </div>
            <div className='flex items-start gap-3'>
              <StepCircle num={3} />
              <span className='text-black dark:text-white pt-0.5'>
                {t('将 Base URL 设置为上述站点地址')}
              </span>
            </div>
            <div className='flex items-start gap-3'>
              <StepCircle num={4} />
              <span className='text-black dark:text-white pt-0.5'>
                {t('使用创建的 API Key 作为 OPENAI_API_KEY')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpenAIGuide;
