const employee = require('./employee')
const products = require('./products')
const pricing = require('../pricing')

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const { beforeEach, afterEach, describe, it } = require('mocha')

const { expect } = chai
chai.use(sinonChai)

describe('Pricing', () => {
  let sandbox,
    formatPriceSpy,
    getEmployerContributionSpy,
    calculateVolLifePricePerRoleSpy,
    calculateVolLifePriceSpy,
    calculateLTDPriceSpy


  beforeEach(() => {
    sandbox = sinon.createSandbox()

    formatPriceSpy = sandbox.spy(pricing, 'formatPrice')
    getEmployerContributionSpy = sandbox.spy(pricing, 'getEmployerContribution')
    calculateVolLifePricePerRoleSpy = sandbox.spy(pricing, 'calculateVolLifePricePerRole')
    calculateVolLifePriceSpy = sandbox.spy(pricing, 'calculateVolLifePrice')
    calculateLTDPriceSpy = sandbox.spy(pricing, 'calculateLTDPrice')
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('calculateLTDPrice', () => {
    it('returns price for LTD plan for a single employee without employer contribution', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee'],
        coverageLevel: [
          { role: 'ee', coverage: 125000 }
        ],
      }
      const price = pricing.calculateLTDPrice(products.longTermDisability, employee, selectedOptions)

      expect(price).to.equal(32.04)
    })

  })

  describe('calculateVolLifePrice', () => {
    it('returns the price for a plan for single employee', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee'],
        coverageLevel: [
          { role: 'ee', coverage: 125000 }
        ],
      }
      const price = pricing.calculateVolLifePrice(products.voluntaryLife, selectedOptions)

      expect(price).to.equal(43.75)

      expect(calculateVolLifePricePerRoleSpy).to.have.callCount(1)
    })

    it('returns the price for a plan for an employee with a spouse', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee', 'sp'],
        coverageLevel: [
          { role: 'ee', coverage: 200000 },
          { role: 'sp', coverage: 75000 },
        ],
      }
      const price = pricing.calculateVolLifePrice(products.voluntaryLife, selectedOptions)

      expect(price).to.equal(79)

      expect(calculateVolLifePricePerRoleSpy).to.have.callCount(2)
    })
  })

  describe('calculateVolLifePricePerRole', () => {
    it('returns the price for a single employee', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee'],
        coverageLevel: [
          { role: 'ee', coverage: 125000 }
        ],
      }
      const price = pricing.calculateVolLifePricePerRole(selectedOptions.coverageLevel[0].role, selectedOptions.coverageLevel, products.voluntaryLife.costs)

      expect(price).to.equal(43.75)
    })

    it('returns the price for a spouse', () => {
      const selectedOptions = {
        familyMembersToCover: ['sp'],
        coverageLevel: [
          { role: 'sp', coverage: 85000 }
        ],
      }
      const price = pricing.calculateVolLifePricePerRole(selectedOptions.coverageLevel[0].role, selectedOptions.coverageLevel, products.voluntaryLife.costs)

      expect(price).to.equal(10.2)
    })
  })

  describe('getEmployerContribution', () => {
    it('returns the reduced price based on a percentage', () => {
      const dollarsOff = pricing.getEmployerContribution(products.voluntaryLife.employerContribution, 39.37)

      expect(dollarsOff).to.equal(3.937)
    })

    it('returns the price based on dollars mode', () => {
      const dollarsOff = pricing.getEmployerContribution(products.commuter.employerContribution, 39.37)

      expect(dollarsOff).to.equal(75)
    })
  })

  describe('formatPrice', () => {
    it('returns the price with two decimals not rounded', () => {
      const formattedPrice = pricing.formatPrice(22.112284)

      expect(formattedPrice).to.equal(22.11)
    })

  })

  describe('calculateProductPrice', () => {
    it('returns the price for a voluntary life product for a single employee', () => {

      const selectedOptions = {
        familyMembersToCover: ['ee'],
        coverageLevel: [{ role: 'ee', coverage: 125000 }],
      }
      const price = pricing.calculateProductPrice(products.voluntaryLife, employee, selectedOptions)

      expect(price).to.equal(39.37)

      expect(formatPriceSpy).to.have.callCount(1)
      expect(getEmployerContributionSpy).to.have.callCount(1)
      expect(calculateVolLifePriceSpy).to.have.callCount(1)
    })

    it('returns the price for a VolLife product for an employee with a spouse', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee', 'sp'],
        coverageLevel: [
          { role: 'ee', coverage: 200000 },
          { role: 'sp', coverage: 75000 },
        ],
      }
      const price = pricing.calculateProductPrice(products.voluntaryLife, employee, selectedOptions)

      expect(price).to.equal(71.09)

      expect(formatPriceSpy).to.have.callCount(1)
      expect(getEmployerContributionSpy).to.have.callCount(1)
      expect(calculateVolLifePriceSpy).to.have.callCount(1)
    })

    it('returns the price for a disability product for an employee', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee']
      }
      const price = pricing.calculateProductPrice(products.longTermDisability, employee, selectedOptions)

      expect(price).to.equal(22.04)

      expect(formatPriceSpy).to.have.callCount(1)
      expect(getEmployerContributionSpy).to.have.callCount(1)
      expect(calculateLTDPriceSpy).to.have.callCount(1)
    })

    it('throws an error on unknown product type', () => {
      const unknownProduct = { type: 'vision' }

      expect(() => pricing.calculateProductPrice(unknownProduct, {}, {})).to.throw('Unknown product type: vision')
    })
  })

  describe('calculateCommuterPrice', () => {
    it('returns the price for a train commuter', () => {
      const selectedOptions = {
        benefit: 'train'
      }

      const price = pricing.calculateCommuterPrice(products.commuter, selectedOptions)

      expect(price).to.equal(84.75)
    })
    it('returns the price for a parking commuter', () => {
      const selectedOptions = {
        benefit: 'parking'
      }

      const price = pricing.calculateCommuterPrice(products.commuter, selectedOptions)

      expect(price).to.equal(250)
    })
  })
})