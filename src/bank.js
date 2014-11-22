define(function() {

    function Bank(s) {
        var balance = 0;

        s.deposit = function(amount) {
            balance += amount;
        };

        s.withdraw = function(amount) {
            balance -= amount;
        };

        s.balance = function() {
            return balance;
        };
    }

    return Bank;
});
// TODO load player coins from game save service
// TODO basic validation/balance checking
