// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import 'hardhat/console.sol';

contract PayrollContractTemplate {
  address public employer;
  uint internal availableBalance;

  struct Employee {
    uint salary;
    uint payday;
  }

  mapping(address => Employee) employees;

  constructor (address _creater) {
    employer = _creater;
    availableBalance = 0;
  }

  modifier onlyEmployer() {
    require(msg.sender == employer, 'You are not the employer');
    _;
  }

  receive() external payable {
    availableBalance += msg.value;
  }

  function paySalary(address _employee, uint _amount, uint _duration) public onlyEmployer {
    require(availableBalance >= _amount, 'Not enough balance left');
    availableBalance -= _amount;
    employees[_employee].salary = _amount;
    employees[_employee].payday = block.timestamp + _duration;
  }

  function checkSalary() public view returns (uint) {
    return employees[msg.sender].salary;
  }

  function checkPayday() public view returns (uint) {
    return employees[msg.sender].payday;
  }

  function getContractBalance() public view onlyEmployer returns (uint) {
    return address(this).balance;
  }

  // function getAvailableBalance() public view onlyEmployer returns (uint) {
  //   return availableBalance;
  // }

  function getAvailableBalance() public view returns (uint) {
    return availableBalance;
  }

  function employeeWithdraw() public payable {
    address payable withdrawer = payable(msg.sender);
    require(block.timestamp >= employees[withdrawer].payday, 'Not payday yet');

    uint withdrawAmount = employees[withdrawer].salary;
    employees[withdrawer].salary = 0;
    withdrawer.transfer(withdrawAmount);
  }
}