import { createContext,useContext,useEffect,useMemo,useState } from "react";
const ThemeContext=createContext(null);
export function ThemeProvider({children}){const[theme,setTheme]=useState(()=>localStorage.getItem("networkers_theme")||"dark");useEffect(()=>{const root=document.documentElement;root.classList.toggle("dark",theme==="dark");root.dataset.theme=theme;localStorage.setItem("networkers_theme",theme)},[theme]);const value=useMemo(()=>({theme,toggleTheme:()=>setTheme(current=>current==="dark"?"light":"dark")}),[theme]);return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>}
export const useTheme=()=>useContext(ThemeContext);
