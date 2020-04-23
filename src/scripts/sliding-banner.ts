class SlidingBanner {
  private readonly firstPicture: HTMLImageElement;
  private readonly images: HTMLElement;
  private readonly nPictures: number = 0;
  private readonly navDots: HTMLUListElement;
  private currentIndex: number = 0;
  private nAddedCopies: number = 0;
  private previousClonedPicture: HTMLImageElement | null = null;
  private wrapping: boolean = false;

  constructor(banner: Element) {
    this.images = banner.querySelector(".images") as HTMLElement;
    this.navDots = banner.querySelector("ul") as HTMLUListElement;
    this.firstPicture = this.images.children[0] as HTMLImageElement;
    this.nPictures = this.images.childElementCount;
    if (this.nPictures < 2) return;

    const leftArrow = banner.querySelector(".left") as HTMLElement;
    const rightArrow = banner.querySelector(".right") as HTMLElement;

    this.setUpImages();
    this.setUpNavDots();
    leftArrow.addEventListener("click", this.slideBannerLeft);
    rightArrow.addEventListener("click", this.slideBannerRight);
  }

  private resetImagePositions = () => {
    for (let i = 0; i < this.nPictures; i++) {
      let image = this.images.children[0] as HTMLElement;
    }
  };

  private setUpImages = () => {
    for (let i = 0; i < this.nPictures; i++)
      (this.images.children[i] as HTMLElement).dataset.index = i.toString();
  };

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
    const newIndex = (this.currentIndex - 1 + this.nPictures) % this.nPictures;
    if (this.wrapping || this.currentIndex === 0) {
      this.wrapping = true;
      this.updateNavDots(newIndex);
      const pictureRef = this.images.children[
        this.nAddedCopies + newIndex
      ] as HTMLImageElement;
      const pictureCopy = pictureRef.cloneNode() as HTMLImageElement;

      const currentFirstPicture = this.images.children[0] as HTMLImageElement;
      let leftMargin = parseFloat(
        window.getComputedStyle(currentFirstPicture).marginLeft
      );
      leftMargin = (leftMargin / currentFirstPicture.width) * 100 - 100;

      currentFirstPicture.className = "notransition";
      currentFirstPicture.style.marginLeft = "0";

      if (this.nAddedCopies > 0)
        pictureCopy.style.transitionTimingFunction = "ease-out"; // make it so there is no easily noticable jump in sliding velocity
      pictureCopy.style.marginLeft = leftMargin + "%";
      this.images.insertBefore(pictureCopy, this.images.children[0]);
      window.getComputedStyle(pictureCopy).marginLeft; // flush pending style changes
      currentFirstPicture.className = "";
      pictureCopy.style.marginLeft = "0";

      this.nAddedCopies++;

      this.previousClonedPicture?.removeEventListener(
        "transitionend",
        this.handleTransitionEnd
      );
      pictureCopy.addEventListener("transitionend", this.handleTransitionEnd);

      this.previousClonedPicture = pictureCopy;
    } else {
      this.slide(newIndex);
    }
  };

  private handleTransitionEnd = () => {
    do this.images.removeChild(this.images.children[0]);
    while (--this.nAddedCopies > 0);
    this.firstPicture.className = "notransition";
    this.firstPicture.style.marginLeft = "-" + this.currentIndex * 100 + "%";
    window.getComputedStyle(this.firstPicture).marginLeft; // flush pending style changes
    this.firstPicture.className = "";
    this.previousClonedPicture = null;
    this.wrapping = false;
  };

  private slideBannerRight = () => {
    let newIndex = (this.currentIndex + 1) % this.nPictures;
    this.slide(newIndex);

    // let firstPicture = this.images.children[0] as HTMLElement;
    // let secondPicture = this.images.children[1] as HTMLElement;
    // this.images.insertBefore(firstPicture, null);

    // firstPicture.style.marginLeft = "0";
    // secondPicture.style.marginLeft = "-100%";
  };

  private handleNavDotClick = (li: HTMLLIElement) => {
    let index = Number(li.dataset.index);
    if (index === this.currentIndex) return;
    this.slide(index);
  };

  private slide = (newIndex: number) => {
    this.updateNavDots(newIndex);
    this.firstPicture.style.marginLeft = "-" + newIndex * 100 + "%";
  };

  private updateNavDots = (newIndex: number) => {
    this.navDots.children[this.currentIndex].classList.remove("current");
    this.navDots.children[newIndex].classList.add("current");
    this.currentIndex = newIndex;
  };
}

const banners: HTMLCollectionOf<Element> = document.getElementsByClassName(
  "sliding-banner"
);

for (let i = 0; i < banners.length; i++) {
  new SlidingBanner(banners[i]);
}
