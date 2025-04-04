interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  basePath: string;
  imageBasePath: string;
}

interface StorageConfig {
  type: 'github' | 'local';
  github?: GitHubConfig;
}

export const getStorageConfig = (): StorageConfig => {
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';
  const storageType = import.meta.env.VITE_DEV_STORAGE || 'github';

  if (storageType === 'github') {
    const requiredVars = [
      'VITE_GITHUB_OWNER',
      'VITE_GITHUB_REPO',
      'VITE_GITHUB_TOKEN'
    ];

    const missingVars = requiredVars.filter(
      (varName) => !import.meta.env[varName]
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required GitHub configuration: ${missingVars.join(', ')}`
      );
    }

    return {
      type: 'github',
      github: {
        owner: import.meta.env.VITE_GITHUB_OWNER,
        repo: import.meta.env.VITE_GITHUB_REPO,
        branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
        token: import.meta.env.VITE_GITHUB_TOKEN,
        basePath: import.meta.env.VITE_STORAGE_BASE_PATH || 'content/posts',
        imageBasePath: import.meta.env.VITE_STORAGE_IMAGE_PATH || 'content/images'
      }
    };
  }

  return {
    type: 'local'
  };
};

// Helper to create GitHub storage adapter
export const createStorageAdapter = () => {
  const config = getStorageConfig();
  
  if (config.type === 'github' && config.github) {
    const { GitHubStorageAdapter } = require('../adapters/GitHubStorageAdapter');
    return new GitHubStorageAdapter(config.github);
  }
  
  // Default to local storage if no GitHub config
  const { LocalStorageAdapter } = require('../adapters/LocalStorageAdapter');
  return new LocalStorageAdapter();
}; 