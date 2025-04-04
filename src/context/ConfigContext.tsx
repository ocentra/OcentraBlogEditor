import React, { createContext, useContext } from 'react';
import { icons as defaultIcons } from '../assets';

interface ConfigContextType {
  defaultHeroImage: string;
  icons: typeof defaultIcons;
  categories?: string[];
}

const defaultConfig: ConfigContextType = {
  defaultHeroImage: '/placeholder-hero.jpg',
  icons: defaultIcons,
  categories: []
};

const ConfigContext = createContext<ConfigContextType>(defaultConfig);

export interface BlogEditorConfig {
  defaultHeroImage?: string;
  icons?: Partial<typeof defaultIcons>;
  categories?: string[];
}

export const ConfigProvider: React.FC<{
  children: React.ReactNode;
  config?: BlogEditorConfig;
}> = ({
  children,
  config = {}
}) => {
  const mergedConfig = {
    ...defaultConfig,
    ...config,
    icons: { ...defaultConfig.icons, ...config.icons }
  };
  
  return (
    <ConfigContext.Provider value={mergedConfig}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

export type { ConfigContextType };
export { defaultIcons }; 