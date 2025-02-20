import React, { createContext, useContext, useState, ReactNode } from "react";

interface CategoryContextType {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}
interface CategoryHeaderProps {
    categories: CategoryType[];
    activeCategory: string;
    setActiveCategory: React.Dispatch<React.SetStateAction<string>>;
  }
// Create the context with a default value of `null` as the initial value
const CategoryContext = createContext<CategoryContextType | null>(null);

// Define the props for the provider component, including `children`
interface CategoryProviderProps {
  children: ReactNode;
}

// Create a provider component for the context
export const CategoryProvider = ({ children }: CategoryProviderProps) => {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  return (
    <CategoryContext.Provider value={{ activeCategory, setActiveCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

// Custom hook to access the CategoryContext with proper type checking
export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return context;
};
