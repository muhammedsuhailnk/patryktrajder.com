import Constants from "./constants";
import Utils from "./utils";

export default class Header {
  private readonly menu: HTMLElement;
  private readonly navigation: HTMLElement;
  private readonly mediaQuery: MediaQueryList;
  private headerHeight: number = Utils.remToPx(Constants.headerMaxHeight);
  private isOpen: boolean = false;

  constructor(private readonly header: HTMLElement) {
    this.menu = header.querySelector(".menu") as HTMLElement;
    this.navigation = this.menu.querySelector("nav") as HTMLElement;
    const menuButton = this.menu.querySelector(
      ".menu-button"
    ) as HTMLButtonElement;
    const anchors = this.navigation.querySelectorAll("a");

    this.mediaQuery = window.matchMedia(
      "(max-width: " + Constants.headerMenuWidthThreshold + "px)"
    );

    this.mediaQuery.addEventListener("change", this.handleHeaderHeightChange);
    document.addEventListener("scroll", this.handleHeaderHeightChange);
    this.navigation.addEventListener("transitionend", this.onNavOpened);
    menuButton.addEventListener("click", this.toggle);

    for (let i = 0; i < anchors.length; i++)
      anchors[i].addEventListener("click", this.toggle);
  }

  private handleHeaderHeightChange = () => {
    if (!this.mediaQuery.matches) {
      this.header.style.removeProperty("height");
      return;
    }

    const remScale = Utils.remToPx(1);
    const headerMinHeight = Constants.headerMinHeight * remScale;

    this.headerHeight =
      Constants.headerMaxHeight * remScale - window.pageYOffset;

    if (this.headerHeight <= headerMinHeight)
      this.headerHeight = headerMinHeight + 1;

    //this.headerHeight++; // account for 1px bottom border
    this.header.style.height = this.headerHeight + "px";
  };

  private onNavOpened = () => {
    this.navigation.style.overflow = "auto";
  };

  private toggle = () => {
    document.body.classList.toggle("hide-overflow");
    this.menu.classList.toggle("open");
    this.navigation.style.removeProperty("overflow");

    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.navigation.style.top = this.headerHeight + "px";
      this.navigation.style.height =
        "calc((100% - " + this.headerHeight + "px)";
    } else {
      this.navigation.style.removeProperty("height");
    }
  };
}
