import Banner from "./scripts/banner";
import Checkbox from "./scripts/checkbox";
import Expander from "./scripts/expander";
import Gallery from "./scripts/gallery";
import LanguageDropdown from "./scripts/language-dropdown";
import Menu from "./scripts/menu";
import Slider from "./scripts/slider";

const banners = document.getElementsByClassName("banner");
for (let i = 0; i < banners.length; i++) new Banner(banners[i] as HTMLElement);

let checkbox = document.querySelector("#super-booster-2000 .checkbox");
if (checkbox) new Checkbox(checkbox as HTMLElement, 689, 599, 179, 159, true);

const sliders = document.getElementsByClassName("regular slider");
for (let i = 0; i < sliders.length; i++) new Slider(sliders[i] as HTMLElement);

const galleries = document.getElementsByClassName("gallery");
for (let i = 0; i < galleries.length; i++) new Gallery(galleries[i]);

const expanders = document.getElementsByClassName("expander");
for (let i = 0; i < expanders.length; i++)
  new Expander(expanders[i] as HTMLElement);

const menus = document.getElementsByClassName("menu");
for (let i = 0; i < menus.length; i++) new Menu(menus[i] as HTMLElement);

const languageDropdowns = document.getElementsByClassName("language-dropdown");
for (let i = 0; i < languageDropdowns.length; i++)
  new LanguageDropdown(languageDropdowns[i] as HTMLElement);

// import Promotion from "./scripts/promotion";
// const products = document.getElementsByClassName("product-details");
// for (let i = 0; i < products.length; i++)
//   new Promotion(products[i] as HTMLElement, new Date(2020, 4, 18));
