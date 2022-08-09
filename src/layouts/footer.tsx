import React from 'react';
import classNames from 'classnames';

import s from './footer.less';

export interface FooterProps {
  className?: string
}

declare const VERSION: string

export default function Footer ({ className }: FooterProps) {
  return (
    <div className={classNames(className, s.Root)}>
      © 2022 Punster. All Rights Reserved. {VERSION}
    </div>
  );
};
