declare module "next/font/google" {
  import { ReactNode } from "react";

  type FontOptions = {
    subsets?: string[];
    variable?: string;
    weight?: string | string[];
    style?: string | string[];
    axes?: string[];
    display?: string;
    fallback?: string[];
    preload?: boolean;
  };

  type FontFunction = (options?: FontOptions) => {
    className: string;
    style: { fontFamily: string };
    variable: string;
    subset: string;
  };

  export const Geist: FontFunction;
  export const Geist_Mono: FontFunction;
  export const Cormorant_Garamond: FontFunction;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
