/**
 * Money utility to handle integer-based currency math (cents/sub-units).
 * Prevents floating point drift.
 */
export class Money {
  private amount: number; // Stored in cents (e.g., 100.00 PHP = 10000)

  constructor(amountInCents: number) {
    this.amount = Math.round(amountInCents);
  }

  static fromDouble(amount: number): Money {
    return new Money(amount * 100);
  }

  static zero(): Money {
    return new Money(0);
  }

  get cents(): number {
    return this.amount;
  }

  get value(): number {
    return this.amount / 100;
  }

  add(other: Money): Money {
    return new Money(this.amount + other.cents);
  }

  subtract(other: Money): Money {
    return new Money(this.amount - other.cents);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor);
  }

  addPercentage(percentage: number): Money {
    // percentage is 0.5 for 50%
    return new Money(this.amount + this.amount * percentage);
  }

  format(currency = "PHP"): string {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency,
    }).format(this.value);
  }
}
