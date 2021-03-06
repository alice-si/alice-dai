# Alice + Dai

This project aims to integrate the Alice donation platform (<https://alice.si>) with the Dai stablecoin (https://makerdao.com/dai), for an event at Devcon4. This is the first step of a deeper integration of Dai within the Alice protocol.

### Overview

The core mechanism for integration is implemented as a "Donation Pot" smart contract that collects donations, registers validated charity projects and allows donors to send the tokens to one of the vetted charity projects. It also enables tracking of the donated funds and provides a safety mechanism for the redistribution of forgotten or unregistered donations.

The two-phase donation process assures that donors can first send a donation without any friction, i.e. they can bypass the usual Alice sign-up process so that Dai donations can be collected immediately by the smart contract in a general "donation pot". Later on, at a convenient time, donors will be able to create an account on the Alice platform to select a target charity project and track its impact. It will also assure that no donation is wasted as the funds deposited by unregistered donors will be automatically distributed randomly to charity projects on Alice after 100 days.

### Running tests

Install all of the necessary dependencies first:

    yarn install

Then you can run a set of tests written with mocha based on the truffle framework:

    yarn test

## Contributions

All comments and ideas for improvements and pull requests are welcome. We want to improve the project based on feedback from the community.

## License

MIT License

Copyright (c) 2017 Alice Ltd. (Jakub Wojciechowski jakub@alice.si)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
