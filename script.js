'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data

const account1 = {
  owner: 'Netanel Kozel',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z'
  ],
  currency: 'ILS',
  locale: 'he-IL' // de-DE
};

const account2 = {
  owner: 'Sam Winchester',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z'
  ],
  currency: 'USD',
  locale: 'en-US'
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

let currentAccount, timer;
let sorted = false;


const dateFormat = (date, locale) => {

  const daysPassed = Math.round(Math.abs(date - new Date()) / (1000 * 60 * 60 * 24));

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const createUsernames = accounts => accounts.forEach(acc => acc.username = acc.owner.split(' ').map(word => word[0]).join('').toLowerCase());
createUsernames(accounts);

const startLogOutTimer = () => {

  let time = 600;
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textCont = 'Log in to get started';
      containerApp.style.opacity = '0';
    }
    time--;
  };
  tick();
  timer = setInterval(tick, 1000);
};

const displayWelcomeMessage = function (name) {
  const now = new Date();
  const greetings = new Map([
    [[6, 7, 8, 9, 10], 'Good Morning'],
    [[11, 12, 13, 14], 'Good Day'],
    [[15, 16, 17, 18], 'Good Afternoon'],
    [[19, 20, 21, 22], 'Good Evening'],
    [[23, 0, 1, 2, 3, 4, 5], 'Good Night'],
  ]);

  const arr = [...greetings.keys()].find(key => key.includes(now.getHours()));
  const greet = greetings.get(arr);
  labelWelcome.textContent = `${greet}, ${name}!`;
};


const displayMovements = function(account) {
  containerMovements.innerHTML = '';
  const movements = sorted ? account.movements.slice().sort((a, b) => a - b) : account.movements;

  const options = {
    style: 'currency',
    currency: account.currency
  };

  movements.forEach(function(movement, index) {
    const type = movement > 0 ? 'deposit' : 'withdrawal';
    const displayDate = dateFormat(new Date(account.movementsDates[index]), account.locale);

    const html = `
            <div class='movements__row'>
          <div class='movements__type movements__type--${type}'>${index + 1} ${type}</div>
          <div class='movements__date'>${displayDate}</div>
          <div class='movements__value'>${new Intl.NumberFormat(account.locale, options).format(+movement)}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayCalcSummary = function(account) {
  account.balance = account.movements.reduce((x, y) => x + y, 0);
  labelBalance.textContent = displayCurrencyInternationally(account.balance.toFixed(2));
  labelSumIn.textContent = displayCurrencyInternationally(account.movements.filter(x => x > 0).reduce((x, y) => x + y, 0).toFixed(2));
  labelSumOut.textContent = displayCurrencyInternationally(+Math.abs(account.movements.filter(x => x < 0).reduce((x, y) => x + y, 0)).toFixed(2));
  labelSumInterest.textContent = displayCurrencyInternationally(account.movements.filter(x => x > 0).map(x => x * account.interestRate / 100).filter(x => x >= 1).reduce((x, y) => x + y, 0).toFixed(2));
};

const displayLabelDate = () => labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, {
  hour: 'numeric',
  minute: 'numeric',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}).format(new Date());
const displayCurrencyInternationally = num => new Intl.NumberFormat(currentAccount.locale, {
  style: 'currency',
  currency: currentAccount.currency
}).format(+num);

const displayUserStats = function(account) {
  containerApp.style.opacity = '100';
  displayMovements(account);
  displayCalcSummary(account);
  displayWelcomeMessage(`${currentAccount.owner.split(' ')[0]}`);
  displayLabelDate();
};

btnLogin.addEventListener('click', function(e) {
  e.preventDefault();
  currentAccount = accounts.find(x => x.username === inputLoginUsername.value && x.pin === +(inputLoginPin.value));
  inputLoginPin.value = inputLoginUsername.value = '';
  inputLoginPin.blur();
  if (timer)
    clearInterval(timer)
  startLogOutTimer();
  if (currentAccount)
    displayUserStats(currentAccount);

});

btnTransfer.addEventListener('click', function(e) {
  e.preventDefault();

  let amount = +(inputTransferAmount.value);
  let receiver = accounts.find(x => x.username === inputTransferTo.value);
  inputTransferAmount.value = '';
  inputTransferTo.value = '';

  if (receiver && receiver?.username !== currentAccount.username)
    if (amount > 0 && currentAccount.balance >= amount) {
      currentAccount.movements.push(amount * (-1));
      currentAccount.movementsDates.push(new Date().toISOString());
      displayUserStats(currentAccount);
      clearInterval(timer);
      startLogOutTimer();
      receiver.movements.push(amount);
      receiver.movementsDates.push(new Date().toISOString());
    }
});

btnLoan.addEventListener('click', function(e) {
  e.preventDefault();
  let amount = Math.floor(inputLoanAmount.value);
  inputLoanAmount.value = '';

  if (currentAccount.movements.some(x => x >= amount / 10) && amount > 0)
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      displayUserStats(currentAccount);}, 1500);
  clearInterval(timer);
  startLogOutTimer();

});

btnClose.addEventListener('click', function(e) {
  e.preventDefault();
  if (inputCloseUsername.value === currentAccount.username && +(inputClosePin.value) === currentAccount.pin) {
    containerApp.style.opacity = '0';
    accounts.splice(accounts.find(x => x.username === currentAccount.username), 1);
    //Object.keys(currentAccount).forEach(key => delete currentAccount[key]);
  }
  inputCloseUsername.value = '';
  inputClosePin.value = '';

});

btnSort.addEventListener('click', function(e) {
    e.preventDefault();
    sorted = !sorted;
    displayMovements(currentAccount);
  }
);