import React, { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Space,
  Table,
  Form,
  Typography,
  Empty,
  Divider,
  Modal,
  Tag,
  Tooltip,
  Select,
  TextArea,
} from '@douyinfe/semi-ui';
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@douyinfe/semi-illustrations';
import { Check, X, Eye, MessageSquare, Trash2, MessageCircle } from 'lucide-react';
import { API, showError, showSuccess } from '../../../helpers';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const SettingsFAQBoard = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState(-1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPosts = useCallback(async (page = 1, status = -1) => {
    setLoading(true);
    try {
      const res = await API.get(`/api/faq/board/manage?page=${page}&page_size=${pageSize}&status=${status}`);
      if (res.data.success) {
        setPosts(res.data.data || []);
        setTotal(res.data.total || 0);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchPosts(currentPage, statusFilter);
  }, [currentPage, statusFilter, fetchPosts]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const res = await API.post(`/api/faq/board/manage/${id}/approve`);
      if (res.data.success) {
        showSuccess(t('审核通过'));
        fetchPosts(currentPage, statusFilter);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPost) return;
    setActionLoading(true);
    try {
      const res = await API.post(`/api/faq/board/manage/${selectedPost.id}/reject`, {
        review_note: rejectNote,
      });
      if (res.data.success) {
        showSuccess(t('已拒绝'));
        setShowRejectModal(false);
        setRejectNote('');
        setSelectedPost(null);
        fetchPosts(currentPage, statusFilter);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedPost) return;
    setActionLoading(true);
    try {
      const res = await API.post(`/api/faq/board/manage/${selectedPost.id}/reply`, {
        admin_reply: replyContent,
      });
      if (res.data.success) {
        showSuccess(t('回复成功'));
        setShowReplyModal(false);
        setReplyContent('');
        setSelectedPost(null);
        fetchPosts(currentPage, statusFilter);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    setActionLoading(true);
    try {
      const res = await API.delete(`/api/faq/board/manage/${selectedPost.id}`);
      if (res.data.success) {
        showSuccess(t('删除成功'));
        setShowDeleteModal(false);
        setSelectedPost(null);
        fetchPosts(currentPage, statusFilter);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setActionLoading(false);
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

  const columns = [
    {
      title: t('状态'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: t('用户'),
      dataIndex: 'user_name',
      key: 'user_name',
      width: 120,
    },
    {
      title: t('标题'),
      dataIndex: 'title',
      key: 'title',
      width: 150,
      render: (text) => (
        <Tooltip content={text || '-'} showArrow>
          <div className='truncate max-w-[150px]'>{text || '-'}</div>
        </Tooltip>
      ),
    },
    {
      title: t('问题内容'),
      dataIndex: 'question',
      key: 'question',
      render: (text) => (
        <Tooltip content={text} showArrow>
          <div className='truncate max-w-[200px]'>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: t('管理员回复'),
      dataIndex: 'admin_reply',
      key: 'admin_reply',
      width: 150,
      render: (text) => (
        text ? (
          <Tooltip content={text} showArrow>
            <Tag color='blue' style={{ maxWidth: 120 }}>
              <span className='truncate'>{t('已回复')}</span>
            </Tag>
          </Tooltip>
        ) : (
          <Tag color='grey'>{t('未回复')}</Tag>
        )
      ),
    },
    {
      title: t('提交时间'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (time) => new Date(time * 1000).toLocaleDateString(),
    },
    {
      title: t('操作'),
      key: 'action',
      fixed: 'right',
      width: 280,
      render: (_, record) => (
        <Space>
          <Button
            icon={<Eye size={14} />}
            theme='light'
            size='small'
            onClick={() => {
              setSelectedPost(record);
              setShowDetailModal(true);
            }}
          >
            {t('查看')}
          </Button>
          {record.status === 0 && (
            <>
              <Button
                icon={<Check size={14} />}
                theme='solid'
                type='primary'
                size='small'
                loading={actionLoading}
                onClick={() => handleApprove(record.id)}
              >
                {t('通过')}
              </Button>
              <Button
                icon={<X size={14} />}
                theme='solid'
                type='danger'
                size='small'
                onClick={() => {
                  setSelectedPost(record);
                  setShowRejectModal(true);
                }}
              >
                {t('拒绝')}
              </Button>
            </>
          )}
          <Button
            icon={<MessageCircle size={14} />}
            theme='light'
            type='tertiary'
            size='small'
            onClick={() => {
              setSelectedPost(record);
              setReplyContent(record.admin_reply || '');
              setShowReplyModal(true);
            }}
          >
            {t('回复')}
          </Button>
          <Button
            icon={<Trash2 size={14} />}
            theme='light'
            type='danger'
            size='small'
            onClick={() => {
              setSelectedPost(record);
              setShowDeleteModal(true);
            }}
          >
            {t('删除')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Form.Section
        text={
          <div className='flex flex-col w-full'>
            <div className='mb-2'>
              <div className='flex items-center text-blue-500'>
                <MessageSquare size={16} className='mr-2' />
                <Text>{t('用户留言审核管理')}</Text>
              </div>
            </div>
            <Divider margin='12px' />
            <div className='flex items-center gap-4'>
              <Select
                value={statusFilter}
                onChange={(v) => {
                  setStatusFilter(v);
                  setCurrentPage(1);
                }}
                style={{ width: 150 }}
              >
                <Select.Option value={-1}>{t('全部状态')}</Select.Option>
                <Select.Option value={0}>{t('待审核')}</Select.Option>
                <Select.Option value={1}>{t('已通过')}</Select.Option>
                <Select.Option value={2}>{t('已拒绝')}</Select.Option>
              </Select>
            </div>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={posts}
          rowKey='id'
          scroll={{ x: 'max-content' }}
          pagination={{
            currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          loading={loading}
          empty={
            <Empty
              image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
              darkModeImage={<IllustrationNoResultDark style={{ width: 150, height: 150 }} />}
              description={t('暂无留言')}
              style={{ padding: 30 }}
            />
          }
        />
      </Form.Section>

      <Modal
        title={t('留言详情')}
        visible={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedPost(null);
        }}
        footer={null}
        width={600}
      >
        {selectedPost && (
          <div className='space-y-4'>
            <div>
              <Text strong>{t('状态：')}</Text>
              {getStatusTag(selectedPost.status)}
            </div>
            <div>
              <Text strong>{t('用户：')}</Text>
              <Text>{selectedPost.user_name}</Text>
            </div>
            {selectedPost.title && (
              <div>
                <Text strong>{t('标题：')}</Text>
                <Text>{selectedPost.title}</Text>
              </div>
            )}
            <div>
              <Text strong>{t('问题内容：')}</Text>
              <div className='mt-1 p-3 bg-gray-50 rounded whitespace-pre-wrap'>
                {selectedPost.question}
              </div>
            </div>
            {selectedPost.solution && (
              <div>
                <Text strong>{t('解决方案：')}</Text>
                <div className='mt-1 p-3 bg-green-50 rounded whitespace-pre-wrap'>
                  {selectedPost.solution}
                </div>
              </div>
            )}
            {selectedPost.admin_reply && (
              <div>
                <Text strong style={{ color: 'var(--semi-color-primary)' }}>{t('管理员回复：')}</Text>
                <div className='mt-1 p-3 bg-blue-50 rounded whitespace-pre-wrap'>
                  {selectedPost.admin_reply}
                </div>
                {selectedPost.replied_at > 0 && (
                  <Text type='tertiary' size='small'>
                    {t('回复时间：')}{new Date(selectedPost.replied_at * 1000).toLocaleString()}
                  </Text>
                )}
              </div>
            )}
            {selectedPost.review_note && (
              <div>
                <Text strong type='danger'>{t('拒绝原因：')}</Text>
                <div className='mt-1 p-3 bg-red-50 rounded'>
                  {selectedPost.review_note}
                </div>
              </div>
            )}
            <div>
              <Text strong>{t('提交时间：')}</Text>
              <Text>{new Date(selectedPost.created_at * 1000).toLocaleString()}</Text>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={t('拒绝留言')}
        visible={showRejectModal}
        onOk={handleReject}
        onCancel={() => {
          setShowRejectModal(false);
          setRejectNote('');
          setSelectedPost(null);
        }}
        okText={t('确认拒绝')}
        cancelText={t('取消')}
        confirmLoading={actionLoading}
        okButtonProps={{ type: 'danger' }}
      >
        <Form layout='vertical'>
          <Form.TextArea
            field='review_note'
            label={t('拒绝原因（可选）')}
            placeholder={t('请输入拒绝原因，将展示给用户')}
            rows={3}
            value={rejectNote}
            onChange={(v) => setRejectNote(v)}
          />
        </Form>
      </Modal>

      <Modal
        title={t('回复留言')}
        visible={showReplyModal}
        onOk={handleReply}
        onCancel={() => {
          setShowReplyModal(false);
          setReplyContent('');
          setSelectedPost(null);
        }}
        okText={t('提交回复')}
        cancelText={t('取消')}
        confirmLoading={actionLoading}
        width={600}
      >
        {selectedPost && (
          <div className='mb-4'>
            <Text strong>{t('用户问题：')}</Text>
            <div className='mt-1 p-3 bg-gray-50 rounded whitespace-pre-wrap max-h-32 overflow-auto'>
              {selectedPost.question}
            </div>
          </div>
        )}
        <TextArea
          placeholder={t('请输入回复内容')}
          rows={6}
          value={replyContent}
          onChange={(v) => setReplyContent(v)}
          maxCount={8000}
        />
      </Modal>

      <Modal
        title={t('确认删除')}
        visible={showDeleteModal}
        onOk={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedPost(null);
        }}
        okText={t('确认删除')}
        cancelText={t('取消')}
        confirmLoading={actionLoading}
        okButtonProps={{ type: 'danger', theme: 'solid' }}
      >
        <Text>{t('确定要删除此留言吗？此操作不可恢复。')}</Text>
      </Modal>
    </>
  );
};

export default SettingsFAQBoard;
