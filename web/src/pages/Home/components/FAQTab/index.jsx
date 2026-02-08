import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import { Spin } from '@douyinfe/semi-ui';
import { HelpCircle, MessageSquare, Send } from 'lucide-react';
import { API, showError, showSuccess } from '../../../../helpers';
import { useTranslation } from 'react-i18next';
import { marked } from 'marked';
import { StatusContext } from '../../../../context/Status';
import { UserContext } from '../../../../context/User';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Avatar,
  Empty,
  Pagination,
  Modal,
  Input,
  Textarea,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../../../components/retroui';

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
  const [formData, setFormData] = useState({
    title: '',
    question: '',
    solution: '',
  });

  const claudeIssues = useMemo(
    () =>
      (statusState?.status?.faq || []).filter(
        (item) => item.category === 'claude_code',
      ),
    [statusState?.status?.faq],
  );
  const groupIssues = useMemo(
    () =>
      (statusState?.status?.faq || []).filter(
        (item) => item.category !== 'claude_code',
      ),
    [statusState?.status?.faq],
  );

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return (
          <Badge variant='warning' size='sm'>
            {t('待审核')}
          </Badge>
        );
      case 1:
        return (
          <Badge variant='success' size='sm'>
            {t('已通过')}
          </Badge>
        );
      case 2:
        return (
          <Badge variant='danger' size='sm'>
            {t('已拒绝')}
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderKnownIssues = (issues, title, variant) => (
    <Card className='mb-4'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <HelpCircle className='w-5 h-5' />
          <CardTitle className='text-lg'>{title}</CardTitle>
          <Badge variant={variant} size='sm'>
            {issues.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {issues.length > 0 ? (
          <Accordion>
            {issues.map((item, index) => (
              <AccordionItem key={index} value={String(index)}>
                <AccordionTrigger value={String(index)}>
                  {item.question}
                </AccordionTrigger>
                <AccordionContent value={String(index)}>
                  <div
                    className='prose prose-sm max-w-none dark:prose-invert'
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(item.answer || ''),
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Empty description={t('暂无相关问题')} />
        )}
      </CardContent>
    </Card>
  );

  const displayMessages = showMyPosts ? myMessages : userMessages;

  return (
    <div className='p-4'>
      <h2 className='text-2xl font-bold text-black dark:text-white mb-4'>
        {t('常见问题')}
      </h2>

      {renderKnownIssues(claudeIssues, t('Claude Code 相关问题'), 'purple')}
      {renderKnownIssues(groupIssues, t('Default 分组相关问题'), 'info')}

      <div className='h-px bg-black dark:bg-white my-6' />

      <div className='flex justify-between items-center mb-4 flex-wrap gap-3'>
        <div className='flex items-center gap-2'>
          <MessageSquare className='w-5 h-5' />
          <h2 className='text-2xl font-bold text-black dark:text-white'>
            {t('用户留言板')}
          </h2>
        </div>
        <div className='flex gap-2'>
          {userState?.user?.id && (
            <Button
              variant={showMyPosts ? 'primary' : 'secondary'}
              size='sm'
              onClick={() => setShowMyPosts(!showMyPosts)}
            >
              {showMyPosts ? t('查看全部') : t('我的留言')}
            </Button>
          )}
          <Button
            variant='primary'
            size='sm'
            onClick={() => {
              if (!userState?.user?.id) {
                showError(t('请先登录'));
                return;
              }
              setShowModal(true);
            }}
          >
            <Send className='w-4 h-4 mr-1' />
            {t('我要提问')}
          </Button>
        </div>
      </div>

      <Spin spinning={boardLoading}>
        {displayMessages.length > 0 ? (
          <div className='space-y-4'>
            {displayMessages.map((item, index) => (
              <Card key={index} padding='sm'>
                <div className='flex justify-between items-start gap-4'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-2 flex-wrap'>
                      {item.title && (
                        <span className='font-bold text-black dark:text-white'>
                          {item.title}
                        </span>
                      )}
                      {showMyPosts && getStatusBadge(item.status)}
                    </div>
                    <div className='text-gray-600 dark:text-gray-400 whitespace-pre-wrap'>
                      {item.question}
                    </div>
                    {item.solution && (
                      <div className='mt-3 p-3 bg-green-100 dark:bg-green-900/30 border-2 border-black dark:border-white'>
                        <span className='font-bold text-green-700 dark:text-green-400'>
                          {t('解决方案：')}
                        </span>
                        <div className='mt-1 whitespace-pre-wrap text-black dark:text-white'>
                          {item.solution}
                        </div>
                      </div>
                    )}
                    {item.admin_reply && (
                      <div className='mt-3 p-3 bg-blue-100 dark:bg-blue-900/30 border-2 border-black dark:border-white'>
                        <span className='font-bold text-blue-700 dark:text-blue-400'>
                          {t('管理员回复：')}
                        </span>
                        <div className='mt-1 whitespace-pre-wrap text-black dark:text-white'>
                          {item.admin_reply}
                        </div>
                      </div>
                    )}
                    {showMyPosts && item.status === 2 && item.review_note && (
                      <div className='mt-3 p-3 bg-red-100 dark:bg-red-900/30 border-2 border-black dark:border-white'>
                        <span className='font-bold text-red-700 dark:text-red-400'>
                          {t('拒绝原因：')}
                        </span>
                        <div className='mt-1 text-black dark:text-white'>
                          {item.review_note}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className='text-right text-gray-400 text-sm flex-shrink-0'>
                    <div className='flex items-center justify-end gap-2'>
                      {item.linux_do_avatar && (
                        <Avatar size='xs' src={item.linux_do_avatar} />
                      )}
                      <span>{item.linux_do_username || item.user_name}</span>
                    </div>
                    <div>
                      {new Date(item.created_at * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty description={t('暂无留言')} />
        )}

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
        onClose={() => setShowModal(false)}
        okText={t('提交')}
        cancelText={t('取消')}
        okLoading={formLoading}
      >
        <div className='space-y-4'>
          <Input
            label={t('标题（可选）')}
            placeholder={t('简要描述您的问题')}
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Textarea
            label={t('问题描述')}
            placeholder={t('详细描述您遇到的问题')}
            rows={4}
            value={formData.question}
            onChange={(e) =>
              setFormData({ ...formData, question: e.target.value })
            }
          />
          <Textarea
            label={t('解决方案（可选）')}
            placeholder={t('如果您已找到解决方案，可以分享给其他用户')}
            rows={3}
            value={formData.solution}
            onChange={(e) =>
              setFormData({ ...formData, solution: e.target.value })
            }
          />
        </div>
      </Modal>
    </div>
  );
};

export default FAQTab;
