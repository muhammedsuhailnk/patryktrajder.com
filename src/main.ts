import Slider from "./scripts/slider";
import Gallery from "./scripts/gallery";
import Constants from "./scripts/constants";

const banners = document.getElementsByClassName("banner");
for (let i = 0; i < banners.length; i++) {
  const bannerSlider = document.getElementsByClassName(
    "slider"
  )[0] as HTMLElement;
  new Slider(bannerSlider, true, true, Constants.autoPlaySlideDuration);
}

const sliders = document.getElementsByClassName("regular slider");
for (let i = 0; i < sliders.length; i++) new Slider(sliders[i] as HTMLElement);

const galleries = document.getElementsByClassName("gallery");
for (let i = 0; i < galleries.length; i++) new Gallery(galleries[i]);
