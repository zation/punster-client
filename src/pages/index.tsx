import { Button } from 'antd';
import { useCallback } from 'react';
import { destroy } from '@/services/punster';

export default function HomePage() {
  const onDestroy = useCallback(async () => {
    const result = await destroy()
    console.log(result)
  }, []);

  return (
    <div>
      <Button onClick={onDestroy}>Destroy</Button>
      <h2>Yay! Welcome to umi!</h2>
      <p>
        To get started, edit <code>pages/index.tsx</code> and save to reload.
      </p>
    </div>
  );
}
