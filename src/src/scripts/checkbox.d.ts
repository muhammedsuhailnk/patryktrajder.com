export default class Checkbox {
    private readonly container;
    private readonly priceWith;
    private readonly priceWithout;
    private readonly priceWithEn;
    private readonly priceWithoutEn;
    private isChecked;
    private readonly svgUse;
    constructor(container: HTMLElement, priceWith: number, priceWithout: number, priceWithEn: number, priceWithoutEn: number, isChecked?: boolean);
    private toggle;
    private setPrice;
}
