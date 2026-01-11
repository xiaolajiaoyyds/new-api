import React from 'react';
import { Form, Button } from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';

const ArchivedUsersFilters = ({
  formInitValues,
  setFormApi,
  searchArchivedUsers,
  loading,
  searching,
  t,
}) => {
  return (
    <Form
      layout='horizontal'
      initValues={formInitValues}
      getFormApi={setFormApi}
      onSubmit={searchArchivedUsers}
      className='flex flex-wrap gap-2 items-end'
    >
      <Form.Input
        field='searchKeyword'
        placeholder={t('搜索用户名/邮箱')}
        style={{ width: 200 }}
        showClear
      />
      <Button
        icon={<IconSearch />}
        htmlType='submit'
        loading={loading || searching}
      >
        {t('搜索')}
      </Button>
    </Form>
  );
};

export default ArchivedUsersFilters;
