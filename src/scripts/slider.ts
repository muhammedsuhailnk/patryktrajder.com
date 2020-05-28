import Constants from "./constants";
import Utils from "./utils";

export default class Slider {
  private readonly firstItem: HTMLElement;
  private readonly isCyclic: boolean;
  private readonly items: HTMLElement;
  private readonly leftArrow?: HTMLElement;
  private readonly rightArrow?: HTMLElement;
  private readonly navDots?: HTMLUListElement;
  private readonly nItems: number;
  private readonly secondItem: HTMLElement;
  private readonly showNavDots: boolean;
  private readonly slideDuration: number;
  private readonly slider: HTMLElement;
  private readonly wrapper: HTMLElement;
  private abortClick: boolean = false;
  private contentWidthMod: number = 0;
  private currentIndex: number = 0;
  private isGrabbing: boolean = false;
  private isTimerSet: boolean = false;
  private isTimerStopped: boolean = false;
  private itemWidthWithGap: number = 0;
  private minMarginLeft: number = 0;
  private nAddedCopiesLeft: number = 0;
  private nAddedCopiesRight: number = 0;
  private realCurrentIndex: number = 0;
  private sliding: boolean = false;
  private startMarginLeft: number = 0;
  private startX: number = 0;
  private timer?: number;

  constructor(
    slider: HTMLElement,
    isCyclic: boolean = false,
    showNavDots: boolean = false,
    slideDuration: number = 0
  ) {
    this.isCyclic = isCyclic;
    this.wrapper = slider.querySelector(".wrapper") as HTMLElement;
    this.items = this.wrapper.querySelector(".items") as HTMLElement;
    this.leftArrow = slider.querySelector(".left") as HTMLElement;
    this.rightArrow = slider.querySelector(".right") as HTMLElement;
    this.nItems = this.items.childElementCount;
    this.firstItem = this.items.children[0] as HTMLElement;
    this.secondItem = this.items.children[1] as HTMLElement;
    this.showNavDots = showNavDots;
    this.slideDuration = slideDuration;
    this.slider = slider;

    if (slideDuration > 0) {
      this.timer = setTimeout(this.autoSlide, slideDuration);
      this.isTimerSet = true;
      slider.addEventListener("pointerenter", this.handlePointerEnter);
      slider.addEventListener("pointerleave", this.handlePointerLeave);
    }

    if (showNavDots) {
      this.navDots = slider.querySelector("ul") as HTMLUListElement;
      this.setUpNavDots();
    }

    this.setUpArrows();
    this.handleWindowResize();
    this.items.addEventListener(
      "transitionend",
      this.handleFirstPictureTransitionEnd
    );
    this.items.addEventListener("dragstart", (e) => {
      e.preventDefault();
    });
    addEventListener("resize", this.handleWindowResize);
  }

  public update(): void {
    this.handleWindowResize();
  }

  private autoSlide = () => {
    this.slideRight(1);
  };

  private beforeSlide = (newIndex: number) => {
    this.updateNavDots(newIndex);
    this.currentIndex = newIndex;
    if (this.slideDuration > 0) {
      clearTimeout(this.timer);
      this.isTimerSet = false;
    }
  };

  private calculateContentWidth = (itemWidthWithGap: number): number => {
    return (
      this.firstItem.clientWidth +
      itemWidthWithGap * (this.items.childElementCount - 1)
    );
  };

  private calculateItemWidthWithGap = (): number => {
    const itemMarginLeft = parseFloat(
      getComputedStyle(this.secondItem).marginLeft
    );
    return this.secondItem.clientWidth + itemMarginLeft;
  };

  private calculateMinMarginLeft = (contentWidth: number): number => {
    const minMargin = this.items.clientWidth - contentWidth;
    if (minMargin > 0) return 0;
    return minMargin;
  };

  private drag = (offset: number) => {
    let marginLeft = this.startMarginLeft + offset;
    if (this.isCyclic) {
      marginLeft = Utils.modNeg(marginLeft, this.contentWidthMod);
    } else {
      if (marginLeft < this.minMarginLeft) marginLeft = this.minMarginLeft;
      else if (marginLeft > 0) marginLeft = 0;

      this.updateArrows(marginLeft);
    }
    this.items.style.marginLeft = marginLeft + "px";

    const newIndex = ~~(
      (-marginLeft / this.itemWidthWithGap + 0.5) %
      this.nItems
    );
    this.updateNavDots(newIndex);
    this.currentIndex = newIndex;
  };

