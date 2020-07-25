export default class Menu {
  private navigation: HTMLElement;

  constructor(private readonly menu: HTMLElement) {
    this.menu = menu;
    this.navigation = menu.querySelector("nav") as HTMLElement;
    const menuButton = menu.querySelector(".menu-button") as HTMLButtonElement;

    this.navigation.addEventListener("transitionend", this.onNavOpened);
    menuButton.addEventListener("click", this.toggle);
  }

  private toggle = () => {
    document.body.classList.toggle("hide-overflow");
    this.menu.classList.toggle("open");
    this.navigation.style.removeProperty("overflow");
  };

  private onNavOpened = () => {
    this.navigation.style.overflow = "auto";
  };
}
