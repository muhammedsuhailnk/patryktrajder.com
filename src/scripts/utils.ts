export default class Utils {
  public static mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  }
  public static modNeg(n: number, m: number): number {
    return ((n % m) - m) % m;
  }
}
