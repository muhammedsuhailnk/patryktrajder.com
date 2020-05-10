import Constants from "./constants";

export default class Expander {
  private readonly svgUse: SVGUseElement;
  private readonly container: HTMLElement;
  private readonly expander: HTMLElement;
  private isExpanded: boolean = false;

  constructor(expander: HTMLElement) {
    this.expander = expander;
    let button = expander.querySelector("button") as HTMLElement;
    this.container = expander.querySelector(".container") as HTMLElement;
    this.svgUse = expander.querySelector("use") as SVGUseElement;

    button.addEventListener("click", this.toggle);
  }

  private toggle = () => {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.container.style.height = this.container.scrollHeight + "px";
      this.svgUse.href.baseVal = "#icon-chevron-up";
    } else {
      this.container.style.height = Constants.expanderMinHeight + "rem";
      this.svgUse.href.baseVal = "#icon-chevron-down";
      if (window.scrollY > this.expander.offsetTop)
        window.scrollTo(window.scrollX, this.expander.offsetTop);
    }
  };
}