  private dragEnd = (offset: number) => {
    this.isGrabbing = false;
    this.items.classList.remove("notransition");
    if (this.slideDuration > 0)
      this.items.style.transitionTimingFunction = "ease-out";

    let marginLeft = this.startMarginLeft + offset;
    if (this.isCyclic) {
      marginLeft = Utils.modNeg(marginLeft, this.contentWidthMod);
    } else {
      if (marginLeft < this.minMarginLeft) marginLeft = this.minMarginLeft;
      else if (marginLeft > 0) marginLeft = 0;
    }

    let threshold;
    if (offset > 0) threshold = Constants.dragSlideThreshold;
    else threshold = 1 - Constants.dragSlideThreshold;

    const partialIndex = -marginLeft / this.itemWidthWithGap;
    this.realCurrentIndex = ~~(partialIndex + 0.5);
    let newIndex = ~~((partialIndex + threshold) % this.nItems);

    setTimeout(() => {
      if (this.currentIndex !== newIndex && offset !== 0) {
        if (offset > 0) this.slideLeft(1);
        else this.slideRight(1);
      } else {
        if (partialIndex - ~~partialIndex > 0.5) this.slideRight(0);
        else this.slideLeft(0);
      }

      this.items.addEventListener("transitionend", this.handleTransitionEnd);
    });
  };

  private dragStart = () => {
    this.itemWidthWithGap = this.calculateItemWidthWithGap();
    this.contentWidthMod = this.nItems * this.itemWidthWithGap;
    this.isGrabbing = true;
    this.sliding = true;
    this.startMarginLeft = parseFloat(getComputedStyle(this.items).marginLeft);

    if (this.isCyclic) {
      this.startMarginLeft += this.nAddedCopiesLeft * this.itemWidthWithGap;
      this.startMarginLeft = Utils.modNeg(
        this.startMarginLeft,
        this.contentWidthMod
      );

      this.removeCopies();
      const firstItemCopy = this.firstItem.cloneNode(true) as HTMLElement;
      this.items.insertBefore(firstItemCopy, null);
      this.nAddedCopiesRight++;
    } else {
      this.handleFirstPictureTransitionEnd();
    }

    const newIndex = ~~(
      (-this.startMarginLeft / this.itemWidthWithGap + 0.5) %
      this.nItems
    );
    this.updateNavDots(newIndex);
    this.currentIndex = newIndex;

    this.items.style.marginLeft = this.startMarginLeft + "px";
    this.items.classList.add("notransition");

    const contentWidth = this.calculateContentWidth(this.itemWidthWithGap);
    this.minMarginLeft = this.calculateMinMarginLeft(contentWidth);
  };

