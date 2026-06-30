'use client';

import { ConfigProvider } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const queryClient = new QueryClient();

const theme = {
  token: {
    colorPrimary: '#8A9A86',
    colorSuccess: '#7A9A6A',
    colorWarning: '#C4A862',
    colorError: '#C46B6B',
    colorInfo: '#7A8FA5',
    colorBgBase: '#FAFAF8',
    colorBgLayout: '#EDECE7',
    colorBgContainer: '#F7F6F2',
    colorBgElevated: '#FFFFFF',
    colorTextBase: '#2D3430',
    colorBorder: '#D5D3CD',
    colorBorderSecondary: '#E6E4DE',
    colorFill: '#8A9A8615',
    colorFillSecondary: '#8A9A8608',
    colorFillTertiary: '#8A9A8604',
    colorLink: '#6B8A6A',
    colorLinkHover: '#5A7A5A',
    borderRadius: 6,
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
