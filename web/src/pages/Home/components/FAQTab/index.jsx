import React, { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import {
  Collapse,
  List,
  Button,
  Form,
  Modal,
  Typography,
  Card,
  Divider,
  Spin,
  Empty,
  Tag,
  Pagination,
} from '@douyinfe/semi-ui';
import { IconPlus, IconMinus } from '@douyinfe/semi-icons';
import { HelpCircle, MessageSquare, Send } from 'lucide-react';
import { API, showError, showSuccess } from '../../../../helpers';
import { useTranslation } from 'react-i18next';
import { marked } from 'marked';
import { StatusContext } from '../../../../context/Status';
import { UserContext } from '../../../../context/User';

const { Text, Title } = Typography;

const FAQTab = () => {
  const { t } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const [userState] = useContext(UserContext);
  const [boardLoading, setBoardLoading] = useState(false);
  const [userMessages, setUserMessages] = useState([]);
  const [myMessages, setMyMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({ title: '', question: '', solution: '' });

  const claudeIssues = useMemo(() => (statusState?.status?.faq || []).filter(item => item.category === 'claude_code'), [statusState?.status?.faq]);
  const groupIssues = useMemo(() => (statusState?.status?.faq || []).filter(item => item.category !== 'claude_code'), [statusState?.status?.faq]);

  const fetchBoardPosts = useCallback(async (pageNum = 1) => {
    setBoardLoading(true);
    try {
      const res = await API.get(`/api/faq/board?page=${pageNum}&page_size=10`);
      if (res.data.success) {
        setUserMessages(res.data.data || []);
        setTotal(res.data.total || 0);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error.message);
      console.error(error);
    } finally {
      setBoardLoading(false);
    }
  }, []);

  const fetchMyPosts = useCallback(async () => {
    if (!userState?.user?.id) return;
    try {
      const res = await API.get('/api/faq/board/mine?page=1&page_size=50');
      if (res.data.success) {
        setMyMessages(res.data.data || []);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error.message);
      console.error(error);
    }
  }, [userState?.user?.id]);

  useEffect(() => {
    fetchBoardPosts(1);
  }, [fetchBoardPosts]);

  useEffect(() => {
    if (userState?.user?.id) {
      fetchMyPosts();
    }
  }, [userState?.user?.id, fetchMyPosts]);

  const handleSubmit = async () => {
    if (!formData.question.trim()) {
      showError(t('请输入问题内容'));
      return;
    }
    setFormLoading(true);
    try {
      const res = await API.post('/api/faq/board', formData);
      if (res.data.success) {
        showSuccess(t('留言提交成功，请等待管理员审核'));
        setShowModal(false);
        setFormData({ title: '', question: '', solution: '' });
        fetchMyPosts();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 0:
        return <Tag color='orange'>{t('待审核')}</Tag>;
      case 1:
        return <Tag color='green'>{t('已通过')}</Tag>;
      case 2:
        return <Tag color='red'>{t('已拒绝')}</Tag>;
      default:
        return null;
    }
  };

  const renderKnownIssues = (issues, title, color) => (
    <Card
      className='mb-4'
      title={
        <div className='flex items-center gap-2'>
          <HelpCircle size={16} />
          <span>{title}</span>
          <Tag color={color} size='small'>{issues.length}</Tag>
        </div>
      }
    >
      {issues.length > 0 ? (
        <Collapse accordion expandIcon={<IconPlus />} collapseIcon={<IconMinus />}>
          {issues.map((item, index) => (
            <Collapse.Panel header={item.question} itemKey={String(index)} key={index}>
              <div
                className='prose prose-sm max-w-none'
                dangerouslySetInnerHTML={{ __html: marked.parse(item.answer || '') }}
              />
            </Collapse.Panel>
          ))}
        </Collapse>
      ) : (
        <Empty description={t('暂无相关问题')} />
      )}
    </Card>
  );

  const displayMessages = showMyPosts ? myMessages : userMessages;

  return (
    <div className='p-4'>
      <Title heading={4} className='mb-4'>{t('常见问题')}</Title>

      {renderKnownIssues(claudeIssues, t('Claude Code 相关问题'), 'purple')}
      {renderKnownIssues(groupIssues, t('Default 分组相关问题'), 'blue')}

      <Divider margin='24px' />

      <div className='flex justify-between items-center mb-4'>
        <div className='flex items-center gap-2'>
          <MessageSquare size={20} />
          <Title heading={4} style={{ margin: 0 }}>{t('用户留言板')}</Title>
        </div>
        <div className='flex gap-2'>
          {userState?.user?.id && (
            <Button
              theme={showMyPosts ? 'solid' : 'light'}
              onClick={() => setShowMyPosts(!showMyPosts)}
            >
              {showMyPosts ? t('查看全部') : t('我的留言')}
            </Button>
          )}
          <Button
            icon={<Send size={14} />}
            theme='solid'
            onClick={() => {
              if (!userState?.user?.id) {
                showError(t('请先登录'));
                return;
              }
              setShowModal(true);
            }}
          >
            {t('我要提问')}
          </Button>
        </div>
      </div>

      <Spin spinning={boardLoading}>
        <List
          dataSource={displayMessages}
          renderItem={(item) => (
            <List.Item
              className='!py-4'
              main={
                <div>
                  <div className='flex items-center gap-2 mb-2'>
                    {item.title && <Text strong>{item.title}</Text>}
                    {showMyPosts && getStatusTag(item.status)}
                  </div>
                  <div className='text-gray-600 whitespace-pre-wrap'>{item.question}</div>
                  {item.solution && (
                    <Card className='mt-3 bg-green-50' bodyStyle={{ padding: 12 }}>
                      <Text type='success' strong>{t('解决方案：')}</Text>
                      <div className='mt-1 whitespace-pre-wrap'>{item.solution}</div>
                    </Card>
                  )}
                  {showMyPosts && item.status === 2 && item.review_note && (
                    <Card className='mt-3 bg-red-50' bodyStyle={{ padding: 12 }}>
                      <Text type='danger' strong>{t('拒绝原因：')}</Text>
                      <div className='mt-1'>{item.review_note}</div>
                    </Card>
                  )}
                </div>
              }
              extra={
                <div className='text-right text-gray-400 text-sm'>
                  <div>{item.user_name}</div>
                  <div>{new Date(item.created_at * 1000).toLocaleDateString()}</div>
                </div>
              }
            />
          )}
          emptyContent={<Empty description={t('暂无留言')} />}
        />
        {!showMyPosts && total > 10 && (
          <div className='flex justify-center mt-4'>
            <Pagination
              total={total}
              pageSize={10}
              currentPage={page}
              onChange={(p) => {
                setPage(p);
                fetchBoardPosts(p);
              }}
            />
          </div>
        )}
      </Spin>

      <Modal
        title={t('提交问题')}
        visible={showModal}
        onOk={handleSubmit}
        onCancel={() => setShowModal(false)}
        confirmLoading={formLoading}
        okText={t('提交')}
        cancelText={t('取消')}
      >
        <Form layout='vertical'>
          <Form.Input
            field='title'
            label={t('标题（可选）')}
            placeholder={t('简要描述您的问题')}
            value={formData.title}
            onChange={(v) => setFormData({ ...formData, title: v })}
          />
          <Form.TextArea
            field='question'
            label={t('问题描述')}
            placeholder={t('详细描述您遇到的问题')}
            rows={4}
            value={formData.question}
            onChange={(v) => setFormData({ ...formData, question: v })}
          />
          <Form.TextArea
            field='solution'
            label={t('解决方案（可选）')}
            placeholder={t('如果您已找到解决方案，可以分享给其他用户')}
            rows={3}
            value={formData.solution}
            onChange={(v) => setFormData({ ...formData, solution: v })}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default FAQTab;
