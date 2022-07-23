import React from 'react';
import { func } from 'prop-types';
import { Upload } from 'antd';

const result = ({ onChange, showUploadList, maxCount }) => (
  <Upload
    listType="picture-card"
    action="http://47.241.31.74:5001/api/v0/add"
    onChange={onChange}
    showUploadList={showUploadList}
    maxCount={maxCount}
  >
    Upload
  </Upload>
);

result.propTypes = {
  onChange: func,
};

result.displayName = __filename;

export default result;
