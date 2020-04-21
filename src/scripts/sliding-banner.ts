class SlidingBanner {
  private readonly nPictures: number = 0;
  private readonly navDots: HTMLUListElement;

  private currentPicture: number = 0;

  constructor(banner: Element) {
    const images = banner.querySelector(".images") as HTMLElement;
    this.nPictures = images.childElementCount;

    const leftArrow = banner.querySelector(".left") as HTMLElement;
    const rightArrow = banner.querySelector(".right") as HTMLElement;
    this.navDots = banner.querySelector("ul") as HTMLUListElement;

    this.setUpNavDots();
    leftArrow.addEventListener("click", this.slideBannerLeft);
    rightArrow.addEventListener("click", this.slideBannerRight);
  }

  private setUpNavDots = () => {
    if (this.nPictures === 0) return;

    const _this: SlidingBanner = this;
    let li: HTMLLIElement = document.createElement("li");
    li.className = "circle current";
    li.dataset.index = "0";
    li.addEventListener("click", function () {
      _this.handleNavDotClick(this);
    });
    this.navDots.appendChild(li);

    for (let i = 1; i < this.nPictures; i++) {
      li = document.createElement("li");
      li.className = "circle";
      li.dataset.index = i.toString();
      li.addEventListener("click", function () {
        _this.handleNavDotClick(this);
      });
      this.navDots.appendChild(li);
    }
  };

  private slideBannerLeft = () => {
    this.slide((this.currentPicture - 1 + this.nPictures) % this.nPictures);
  };

  private slideBannerRight = () => {
    this.slide((this.currentPicture + 1) % this.nPictures);
  };

  private handleNavDotClick = (li: HTMLLIElement) => {
    let index = Number(li.dataset.index);
    if (index === this.currentPicture) return;
    this.slide(index);
  };

  private slide = (newIndex: number) => {
    this.navDots.children[this.currentPicture].classList.remove("current");
    this.navDots.children[newIndex].classList.add("current");
    this.currentPicture = newIndex;
  };
}

const banners: HTMLCollectionOf<Element> = document.getElementsByClassName(
  "sliding-banner"
);

for (let i = 0; i < banners.length; i++) {
  new SlidingBanner(banners[i]);
}
