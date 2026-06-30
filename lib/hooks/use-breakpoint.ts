'use client';

import { Grid } from 'antd';

export function useBreakpoint() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  return { isMobile };
}
