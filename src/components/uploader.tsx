import React from 'react';
import { Upload, UploadProps } from 'antd';

export default function Uploader({ onChange, showUploadList, maxCount }: Pick<UploadProps, 'onChange' | 'showUploadList' | 'maxCount'>) {
  return (
    <Upload
      listType="picture-card"
      action="//47.241.31.74:5001/api/v0/add"
      onChange={onChange}
      showUploadList={showUploadList}
      maxCount={maxCount}
    >
      Upload
    </Upload>
  );
};
