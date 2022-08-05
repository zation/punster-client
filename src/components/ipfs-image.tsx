import React, {
  HTMLAttributes,
  DetailedHTMLProps,
} from 'react';
import { ipfsDomain } from '@/services/ipfs';

interface IPFSImageProps extends DetailedHTMLProps<HTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  hash: string
}

export default function Uploader({ hash, ...props }: IPFSImageProps) {
  return (
    <img
      src={`${ipfsDomain}:8080/ipfs/${hash}`}
      {...props}
    />
  );
};
