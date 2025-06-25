import { lightTheme } from './light';
import { darkTheme } from './dark';
import { useTheme } from '../contexts/ThemeContext';

export { lightTheme, darkTheme };

export const useAppTheme = () => {
  const { theme } = useTheme();
  return theme === 'dark' ? darkTheme : lightTheme;
}; 