  private handleClick = (e: MouseEvent) => {
    if (this.abortClick) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  private handleDragEnd = (e: PointerEvent) => {
    console.log("end  " + e.x + " " + e.y);
    const offset = e.x - this.startX;
    this.wrapper.classList.remove("dragging");
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    this.wrapper.removeEventListener(
      "pointermove",
      this.handlePointerMove,
      true
    );
    this.wrapper.removeEventListener("pointerup", this.handleDragEnd, true);
    this.wrapper.removeEventListener(
      "lostpointercapture",
      this.handleDragEnd,
      true
    );
    this.dragEnd(offset);
  };

  private handleNavDotClick = (li: HTMLLIElement) => {
    let index = Number(li.dataset.index);
    if (index === this.currentIndex) return;

    let slideBy = index - this.currentIndex;
    if (slideBy < 0) this.slideLeft(-slideBy);
    else this.slideRight(slideBy);
  };

  private handlePointerDown = (e: PointerEvent) => {
    this.abortClick = false;
    this.startX = e.x;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    this.wrapper.addEventListener("pointermove", this.handlePointerMove, true);
    this.wrapper.addEventListener("pointerup", this.handleDragEnd, true);
    this.wrapper.addEventListener(
      "lostpointercapture",
      this.handleDragEnd,
      true
    );
    this.dragStart();
  };

  private handlePointerEnter = () => {
    clearTimeout(this.timer);
    this.isTimerSet = false;
    this.isTimerStopped = true;
  };

  private handlePointerMove = (e: PointerEvent) => {
    console.log("move " + e.x + " " + e.y);
    const offset = e.x - this.startX;
    if (Math.abs(offset) > Constants.abortClickDistance) {
      this.abortClick = true;
      this.wrapper.classList.add("dragging");
      e.stopPropagation();
      e.preventDefault();
    }
    this.drag(offset);
  };

  private handlePointerLeave = () => {
    if (this.isGrabbing) return;
    this.timer = setTimeout(this.autoSlide, this.slideDuration);
    this.isTimerSet = true;
    this.isTimerStopped = false;
  };

  private handleFirstPictureTransitionEnd = () => {
    this.items.style.transitionTimingFunction = "ease";
    this.sliding = false;
    if (this.slideDuration > 0 && !this.isTimerSet && !this.isTimerStopped) {
      this.timer = setTimeout(this.autoSlide, this.slideDuration);
      this.isTimerSet = true;
    }
  };

  private handleTransitionEnd = () => {
    this.items.removeEventListener("transitionend", this.handleTransitionEnd);

    this.removeCopies();

    if (!this.isGrabbing) {
      this.realCurrentIndex = this.currentIndex;
      this.items.classList.add("notransition");
      this.items.style.marginLeft = "-" + this.currentIndex * 100 + "%";
      getComputedStyle(this.items).marginLeft; // flush pending style changes
      this.items.classList.remove("notransition");
      this.handleFirstPictureTransitionEnd();
    }
  };

  private handleWindowResize = () => {
    this.itemWidthWithGap = this.calculateItemWidthWithGap();
    const contentWidth = this.calculateContentWidth(this.itemWidthWithGap);
    if (contentWidth < this.items.clientWidth) {
      this.wrapper.classList.add("center");
      this.items.classList.add("notransition");
      this.items.style.marginLeft = "0";
      getComputedStyle(this.items).marginLeft; // flush pending style changes
      this.items.classList.remove("notransition");
      this.wrapper.removeEventListener(
        "pointerdown",
        this.handlePointerDown,
        true
      );
      this.items.removeEventListener("click", this.handleClick, true);
    } else {
      this.minMarginLeft = this.calculateMinMarginLeft(contentWidth);
      if (
        parseFloat(getComputedStyle(this.items).marginLeft) < this.minMarginLeft
      ) {
        this.items.classList.add("notransition");
        this.items.style.marginLeft = this.minMarginLeft + "px";
        getComputedStyle(this.items).marginLeft; // flush pending style changes
        this.items.classList.remove("notransition");
      }
      this.wrapper.classList.remove("center");
      this.wrapper.addEventListener(
        "pointerdown",
        this.handlePointerDown,
        true
      );
      this.items.addEventListener("click", this.handleClick, true);
    }
  };

  private overflowLeft = (newIndex: number, by: number) => {
    let itemCopy, itemRef;

    let leftMargin = parseFloat(getComputedStyle(this.items).marginLeft);
    leftMargin = (leftMargin / this.firstItem.clientWidth) * 100 - 100;

    for (let i = by; i > 1; i--) {
      itemRef = this.items.children[this.nAddedCopiesLeft + newIndex + by - 1];
      itemCopy = itemRef.cloneNode(true) as HTMLElement;
      this.items.insertBefore(itemCopy, this.items.firstChild);
      leftMargin -= 100;
    }

    itemRef = this.items.children[this.nAddedCopiesLeft + newIndex + by - 1];
    itemCopy = itemRef.cloneNode(true) as HTMLElement;

    if (this.nAddedCopiesLeft > 0)
      this.items.style.transitionTimingFunction = "ease-out"; // make it so there is no easily noticable jump in sliding velocity
    this.items.classList.add("notransition");
    this.items.style.marginLeft = leftMargin + "%";
    this.items.insertBefore(itemCopy, this.items.firstChild);
    getComputedStyle(itemCopy).marginLeft; // flush pending style changes
    this.items.classList.remove("notransition");
    this.items.style.marginLeft = "0";

    this.nAddedCopiesLeft += by;

    this.items.addEventListener("transitionend", this.handleTransitionEnd);
  };

  private overflowRight = (newIndex: number, by: number) => {
    for (let i = by - 1; i >= 0; i--) {
      let itemRef = this.items.children[this.nAddedCopiesLeft + newIndex - i];
      let itemCopy = itemRef.cloneNode(true) as HTMLElement;
      this.items.insertBefore(itemCopy, null);
    }

    this.items.style.marginLeft = -this.realCurrentIndex * 100 + "%";
    if (this.nAddedCopiesRight > 0)
      this.items.style.transitionTimingFunction = "ease-out"; // make it so there is no easily noticable jump in sliding velocity

    this.nAddedCopiesRight += by;

    this.items.addEventListener("transitionend", this.handleTransitionEnd);
  };
  private setUpArrows = () => {
    this.leftArrow?.addEventListener("click", () => this.slideLeft(1));
    this.rightArrow?.addEventListener("click", () => this.slideRight(1));

    if (!this.isCyclic) {
      if (this.leftArrow) this.leftArrow.style.display = "none";
      if (this.rightArrow) {
        const contentWidth = this.calculateContentWidth(
          this.calculateItemWidthWithGap()
        );
        this.minMarginLeft = this.calculateMinMarginLeft(contentWidth);
        if (this.minMarginLeft === 0) this.rightArrow.style.display = "none";
      }
    }
  };

  private setUpNavDots = () => {
    const _this: Slider = this;
    let li: HTMLLIElement = document.createElement("li");
    li.className = "circle current";
    li.dataset.index = "0";
    li.addEventListener("click", function () {
      _this.handleNavDotClick(this);
    });
    this.navDots?.appendChild(li);

    for (let i = 1; i < this.nItems; i++) {
      li = document.createElement("li");
      li.className = "circle";
      li.dataset.index = i.toString();
      li.addEventListener("click", function () {
        _this.handleNavDotClick(this);
      });
      this.navDots?.appendChild(li);
    }
  };

  private removeCopies = () => {
    while (this.nAddedCopiesLeft > 0) {
      this.items.removeChild(this.items.children[0]);
      this.nAddedCopiesLeft--;
    }

    while (this.nAddedCopiesRight > 0) {
      this.items.removeChild(this.items.lastChild as ChildNode);
      this.nAddedCopiesRight--;
    }
  };

  private slide = () => {
    this.items.style.marginLeft = "-" + this.realCurrentIndex * 100 + "%";
    if (this.sliding) this.items.style.transitionTimingFunction = "ease-out";
    this.sliding = true;
  };

  private slideLeft = (by: number) => {
    const newIndex = (this.currentIndex - by + this.nItems) % this.nItems;
    this.beforeSlide(newIndex);

    if (this.realCurrentIndex < by) {
      this.overflowLeft(newIndex, by);
    } else {
      this.realCurrentIndex -= by;
      this.slide();
    }
  };

  private slideRight = (by: number) => {
    let newIndex = (this.currentIndex + by) % this.nItems;
    this.realCurrentIndex += by;
    this.beforeSlide(newIndex);

    if (this.realCurrentIndex >= this.items.childElementCount) {
      this.overflowRight(newIndex, by);
    } else {
      this.slide();
    }
  };

  private updateArrows = (marginLeft: number) => {
    if (this.leftArrow) {
      if (marginLeft < 0) this.leftArrow.style.display = "block";
      else this.leftArrow.style.display = "none";
    }
    if (this.rightArrow) {
      if (marginLeft > this.minMarginLeft)
        this.rightArrow.style.display = "block";
      else this.rightArrow.style.display = "none";
    }
  };

  private updateNavDots = (newIndex: number) => {
    if (!this.showNavDots) return;
    this.navDots?.children[this.currentIndex].classList.remove("current");
    this.navDots?.children[newIndex].classList.add("current");
  };
}
