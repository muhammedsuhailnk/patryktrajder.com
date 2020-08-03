import Constants from "./constants";
import Utils from "./utils";

export default class Header {
  private readonly menu: HTMLElement;
  private readonly navigation: HTMLElement;
  private readonly mediaQuery: MediaQueryList;
  private headerHeight: number;
  private isMenuHorizontal: boolean = false;
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
    this.headerHeight = this.getInitialHeaderHeight();

    this.mediaQuery.addEventListener("change", this.handleHeaderHeightChange);
    document.addEventListener("scroll", this.handleHeaderHeightChange);
    this.navigation.addEventListener("transitionend", this.onToggled);
    menuButton.addEventListener("click", this.toggle);

    for (let i = 0; i < anchors.length; i++)
      anchors[i].addEventListener("click", this.toggle);
  }

  private getInitialHeaderHeight = () => {
    const remScale = Utils.remToPx(1);
    let headerMaxHeight;

    if (this.mediaQuery.matches)
      headerMaxHeight = Constants.headerMaxHeightMobile;
    else headerMaxHeight = Constants.headerMaxHeightDesktop;

    return Math.max(
      headerMaxHeight * remScale - window.pageYOffset,
      Constants.headerMinHeight * remScale
    );
  };

  private handleHeaderHeightChange = () => {
    const remScale = Utils.remToPx(1);
    const headerMinHeight = Constants.headerMinHeight * remScale;
    let headerMaxHeight;

    if (this.mediaQuery.matches)
      headerMaxHeight = Constants.headerMaxHeightMobile;
    else headerMaxHeight = Constants.headerMaxHeightDesktop;

    this.headerHeight = Math.max(
      headerMaxHeight * remScale - window.pageYOffset,
      headerMinHeight
    );

    if (this.mediaQuery.matches)
      this.navigation.style.top = this.headerHeight + "px";

    if (this.headerHeight <= headerMinHeight) {
      this.navigation.style.removeProperty("padding-bottom");
      if (this.mediaQuery.matches) {
        this.isMenuHorizontal = false;
        this.header.classList.remove("horizontal");
      } else if (!this.isMenuHorizontal) {
        this.isMenuHorizontal = true;
        this.headerHeight = headerMinHeight + 1;
        this.header.classList.add("horizontal");
      }
    } else {
      this.isMenuHorizontal = false;
      this.header.classList.remove("horizontal");
      if (!this.mediaQuery.matches) {
        this.navigation.style.paddingBottom =
          ((Constants.headerNavMaxPaddingBottom -
            Constants.headerNavMinPaddingBottom) *
            (this.headerHeight - headerMinHeight)) /
            ((Constants.headerMaxHeightDesktop - Constants.headerMinHeight) *
              remScale) +
          Constants.headerNavMinPaddingBottom +
          "rem";
      }
    }

    this.header.style.height = this.headerHeight + "px";
  };

  private onToggled = () => {
    if (this.isOpen) {
      this.navigation.style.overflow = "auto";
      this.navigation.classList.add("opened");
    }
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
      this.navigation.classList.remove("opened");
    }
  };
}
