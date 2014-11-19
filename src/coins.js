
// TODO load player coins from game save service
// TODO basic validation/balance checking
class CoinPurse {

  constructor() {
    this._balance = 0;
  }

  // TODO needs type checking, should be integer
  //      best if it happens at compile time?
  deposit(amount) {
    this._balance += amount;
  }

  withdraw(amount) {
    this._balance -= amount;
  }

  balance() {
    return this._balance;
  }
}
