export default class Header {
    private readonly header;
    private readonly menu;
    private readonly navigation;
    private readonly mediaQuery;
    private readonly wrapper;
    private headerHeight;
    private isMenuHorizontal;
    private isOpen;
    constructor(header: HTMLElement);
    private getInitialHeaderHeight;
    private handleAnchorClick;
    private handleMediaQueryChange;
    private handleHeaderHeightChange;
    private onToggled;
    private toggle;
}
