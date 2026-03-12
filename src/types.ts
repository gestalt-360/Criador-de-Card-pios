export type Addon = {
  id: string;
  name: string;
  price: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  addons: Addon[];
};

export type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

export type MenuTheme = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
};

export type MenuData = {
  name: string;
  description: string;
  logoUrl: string;
  whatsappNumber: string;
  theme: MenuTheme;
  categories: MenuCategory[];
};
