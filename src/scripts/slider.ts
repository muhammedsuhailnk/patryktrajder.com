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
  private contentWidth: number = 0;
  private currentIndex: number = 0;
  private isGrabbing: boolean = false;
  private isTimerSet: boolean = false;
  private isTimerStopped: boolean = false;
  private itemWidthWithGap: number = 0;
  private minMarginLeft: number = 0;
  private nAddedCopiesLeft: number = 0;
  private nAddedCopiesRight: number = 0;
  private realCurrentIndex: number = 0;
  private realFirstItem: HTMLElement;
  private sliding: boolean = false;
  private startMarginLeft: number = 0;
  private startX: number = 0;
  private timer?: number;

  constructor(
    slider: HTMLElement,
    isCyclic: boolean = false,
    showNavDots: boolean = false,
    slideDuration: number = 0,
    onItemClick?: (item: HTMLElement) => void
  ) {
    this.isCyclic = isCyclic;
    this.items = slider.querySelector(".items") as HTMLElement;
    this.leftArrow = slider.querySelector(".left") as HTMLElement;
    this.rightArrow = slider.querySelector(".right") as HTMLElement;
    this.nItems = this.items.childElementCount;
    this.realFirstItem = this.firstItem = this.items.children[0] as HTMLElement;
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

    this.firstItem.style.marginLeft = "0";

    for (let i = 0; i < this.items.children.length; i++) {
      let item = this.items.children[i] as HTMLElement;
      let sliderItem = new SliderItem(item, this.firstItem, this);
      sliderItem.onClick = onItemClick;
    }

    this.firstItem.addEventListener(
      "transitionend",
      this.handleFirstPictureTransitionEnd
    );
    this.items.addEventListener("pointerdown", this.handlePointerDown);

    this.setUpArrows();
    addEventListener("resize", this.handleWindowResize);
  }

  private calculateItemWidthWithGap = (): number => {
    const itemMarginLeft = parseFloat(
      getComputedStyle(this.secondItem).marginLeft
    );
    return this.secondItem.clientWidth + itemMarginLeft;
  };

  private calculateMinMarginLeft = (itemWidthWithGap: number): number => {
    const contentWidth =
      this.firstItem.clientWidth +
      itemWidthWithGap * (this.items.childElementCount - 1);
    const minMargin = this.items.clientWidth - contentWidth;
    if (minMargin > 0) return 0;
    return minMargin;
  };

  public drag = (offset: number) => {
    let marginLeft = this.startMarginLeft + offset;
    if (this.isCyclic) {
      marginLeft = Utils.modNeg(marginLeft, this.contentWidth);
    } else {
      if (marginLeft < this.minMarginLeft) marginLeft = this.minMarginLeft;
      else if (marginLeft > 0) marginLeft = 0;

      this.updateArrows(marginLeft);
    }
    this.firstItem.style.marginLeft = marginLeft + "px";

    const newIndex = ~~(
      (-marginLeft / this.itemWidthWithGap + 0.5) %
      this.nItems
    );
    this.updateNavDots(newIndex);
    this.currentIndex = newIndex;
  };

  public dragEnd = (offset: number) => {
    this.isGrabbing = false;
    this.firstItem.classList.remove("notransition");
    if (!this.isCyclic) return; // todo tmp solution
    this.realFirstItem = this.firstItem;
    this.firstItem.style.transitionTimingFunction = "ease-out";

    let marginLeft = this.startMarginLeft + offset;
    if (this.isCyclic) {
      marginLeft = Utils.modNeg(marginLeft, this.contentWidth);
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

      this.firstItem.addEventListener(
        "transitionend",
        this.handleTransitionEnd
      );
    });
  };

  public dragStart = () => {
    this.itemWidthWithGap = this.calculateItemWidthWithGap();
    this.contentWidth = this.nItems * this.itemWidthWithGap; // todo do something with additional gap
    this.isGrabbing = true;
    this.sliding = true;
    this.startMarginLeft = parseFloat(
      getComputedStyle(this.realFirstItem).marginLeft
    );
    this.startMarginLeft += this.nAddedCopiesLeft * this.itemWidthWithGap;
    this.startMarginLeft = Utils.modNeg(
      this.startMarginLeft,
      this.contentWidth
    );
    this.firstItem.style.marginLeft = this.startMarginLeft + "px";
    this.firstItem.classList.add("notransition");

    const newIndex = ~~(
      (-this.startMarginLeft / this.itemWidthWithGap + 0.5) %
      this.nItems
    );
    this.updateNavDots(newIndex);
    this.currentIndex = newIndex;

    if (this.isCyclic) {
      // todo tmp solution
      this.handleTransitionEnd();

      const firstItemCopy = this.firstItem.cloneNode(true) as HTMLElement;
      firstItemCopy.style.marginLeft = "0";
      this.items.insertBefore(firstItemCopy, null);
      this.nAddedCopiesRight++;
    }

    this.minMarginLeft = this.calculateMinMarginLeft(this.itemWidthWithGap);
  };

  private autoSlide = () => {
    this.slideRight(1);
  };

  private handleNavDotClick = (li: HTMLLIElement) => {
    let index = Number(li.dataset.index);
    if (index === this.currentIndex) return;

    let slideBy = index - this.currentIndex;
    if (slideBy < 0) this.slideLeft(-slideBy);
    else this.slideRight(slideBy);
  };

  private handlePointerDown = (e: PointerEvent) => {
    this.startX = e.x;
    this.items.setPointerCapture(e.pointerId);
    this.items.addEventListener("pointermove", this.handlePointerMove);
    this.items.addEventListener("pointerup", this.handleDragEnd);
    this.items.addEventListener("lostpointercapture", this.handleDragEnd);
    this.dragStart();
  };

  private handlePointerEnter = () => {
    clearTimeout(this.timer);
    this.isTimerSet = false;
    this.isTimerStopped = true;
  };

  private handlePointerMove = (e: PointerEvent) => {
    const offset = e.x - this.startX;
    this.drag(offset);
  };

  private handlePointerLeave = () => {
    if (this.isGrabbing) return;
    this.timer = setTimeout(this.autoSlide, this.slideDuration);
    this.isTimerSet = true;
    this.isTimerStopped = false;
  };

  private handleDragEnd = (e: PointerEvent) => {
    const offset = e.x - this.startX;
    this.items.releasePointerCapture(e.pointerId);
    this.items.removeEventListener("pointermove", this.handlePointerMove);
    this.items.removeEventListener("pointerup", this.handleDragEnd);
    this.items.removeEventListener("lostpointercapture", this.handleDragEnd);
    this.dragEnd(offset);
  };

  private handleFirstPictureTransitionEnd = () => {
    this.firstItem.style.transitionTimingFunction = "ease";
    this.sliding = false;
    if (this.slideDuration > 0 && !this.isTimerSet && !this.isTimerStopped) {
      this.timer = setTimeout(this.autoSlide, this.slideDuration);
      this.isTimerSet = true;
    }
  };

  private handleTransitionEnd = () => {
    const realFirstItemLocal = this.realFirstItem as HTMLElement;
    realFirstItemLocal.removeEventListener(
      "transitionend",
      this.handleTransitionEnd
    );

    while (this.nAddedCopiesLeft > 0) {
      this.items.removeChild(this.items.children[0]);
      this.nAddedCopiesLeft--;
    }
    while (this.nAddedCopiesRight > 0) {
      this.items.removeChild(this.items.lastChild as ChildNode);
      this.nAddedCopiesRight--;
    }

    if (!this.isGrabbing) {
      this.realCurrentIndex = this.currentIndex;
      this.realFirstItem = this.firstItem;
      this.firstItem.classList.add("notransition");
      this.firstItem.style.marginLeft = "-" + this.currentIndex * 100 + "%";
      getComputedStyle(this.firstItem).marginLeft; // flush pending style changes
      this.firstItem.classList.remove("notransition");
      this.handleFirstPictureTransitionEnd();
    }
  };

  private handleWindowResize = () => {
    if (this.items.clientWidth < this.slider.clientWidth) {
      this.realFirstItem.classList.add("notransition");
      let newMarginLeft =
        parseFloat(this.realFirstItem.style.marginLeft) +
        this.slider.clientWidth -
        this.items.clientWidth;
      if (newMarginLeft > 0) newMarginLeft = 0;
      this.realFirstItem.style.marginLeft = newMarginLeft + "px";
      getComputedStyle(this.realFirstItem).marginLeft; // flush pending style changes
      this.realFirstItem.classList.remove("notransition");
    }
  };

  private overflowLeft = (newIndex: number, by: number) => {
    let itemCopy, itemRef;

    let leftMargin = parseFloat(
      getComputedStyle(this.realFirstItem).marginLeft
    );
    leftMargin = (leftMargin / this.realFirstItem.clientWidth) * 100 - 100;

    this.realFirstItem.classList.add("notransition");
    this.realFirstItem.style.marginLeft = "0";

    for (let i = by; i > 1; i--) {
      itemRef = this.items.children[this.nAddedCopiesLeft + newIndex + by - 1];
      itemCopy = itemRef.cloneNode(true) as HTMLElement;
      this.items.insertBefore(itemCopy, this.realFirstItem);
      this.realFirstItem = itemCopy;
      leftMargin -= 100;
    }

    itemRef = this.items.children[this.nAddedCopiesLeft + newIndex + by - 1];
    itemCopy = itemRef.cloneNode(true) as HTMLElement;

    if (this.nAddedCopiesLeft > 0)
      itemCopy.style.transitionTimingFunction = "ease-out"; // make it so there is no easily noticable jump in sliding velocity
    itemCopy.style.marginLeft = leftMargin + "%";
    this.items.insertBefore(itemCopy, this.realFirstItem);
    getComputedStyle(itemCopy).marginLeft; // flush pending style changes
    this.realFirstItem.classList.remove("notransition");
    itemCopy.style.marginLeft = "0";

    this.nAddedCopiesLeft += by;

    this.realFirstItem.removeEventListener(
      "transitionend",
      this.handleTransitionEnd
    );
    this.realFirstItem = itemCopy;
    itemCopy.addEventListener("transitionend", this.handleTransitionEnd);
  };

  private overflowRight = (newIndex: number, by: number) => {
    let itemCopy, itemRef;

    for (let i = by - 1; i >= 0; i--) {
      itemRef = this.items.children[this.nAddedCopiesLeft + newIndex - i];
      itemCopy = itemRef.cloneNode(true) as HTMLElement;
      itemCopy.style.marginLeft = "0";
      this.items.insertBefore(itemCopy, null);
    }

    this.realFirstItem.style.marginLeft = -this.realCurrentIndex * 100 + "%";
    if (this.nAddedCopiesRight > 0)
      this.realFirstItem.style.transitionTimingFunction = "ease-out"; // make it so there is no easily noticable jump in sliding velocity

    this.nAddedCopiesRight += by;

    this.realFirstItem.addEventListener(
      "transitionend",
      this.handleTransitionEnd
    );
  };
  private setUpArrows = () => {
    this.leftArrow?.addEventListener("click", () => this.slideLeft(1));
    this.rightArrow?.addEventListener("click", () => this.slideRight(1));

    if (!this.isCyclic) {
      if (this.leftArrow) this.leftArrow.style.display = "none";
      if (this.rightArrow) {
        this.minMarginLeft = this.calculateMinMarginLeft(
          this.calculateItemWidthWithGap()
        );
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

  private beforeSlide = (newIndex: number) => {
    this.updateNavDots(newIndex);
    this.currentIndex = newIndex;
    if (this.slideDuration > 0) {
      clearTimeout(this.timer);
      this.isTimerSet = false;
    }
  };

  private slide = () => {
    this.realFirstItem.style.marginLeft =
      "-" + this.realCurrentIndex * 100 + "%";
    if (this.sliding)
      this.firstItem.style.transitionTimingFunction = "ease-out";
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

class SliderItem {
  public onClick?: (item: HTMLElement) => void;

  private readonly item: HTMLElement;
  private readonly slider: Slider;
  private abortClick: boolean = false;
  private startX: number = 0;

  constructor(item: HTMLElement, firstItem: HTMLElement, slider: Slider) {
    this.item = item;
    this.slider = slider;
    item.addEventListener("pointerdown", this.handlePointerDown);

    item.addEventListener("click", (e: MouseEvent) => {
      if (this.abortClick) return;
      const offset = e.x - this.startX;
      if (Math.abs(offset) > Constants.abortClickDistance) return;
      this.onClick?.(item);
    });
  }

  private handlePointerDown = (e: PointerEvent) => {
    e.stopPropagation();
    this.abortClick = false;
    this.startX = e.x;
    this.item.setPointerCapture(e.pointerId);
    this.item.addEventListener("pointermove", this.handlePointerMove);
    this.item.addEventListener("pointerup", this.handleSliderDragEnd);
    this.item.addEventListener("lostpointercapture", this.handleSliderDragEnd);
    this.slider.dragStart();
  };

  private handlePointerMove = (e: PointerEvent) => {
    const offset = e.x - this.startX;
    if (Math.abs(offset) > Constants.abortClickDistance) {
      this.abortClick = true;
      this.item.classList.add("dragging");
    }
    this.slider.drag(offset);
  };

  private handleSliderDragEnd = (e: PointerEvent) => {
    const offset = e.x - this.startX;
    this.item.classList.remove("dragging");
    this.item.releasePointerCapture(e.pointerId);
    this.item.removeEventListener("pointermove", this.handlePointerMove);
    this.item.removeEventListener("pointerup", this.handleSliderDragEnd);
    this.item.removeEventListener(
      "lostpointercapture",
      this.handleSliderDragEnd
    );
    this.slider.dragEnd(offset);
  };
}
