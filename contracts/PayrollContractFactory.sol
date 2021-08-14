// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import 'hardhat/console.sol';
import './PayrollContractTemplate.sol';

contract PayrollContractFactory {
  address public admin;
  mapping(address => PayrollContractTemplate[]) payrollContracts;
  PayrollContractTemplate contractInUse;

  constructor() {
    admin = msg.sender;
  }

  function createPayrollContract() public {
    PayrollContractTemplate newContract = new PayrollContractTemplate(msg.sender);
    payrollContracts[msg.sender].push(newContract);
  }

  function getAllPayrollContracts() public view returns (PayrollContractTemplate[] memory) {
    return payrollContracts[msg.sender];
  }

  function getPayrollContract(uint _index) public view returns (PayrollContractTemplate) {
    return payrollContracts[msg.sender][_index];
  }

  function setContractInUse(uint _index) public {
    contractInUse = getPayrollContract(_index);
  }

  function getAvailableBalance2() public view returns (uint) {
    return PayrollContractTemplate(contractInUse).getAvailableBalance();
  }
}