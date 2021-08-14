const { expect, use } = require('Chai');
const { solidity } = require('ethereum-waffle');

use(solidity); 

describe('Template Contract', () => {
  let PayrollContractTemplate;
  let payrollContractTemplate;
  let employer, employee1, employee2;

  beforeEach(async () => {
    [employer, employee1, employee2] = await ethers.getSigners();
    PayrollContractTemplate = await ethers.getContractFactory('PayrollContractTemplate');
    payrollContractTemplate = await PayrollContractTemplate.deploy(employer.address);
  });

  describe('Deployment', () => {
    it('Should assign contract creater as employer', async () => {
      const _employer = await payrollContractTemplate.employer();
      expect(employer.address).to.equal(_employer);
    });
  });

  describe('Pay salary', () => {
    beforeEach(async () => {
      await employer.sendTransaction({
        to: payrollContractTemplate.address,
        value: ethers.utils.parseEther('30.0'), // Sends 30 eth
      });
    });

    describe('Employer deposits fund - 30 eth', () => {
      it('Should credit contract balance to 30 eth', async () => {
        let contractBalance = await payrollContractTemplate.getContractBalance();
        contractBalance = ethers.utils.formatEther(contractBalance);
  
        expect(contractBalance).to.equal('30.0');
      });

      it('Should credit available balance to 30 eth', async () => {
        let availableBalance = await payrollContractTemplate.getAvailableBalance();
        availableBalance = ethers.utils.formatEther(availableBalance);
  
        expect(availableBalance).to.equal('30.0');
      });
    });

    describe('Employer pays salary to employee1, 20 eth, duration 0ms', () => {
      beforeEach(async () => {
        const _amount = ethers.utils.parseEther('20.0'); // Pay 20 eth
        const _duration = 0; // employee1 can withdraw immediately
        await payrollContractTemplate.paySalary(employee1.address, _amount, _duration);
      });
      
      it('Should credit 20 eth to employee1', async () => {
        let employee1Salary = await payrollContractTemplate.connect(employee1).checkSalary();
        employee1Salary = ethers.utils.formatEther(employee1Salary);

        expect(employee1Salary).to.equal('20.0');
      });

      it('Should debit available balance by 20 eth', async () => {
        let availableBalance = await payrollContractTemplate.getAvailableBalance();
        availableBalance = ethers.utils.formatEther(availableBalance);
  
        expect(availableBalance).to.equal('10.0');
      });

      describe('Employee1 withdraw salary', () => {
        it('Should change balance of salary account of employee1 to 0', async () => {
          await payrollContractTemplate.connect(employee1).employeeWithdraw();
          let employee1Salary = await payrollContractTemplate.connect(employee1).checkSalary();
          employee1Salary = ethers.utils.formatEther(employee1Salary);

        expect(employee1Salary).to.equal('0.0');
        });
      });
    });

    describe('Employer pays salary to employee1, 20 eth, duration 10000ms', () => {
      beforeEach(async () => {
        const _amount = ethers.utils.parseEther('20.0'); // Pay 20 eth
        const _duration = 10000; // 10 sec
        await payrollContractTemplate.paySalary(employee1.address, _amount, _duration);
      });

      describe('Employee1 withdraw salary immediately', () => {
        it('Should fail due to not payday yet', async () => {
          await expect(
            payrollContractTemplate.connect(employee1).employeeWithdraw()
          ).to.be.revertedWith('Not payday yet');
        });
      });
    });
  });
});