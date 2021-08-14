const { expect, use } = require('Chai');
const { solidity } = require('ethereum-waffle');

use(solidity); 

describe('Factory Contract', () => {
  let PayrollContractFactory;
  let payrollContractFactory;
  let admin, employerA, employerB;

  beforeEach(async () => {
    [admin, employerA, employerB] = await ethers.getSigners();
    PayrollContractFactory = await ethers.getContractFactory('PayrollContractFactory');
    payrollContractFactory = await PayrollContractFactory.deploy();
  });

  describe('Deployment', () => {
    it('Should assign contract creater as admin', async () => {
      const _admin = await payrollContractFactory.admin();
      expect(admin.address).to.equal(_admin);
    });
  });

  describe('Create new contract by employerA', () => {
    it('Should create 1 contract', async () => {
      await payrollContractFactory.connect(employerA).createPayrollContract();
      const contractArray = await payrollContractFactory.connect(employerA).getAllPayrollContracts();
      expect(contractArray.length).to.equal(1);
    });
  });

  describe('Create 2 new contracts by employerB', () => {
    it('Should create 2 contract', async () => {
      await payrollContractFactory.connect(employerB).createPayrollContract();
      await payrollContractFactory.connect(employerB).createPayrollContract();
      const contractArray = await payrollContractFactory.connect(employerB).getAllPayrollContracts();
      expect(contractArray.length).to.equal(2);

      const contract2 = await payrollContractFactory.connect(employerB).getPayrollContract(0);
      expect(contractArray[0]).to.equal(contract2);

      await employerB.sendTransaction({
        to: contract2,
        value: ethers.utils.parseEther('30.0'), // Sends 30 eth
      });

      await payrollContractFactory.connect(employerB).setContractInUse(0);
      let balance = await payrollContractFactory.connect(employerB).getAvailableBalance2();
      balance = ethers.utils.formatEther(balance);
      expect(balance).to.equal('30.0');
    });
  });
});