// types/theme.ts
export interface ThemeType {  // Changed the name to avoid confusion with the variable Theme
    light: {
      theme: string;
      color: string;
      background: string;
    };
    dark: {
      theme: string;
      color: string;
      background: string;
    };
  }
  
  const Theme = {
    light: {
      theme: 'light',
      color: 'black',
      background: 'white',
    },
    dark: {
      theme: 'dark',
      color: 'white',
      background: 'black',
    },
  };
  
  export default Theme; // Ensure the Theme object is exported as default
  