import Slider from "./scripts/slider";

import Gallery from "./scripts/gallery";

import SlidingBanner from "./scripts/sliding-banner";

const banners = document.getElementsByClassName("sliding-banner");
for (let i = 0; i < banners.length; i++)
  new SlidingBanner(banners[i] as HTMLElement);

const sliders = document.getElementsByClassName("slider");
for (let i = 0; i < sliders.length; i++) new Slider(sliders[i] as HTMLElement);

const galleries = document.getElementsByClassName("gallery");
for (let i = 0; i < galleries.length; i++) new Gallery(galleries[i]);
