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

import React, { useEffect, useState, useContext } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Switch,
  Typography,
  Input,
} from '@douyinfe/semi-ui';
import { API, showError, showSuccess } from '../../../helpers';
import { useTranslation } from 'react-i18next';
import { StatusContext } from '../../../context/Status';

const { Text } = Typography;

export default function SettingsHeaderNavModules(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [statusState, statusDispatch] = useContext(StatusContext);

  // 顶栏模块管理状态
  const [headerNavModules, setHeaderNavModules] = useState({
    home: true,
    console: true,
    pricing: {
      enabled: true,
      requireAuth: false, // 默认不需要登录鉴权
    },
    chatRoom: true,
    docs: true,
    about: {
      enabled: true,
      name: '', // 自定义名称，为空时使用默认"关于"
    },
    customLink: {
      enabled: false,
      name: '',
      url: '',
    },
  });

  // 处理顶栏模块配置变更
  function handleHeaderNavModuleChange(moduleKey) {
    return (checked) => {
      const newModules = { ...headerNavModules };
      if (moduleKey === 'pricing' || moduleKey === 'about' || moduleKey === 'intro') {
        // 对于pricing、about和intro模块，只更新enabled属性
        newModules[moduleKey] = {
          ...newModules[moduleKey],
          enabled: checked,
        };
      } else {
        newModules[moduleKey] = checked;
      }
      setHeaderNavModules(newModules);
    };
  }

  // 处理模型广场权限控制变更
  function handlePricingAuthChange(checked) {
    const newModules = { ...headerNavModules };
    newModules.pricing = {
      ...newModules.pricing,
      requireAuth: checked,
    };
    setHeaderNavModules(newModules);
  }

  // 重置顶栏模块为默认配置
  function resetHeaderNavModules() {
    const defaultModules = {
      home: true,
      console: true,
      pricing: {
        enabled: true,
        requireAuth: false,
      },
      chatRoom: true,
      docs: true,
      intro: {
        enabled: true,
        name: '', // 自定义名称，为空时使用默认"测速"
      },
      about: {
        enabled: true,
        name: '',
      },
      customLink: {
        enabled: false,
        name: '',
        url: '',
      },
    };
    setHeaderNavModules(defaultModules);
    showSuccess(t('已重置为默认配置'));
  }

  // 保存配置
  async function onSubmit() {
    setLoading(true);
    try {
      const res = await API.put('/api/option/', {
        key: 'HeaderNavModules',
        value: JSON.stringify(headerNavModules),
      });
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('保存成功'));

        // 立即更新StatusContext中的状态
        statusDispatch({
          type: 'set',
          payload: {
            ...statusState.status,
            HeaderNavModules: JSON.stringify(headerNavModules),
          },
        });

        // 刷新父组件状态
        if (props.refresh) {
          await props.refresh();
        }
      } else {
        showError(message);
      }
    } catch (error) {
      showError(t('保存失败，请重试'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 从 props.options 中获取配置
    if (props.options && props.options.HeaderNavModules) {
      try {
        const modules = JSON.parse(props.options.HeaderNavModules);

        // 处理向后兼容性：如果pricing是boolean，转换为对象格式
        if (typeof modules.pricing === 'boolean') {
          modules.pricing = {
            enabled: modules.pricing,
            requireAuth: false, // 默认不需要登录鉴权
          };
        }

        // 处理自定义链接的向后兼容性
        if (!modules.customLink) {
          modules.customLink = {
            enabled: false,
            name: '',
            url: '',
          };
        }

        // 确保 chatRoom 存在
        if (modules.chatRoom === undefined) {
          modules.chatRoom = true;
        }

        // 处理about的向后兼容性：如果about是boolean，转换为对象格式
        if (typeof modules.about === 'boolean') {
          modules.about = {
            enabled: modules.about,
            name: '',
          };
        } else if (!modules.about) {
          modules.about = {
            enabled: true,
            name: '',
          };
        }

        // 处理intro的向后兼容性：如果intro是boolean，转换为对象格式
        if (typeof modules.intro === 'boolean') {
          modules.intro = {
            enabled: modules.intro,
            name: '',
          };
        } else if (!modules.intro) {
          modules.intro = {
            enabled: true,
            name: '',
          };
        }

        setHeaderNavModules(modules);
      } catch (error) {
        // 使用默认配置
        const defaultModules = {
          home: true,
          console: true,
          pricing: {
            enabled: true,
            requireAuth: false,
          },
          chatRoom: true,
          docs: true,
          about: true,
          customLink: {
            enabled: false,
            name: '',
            url: '',
          },
        };
        setHeaderNavModules(defaultModules);
      }
    }
  }, [props.options]);

  // 模块配置数据
  const moduleConfigs = [
    {
      key: 'home',
      title: t('首页'),
      description: t('用户主页，展示系统信息'),
    },
    {
      key: 'console',
      title: t('控制台'),
      description: t('用户控制面板，管理账户'),
    },
    {
      key: 'pricing',
      title: t('模型广场'),
      description: t('模型定价，需要登录访问'),
      hasSubConfig: true, // 标识该模块有子配置
    },
    {
      key: 'chatRoom',
      title: t('聊天室'),
      description: t('用户聊天室功能'),
    },
    {
      key: 'docs',
      title: t('文档'),
      description: t('系统文档和帮助信息'),
    },
    {
      key: 'intro',
      title: t('测速'),
      description: t('测速页面，可自定义内容'),
      hasSubConfig: true, // 标识该模块有子配置
    },
    {
      key: 'about',
      title: t('关于'),
      description: t('关于系统的详细信息'),
      hasSubConfig: true, // 标识该模块有子配置
    },
  ];

  return (
    <Card>
      <Form.Section
        text={t('顶栏管理')}
        extraText={t('控制顶栏模块显示状态，全局生效')}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px', maxWidth: '1200px' }}>
            {moduleConfigs.map((module) => (
              <Col key={module.key} xs={24} sm={12} md={8} lg={6} xl={6}>
              <Card
                style={{
                  borderRadius: '8px',
                  border: '1px solid var(--semi-color-border)',
                  transition: 'all 0.2s ease',
                  background: 'var(--semi-color-bg-1)',
                  minHeight: '80px',
                }}
                bodyStyle={{ padding: '16px' }}
                hoverable
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div
                      style={{
                        fontWeight: '600',
                        fontSize: '14px',
                        color: 'var(--semi-color-text-0)',
                        marginBottom: '4px',
                      }}
                    >
                      {module.title}
                    </div>
                    <Text
                      type='secondary'
                      size='small'
                      style={{
                        fontSize: '12px',
                        color: 'var(--semi-color-text-2)',
                        lineHeight: '1.4',
                        display: 'block',
                      }}
                    >
                      {module.description}
                    </Text>
                  </div>
                  <div style={{ marginLeft: '16px' }}>
                    <Switch
                      checked={
                        module.key === 'pricing' || module.key === 'about' || module.key === 'intro'
                          ? headerNavModules[module.key]?.enabled
                          : headerNavModules[module.key]
                      }
                      onChange={handleHeaderNavModuleChange(module.key)}
                      size='default'
                    />
                  </div>
                </div>

                {/* 为模型广场添加权限控制子开关 */}
                {module.key === 'pricing' &&
                  (module.key === 'pricing'
                    ? headerNavModules[module.key]?.enabled
                    : headerNavModules[module.key]) && (
                    <div
                      style={{
                        borderTop: '1px solid var(--semi-color-border)',
                        marginTop: '12px',
                        paddingTop: '12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div
                            style={{
                              fontWeight: '500',
                              fontSize: '12px',
                              color: 'var(--semi-color-text-1)',
                              marginBottom: '2px',
                            }}
                          >
                            {t('需要登录访问')}
                          </div>
                          <Text
                            type='secondary'
                            size='small'
                            style={{
                              fontSize: '11px',
                              color: 'var(--semi-color-text-2)',
                              lineHeight: '1.4',
                              display: 'block',
                            }}
                          >
                            {t('开启后未登录用户无法访问模型广场')}
                          </Text>
                        </div>
                        <div style={{ marginLeft: '16px' }}>
                          <Switch
                            checked={
                              headerNavModules.pricing?.requireAuth || false
                            }
                            onChange={handlePricingAuthChange}
                            size='default'
                          />
                        </div>
                      </div>
                    </div>
                  )}

                {/* 为测速添加自定义名称输入 */}
                {module.key === 'intro' && headerNavModules.intro?.enabled && (
                  <div
                    style={{
                      borderTop: '1px solid var(--semi-color-border)',
                      marginTop: '12px',
                      paddingTop: '12px',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: '12px',
                        color: 'var(--semi-color-text-1)',
                        marginBottom: '4px',
                        display: 'block',
                      }}
                    >
                      {t('自定义名称')}
                    </Text>
                    <Input
                      value={headerNavModules.intro?.name || ''}
                      onChange={(value) => {
                        setHeaderNavModules({
                          ...headerNavModules,
                          intro: {
                            ...headerNavModules.intro,
                            name: value,
                          },
                        });
                      }}
                      placeholder={t('留空使用默认"测速"')}
                      size='small'
                    />
                  </div>
                )}

                {/* 为关于添加自定义名称输入 */}
                {module.key === 'about' && headerNavModules.about?.enabled && (
                  <div
                    style={{
                      borderTop: '1px solid var(--semi-color-border)',
                      marginTop: '12px',
                      paddingTop: '12px',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: '12px',
                        color: 'var(--semi-color-text-1)',
                        marginBottom: '4px',
                        display: 'block',
                      }}
                    >
                      {t('自定义名称')}
                    </Text>
                    <Input
                      value={headerNavModules.about?.name || ''}
                      onChange={(value) => {
                        setHeaderNavModules({
                          ...headerNavModules,
                          about: {
                            ...headerNavModules.about,
                            name: value,
                          },
                        });
                      }}
                      placeholder={t('留空使用默认"关于"')}
                      size='small'
                    />
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
        </div>

        {/* 自定义外链配置 */}
        <Card
          style={{
            borderRadius: '8px',
            border: '1px solid var(--semi-color-border)',
            background: 'var(--semi-color-bg-1)',
            marginBottom: '24px',
          }}
          bodyStyle={{ padding: '16px' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div
                style={{
                  fontWeight: '600',
                  fontSize: '14px',
                  color: 'var(--semi-color-text-0)',
                  marginBottom: '4px',
                }}
              >
                {t('自定义外链')}
              </div>
              <Text
                type='secondary'
                size='small'
                style={{
                  fontSize: '12px',
                  color: 'var(--semi-color-text-2)',
                  lineHeight: '1.4',
                  display: 'block',
                }}
              >
                {t('在顶栏添加自定义外部链接')}
              </Text>
            </div>
            <div style={{ marginLeft: '16px' }}>
              <Switch
                checked={headerNavModules.customLink?.enabled || false}
                onChange={(checked) => {
                  setHeaderNavModules({
                    ...headerNavModules,
                    customLink: {
                      ...headerNavModules.customLink,
                      enabled: checked,
                    },
                  });
                }}
                size='default'
              />
            </div>
          </div>

          {headerNavModules.customLink?.enabled && (
            <div
              style={{
                borderTop: '1px solid var(--semi-color-border)',
                paddingTop: '12px',
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text
                      style={{
                        fontSize: '12px',
                        color: 'var(--semi-color-text-1)',
                        marginBottom: '4px',
                        display: 'block',
                      }}
                    >
                      {t('链接名称')}
                    </Text>
                    <Input
                      value={headerNavModules.customLink?.name || ''}
                      onChange={(value) => {
                        setHeaderNavModules({
                          ...headerNavModules,
                          customLink: {
                            ...headerNavModules.customLink,
                            name: value,
                          },
                        });
                      }}
                      placeholder={t('例如：商店')}
                      size='default'
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text
                      style={{
                        fontSize: '12px',
                        color: 'var(--semi-color-text-1)',
                        marginBottom: '4px',
                        display: 'block',
                      }}
                    >
                      {t('链接地址')}
                    </Text>
                    <Input
                      value={headerNavModules.customLink?.url || ''}
                      onChange={(value) => {
                        setHeaderNavModules({
                          ...headerNavModules,
                          customLink: {
                            ...headerNavModules.customLink,
                            url: value,
                          },
                        });
                      }}
                      placeholder={t('例如：https://example.com')}
                      size='default'
                    />
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Card>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingTop: '8px',
            borderTop: '1px solid var(--semi-color-border)',
          }}
        >
          <Button
            size='default'
            type='tertiary'
            onClick={resetHeaderNavModules}
            style={{
              borderRadius: '6px',
              fontWeight: '500',
            }}
          >
            {t('重置为默认')}
          </Button>
          <Button
            size='default'
            type='primary'
            onClick={onSubmit}
            loading={loading}
            style={{
              borderRadius: '6px',
              fontWeight: '500',
              minWidth: '100px',
            }}
          >
            {t('保存设置')}
          </Button>
        </div>
      </Form.Section>
    </Card>
  );
}
