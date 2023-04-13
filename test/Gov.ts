import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

describe("Gov", function () {

  async function deployContracts() {
    
    let [deployer, alice, bob, francis] = await ethers.getSigners()

    let amount:number = 10
    let signers:any = [alice.address, bob.address, francis.address]
    const randomSigners = async (amount:number) => {
      for (let i = 0; i < amount; i++) {
        const x = ethers.Wallet.createRandom()
        const y = new ethers.Wallet(x, ethers.provider)
        signers.push(y.address)
      }
      return signers
    }
    await randomSigners(amount)

    const Original = await ethers.getContractFactory("ERC721Mock")
    const original = await Original.deploy()

    const uri = "ipfs://bafkreih2ac5yabo2daerkw5w5wcwdc7rveqejf4l645hx2px26r5fxfnpe"
    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy(original.address, "Mirror", "MIRROR", uri)

    const manifesto = "bafybeihprzyvilohv6zwyqiel7wt3dncpjqdsc6q7xfj3iuraoc7n552ya"
    const name = "Gov"
    const votingDelay = 1
    const votingPeriod = 300
    const votingThreshold = 1
    const quorum = 20
    const Gov = await ethers.getContractFactory("Gov")
    const gov = await Gov.deploy(
      nft.address, 
      manifesto, 
      name, 
      votingDelay, 
      votingPeriod, 
      votingThreshold, 
      quorum
    )

    return { original, gov, nft, deployer, alice, bob, francis, signers, amount, quorum }
  }

  describe("Deployment", function () {

    it("Should set the right original NFT address", async function () {
      const { original, nft } = await loadFixture(deployContracts)
      expect(await nft.original()).to.equal(original.address)
    })

    it("Should set the right token address", async function () {
      const { gov, nft } = await loadFixture(deployContracts)
      expect(await gov.token()).to.equal(nft.address)
    })

    it("Should set the right manifesto cid", async function () {
      const { gov } = await loadFixture(deployContracts)
      expect(await gov.manifesto()).to.equal("bafybeihprzyvilohv6zwyqiel7wt3dncpjqdsc6q7xfj3iuraoc7n552ya")
    })
  });

  describe("Interactions", function () {
    it("Should claim his membership NFT", async function () {
      const { nft, deployer } = await loadFixture(deployContracts)
      await nft.claim(deployer.address, 1)
      expect(await nft.ownerOf(1)).to.equal(deployer.address)
    })
    
    it('Should not be able to claim', async function () {
      const { bob, nft, deployer } = await loadFixture(deployContracts)
      await expect(nft.connect(bob).claim(deployer.address, 1)).to.be.revertedWith("Caller does not own one of the original NFTs")
    })

    it("Should be already claimed", async function () {
      const { nft, deployer } = await loadFixture(deployContracts)
      await nft.claim(deployer.address, 1)
      await expect(nft.claim(deployer.address, 1)).to.be.revertedWith("Token ID already claimed")
    })

  })
})
