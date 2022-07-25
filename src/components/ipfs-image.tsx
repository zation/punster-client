import React, {
  HTMLAttributes,
  DetailedHTMLProps,
} from 'react';

interface IPFSImageProps extends DetailedHTMLProps<HTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  hash: string
}

export default function Uploader({ hash, ...props }: IPFSImageProps) {
  return (
    <img
      src={`//47.241.31.74:8080/ipfs/${hash}`}
      {...props}
    />
  );
};
