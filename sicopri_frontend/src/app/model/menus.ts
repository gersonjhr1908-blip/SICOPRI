interface Menu {
    name: string;
    icon: string;
    url: string;
    submenus?: Submenu[];
  }
  
  interface Submenu {
    name: string;
    icon: string;
    url: string;
  }