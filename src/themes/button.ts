export const buttonTheme = {
  slots: {
    base: "group/button inline-flex shrink-0 items-center justify-center rounded-[30px] font-semibold transition-all outline-none select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    loadingIcon: "animate-spin shrink-0 mr-2",
  },
  variants: {
    variant: {
      solid: { base: "" },
      outline: { base: "border" },
      ghost: { base: "hover:bg-gray-100" },
    },
    color: {
      primary: { base: "" },
      secondary: { base: "" },
    },
    size: {
      sm: { base: "h-10 px-4 text-sm" },
      md: { base: "h-12 px-6 text-base" },
      lg: { base: "h-14 px-8 text-lg" },
    },
    block: {
      true: { base: "w-full flex" },
    },
    disabled: {
      true: { base: "opacity-50 pointer-events-none" },
    },
    loading: {
      true: { base: "pointer-events-none opacity-80" },
    },
  },
  compoundVariants: [
    // Primary Solid (Telkomsel Red Solid)
    {
      variant: "solid",
      color: "primary",
      class: {
        base: "bg-primary text-white hover:opacity-90 active:opacity-80 shadow-[0_4px_10px_rgba(227,0,34,0.2)]",
      },
    },
    // Primary Outline (Telkomsel Red Outline)
    {
      variant: "outline",
      color: "primary",
      class: {
        base: "border-primary text-primary bg-white hover:bg-primary/5 active:bg-primary/10 shadow-[0_4px_10px_rgba(227,0,34,0.2)]",
      },
    },
    // Secondary Solid (Telkomsel Blue Solid)
    {
      variant: "solid",
      color: "secondary",
      class: {
        base: "bg-secondary text-white hover:opacity-90 active:opacity-80 shadow-[0_4px_10px_rgba(0,80,174,0.2)]",
      },
    },
    // Secondary Outline (Telkomsel Blue Outline)
    {
      variant: "outline",
      color: "secondary",
      class: {
        base: "border-secondary text-secondary bg-white hover:bg-secondary/5 active:bg-secondary/10 shadow-[0_4px_10px_rgba(0,80,174,0.2)]",
      },
    },
  ],
  defaultVariants: {
    variant: "solid",
    color: "primary",
    size: "md",
  },
};
