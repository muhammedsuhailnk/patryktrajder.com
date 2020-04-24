class SlidingBanner {
  private readonly firstPicture: HTMLImageElement;
  private readonly images: HTMLElement;
  private readonly nPictures: number = 0;
  private readonly navDots: HTMLUListElement;
  private currentIndex: number = 0;
  private realCurrentIndex: number = 0;
  private nAddedCopiesLeft: number = 0;
  private nAddedCopiesRight: number = 0;
  private realFirstPicture: HTMLImageElement;
  private sliding: boolean = false;

  constructor(banner: Element) {
    this.images = banner.querySelector(".images") as HTMLElement;
    this.navDots = banner.querySelector("ul") as HTMLUListElement;
    this.realFirstPicture = this.firstPicture = this.images
      .children[0] as HTMLImageElement;
    this.nPictures = this.images.childElementCount;
    if (this.nPictures < 2) return;

    const leftArrow = banner.querySelector(".left") as HTMLElement;
    const rightArrow = banner.querySelector(".right") as HTMLElement;

    this.setUpImages();
    this.setUpNavDots();
    leftArrow.addEventListener("click", () => this.slideBannerLeft(1));
    rightArrow.addEventListener("click", () => this.slideBannerRight(1));
  }

  private setUpImages = () => {
    for (let i = 0; i < this.nPictures; i++)
      (this.images.children[i] as HTMLElement).dataset.index = i.toString();

    this.firstPicture.addEventListener(
      "transitionend",
      this.handleFirstPictureTransitionEnd
    );
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

  private handleFirstPictureTransitionEnd = () => {
    this.firstPicture.style.transitionTimingFunction = "ease";
    this.sliding = false;
  };

  private handleNavDotClick = (li: HTMLLIElement) => {
    let index = Number(li.dataset.index);
    if (index === this.currentIndex) return;

    let slideBy = index - this.currentIndex;
    if (slideBy < 0) this.slideBannerLeft(-slideBy);
    else this.slideBannerRight(slideBy);
  };

  private handleTransitionEnd = () => {
    const realFirstPic = this.realFirstPicture as HTMLImageElement;
    realFirstPic.removeEventListener("transitionend", this.handleTransitionEnd);

    while (this.nAddedCopiesLeft > 0) {
      this.images.removeChild(this.images.children[0]);
      this.nAddedCopiesLeft--;
    }
    while (this.nAddedCopiesRight > 0) {
      this.images.removeChild(this.images.lastChild as ChildNode);
      this.nAddedCopiesRight--;
    }

    this.realCurrentIndex = this.currentIndex;
    this.realFirstPicture = this.firstPicture;
    this.firstPicture.className = "notransition";
    this.firstPicture.style.marginLeft = "-" + this.currentIndex * 100 + "%";
    window.getComputedStyle(this.firstPicture).marginLeft; // flush pending style changes
    this.firstPicture.className = "";
    this.handleFirstPictureTransitionEnd();
  };

  private overflowLeft = (newIndex: number, by: number) => {
    let pictureCopy;
    let pictureRef;

    this.updateNavDots(newIndex);

    let leftMargin = parseFloat(
      window.getComputedStyle(this.realFirstPicture).marginLeft
    );
    leftMargin = (leftMargin / this.realFirstPicture.width) * 100 - 100;

    this.realFirstPicture.className = "notransition";
    this.realFirstPicture.style.marginLeft = "0";

    for (let i = by; i > 1; i--) {
      pictureRef = this.images.children[
        this.nAddedCopiesLeft + newIndex + by - 1
      ];
      pictureCopy = pictureRef.cloneNode() as HTMLImageElement;
      this.images.insertBefore(pictureCopy, this.realFirstPicture);
      this.realFirstPicture = pictureCopy;
      leftMargin -= 100;
    }

    pictureRef = this.images.children[
      this.nAddedCopiesLeft + newIndex + by - 1
    ];
    pictureCopy = pictureRef.cloneNode() as HTMLImageElement;

    if (this.nAddedCopiesLeft > 0)
      pictureCopy.style.transitionTimingFunction = "ease-out"; // make it so there is no easily noticable jump in sliding velocity
    pictureCopy.style.marginLeft = leftMargin + "%";
    this.images.insertBefore(pictureCopy, this.realFirstPicture);
    window.getComputedStyle(pictureCopy).marginLeft; // flush pending style changes
    this.realFirstPicture.className = "";
    pictureCopy.style.marginLeft = "0";

    this.nAddedCopiesLeft += by;

    this.realFirstPicture.removeEventListener(
      "transitionend",
      this.handleTransitionEnd
    );
    this.realFirstPicture = pictureCopy;
    pictureCopy.addEventListener("transitionend", this.handleTransitionEnd);
  };

  private overflowRight = (newIndex: number, by: number) => {
    let pictureCopy;
    let pictureRef;

    this.updateNavDots(newIndex);

    for (let i = by - 1; i > 0; i--) {
      pictureRef = this.images.children[this.nAddedCopiesLeft + newIndex - i];
      pictureCopy = pictureRef.cloneNode() as HTMLImageElement;
      this.images.insertBefore(pictureCopy, null);
    }

    pictureRef = this.images.children[this.nAddedCopiesLeft + newIndex];
    pictureCopy = pictureRef.cloneNode() as HTMLImageElement;

    pictureCopy.style.marginLeft = "0";
    this.images.insertBefore(pictureCopy, null);
    this.realFirstPicture.style.marginLeft = -this.realCurrentIndex * 100 + "%";
    if (this.nAddedCopiesRight > 0)
      this.realFirstPicture.style.transitionTimingFunction = "ease-out"; // make it so there is no easily noticable jump in sliding velocity

    this.nAddedCopiesRight += by;

    this.realFirstPicture.addEventListener(
      "transitionend",
      this.handleTransitionEnd
    );
  };

  private slideBannerLeft = (by: number) => {
    const newIndex = (this.currentIndex - by + this.nPictures) % this.nPictures;
    if (this.realCurrentIndex < by) {
      this.overflowLeft(newIndex, by);
    } else {
      this.realCurrentIndex -= by;
      this.slide(newIndex);
    }
  };

  private slideBannerRight = (by: number) => {
    let newIndex = (this.currentIndex + by) % this.nPictures;
    this.realCurrentIndex += by;
    if (this.realCurrentIndex >= this.images.childElementCount) {
      this.overflowRight(newIndex, by);
    } else {
      this.slide(newIndex);
    }
  };

  private slide = (newIndex: number) => {
    this.updateNavDots(newIndex);
    this.realFirstPicture.style.marginLeft =
      "-" + this.realCurrentIndex * 100 + "%";
    if (this.sliding)
      this.firstPicture.style.transitionTimingFunction = "ease-out";
    this.sliding = true;
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
