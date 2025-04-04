import cameraIcon from './camera.png';

export const icons = {
  camera: cameraIcon
} as const;

export type IconType = keyof typeof icons; 