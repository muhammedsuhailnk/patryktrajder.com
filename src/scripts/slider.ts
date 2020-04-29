import Constants from "./constants";

export default class Slider {
  private readonly slider: HTMLElement;
  private isGrabbing: boolean = false;
  private startX: number = 0;
  private scrollStartLeft: number = 0;

  constructor(slider: HTMLElement, onItemClick?: (item: HTMLElement) => void) {
    this.slider = slider.children[0] as HTMLElement;
    this.slider.addEventListener("pointerdown", this.handlePointerDown);

    for (let i = 0; i < this.slider.childNodes.length; i++) {
      let item = new SliderItem(
        this.slider.childNodes[i] as HTMLElement,
        this.slider
      );
      item.onClick = onItemClick;
    }
  }

  private handlePointerDown = (e: PointerEvent) => {
    this.isGrabbing = true;
    this.startX = e.x;
    this.scrollStartLeft = this.slider.scrollLeft;
    this.slider.setPointerCapture(e.pointerId);
    this.slider.addEventListener("pointermove", this.handlePointerMove);
    this.slider.addEventListener("pointerup", this.handleDragEnd);
    this.slider.addEventListener("lostpointercapture", this.handleDragEnd);
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.isGrabbing) return;
    const offset = e.x - this.startX;
    this.slider.scrollLeft = this.scrollStartLeft - offset;
  };

  private handleDragEnd = (e: PointerEvent) => {
    this.isGrabbing = false;
    this.slider.releasePointerCapture(e.pointerId);
    this.slider.removeEventListener("pointermove", this.handlePointerMove);
    this.slider.removeEventListener("pointerup", this.handleDragEnd);
    this.slider.removeEventListener("lostpointercapture", this.handleDragEnd);
  };
}

class SliderItem {
  public onClick?: (item: HTMLElement) => void;

  private readonly item: HTMLElement;
  private readonly slider: HTMLElement;
  private abortClick: boolean = false;
  private isGrabbing: boolean = false;
  private startX: number = 0;
  private scrollStartLeft: number = 0;

  constructor(item: HTMLElement, slider: HTMLElement) {
    this.item = item;
    this.slider = slider;
    item.addEventListener("pointerdown", this.handlePoinderDown);

    item.addEventListener("click", (e: MouseEvent) => {
      if (this.abortClick) return;
      const offset = e.x - this.startX;
      if (Math.abs(offset) > Constants.abortClickDistance) return;
      this.onClick?.(item);
    });
  }

  private handlePoinderDown = (e: PointerEvent) => {
    e.stopPropagation();
    this.abortClick = false;
    this.isGrabbing = true;
    this.startX = e.x;
    this.scrollStartLeft = this.slider.scrollLeft;
    this.item.setPointerCapture(e.pointerId);
    this.item.addEventListener("pointermove", this.handlePointerMove);
    this.item.addEventListener("pointerup", this.handleSliderDragEnd);
    this.item.addEventListener("lostpointercapture", this.handleSliderDragEnd);
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.isGrabbing) return;
    const offset = e.x - this.startX;
    if (Math.abs(offset) > Constants.abortClickDistance) {
      this.abortClick = true;
      this.item.classList.add("dragging");
    }
    this.slider.scrollLeft = this.scrollStartLeft - offset;
  };

  private handleSliderDragEnd = (e: PointerEvent) => {
    this.isGrabbing = false;
    this.item.classList.remove("dragging");
    this.item.releasePointerCapture(e.pointerId);
    this.item.removeEventListener("pointermove", this.handlePointerMove);
    this.item.removeEventListener("pointerup", this.handleSliderDragEnd);
    this.item.removeEventListener(
      "lostpointercapture",
      this.handleSliderDragEnd
    );
  };
}
