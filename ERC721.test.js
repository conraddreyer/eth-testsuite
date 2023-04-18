const { expect } = require("chai");
const { utils } = require("web3");

const MyContract = artifacts.require("MyContract");

contract("MyContract", (accounts) => {
  const [alice, bob, charlie] = accounts;
  beforeEach(async () => {
    this.contract = await MyContract.new({ from: alice });
  });

  // Minting

  describe("Minting", () => {
    it("should mint a token", async () => {
      const tokenId = 0;
      await this.contract.mint(alice, tokenId, { from: alice });
      const tokenalice = await this.contract.ownerOf(tokenId);
      expect(tokenalice).to.equal(alice);
    });

    it("should safely mint a token", async () => {
      const tokenId = 0;
      await this.contract.safeMint(alice, tokenId, { from: alice });
      const tokenalice = await this.contract.ownerOf(tokenId);
      expect(tokenalice).to.equal(alice);
    });
  });

  // Metadata

  describe("Metadata", () => {
    it("Should show the balance of an account", async () => {
      const tokenId = 0;
      const tokenId2 = 1;
      await this.contract.mint(alice, tokenId, { from: alice });
      await this.contract.mint(alice, tokenId2, { from: alice });
      const balance = await this.contract.balanceOf(alice);
      expect(balance.toString()).to.equal("2");
    });

    it("should show the Name of the contract", async () => {
      const name = await this.contract.name();
      expect(name).to.equal("MyContract");
    });

    it("should show the symbol of the contract", async () => {
      const symbol = await this.contract.symbol();
      expect(symbol).to.equal("MC");
    });

    it("should show the URI of a token", async () => {
      //No tokenURI set, should be empty
      const tokenId = 0;
      await this.contract.mint(alice, tokenId, { from: alice });
      const tokenURI = await this.contract.tokenURI(tokenId);
      expect(tokenURI).to.equal("");
    });
  });

  // Approvals

  describe("Approvals", () => {
    it("should approve an address to transfer a token", async () => {
      const tokenId = 0;
      await this.contract.mint(alice, tokenId, { from: alice });
      await this.contract.approve(bob, tokenId, { from: alice });
      const approvedAddress = await this.contract.getApproved(tokenId);
      expect(approvedAddress).to.equal(bob);
    });

    it("should set an operator to be able to transfer all tokens", async () => {
      await this.contract.setApprovalForAll(bob, true, { from: alice });
      const isApproved = await this.contract.isApprovedForAll(alice, bob);
      expect(isApproved).to.equal(true);
    });

    it("should be able to unapprove operator", async () => {
      await this.contract.setApprovalForAll(bob, true, { from: alice });
      await this.contract.setApprovalForAll(bob, false, { from: alice });
      const isApproved = await this.contract.isApprovedForAll(alice, bob);
      expect(isApproved).to.equal(false);
    });

    // Approval Errors

    describe("Approval Errors", () => {
      it("should throw an error if somebody other than the owner tries to approve a token", async () => {
        const tokenId = 0;
        await this.contract.mint(alice, tokenId, { from: alice });
        try {
          await this.contract.approve(bob, tokenId, { from: charlie });
        } catch (error) {
          expect(error.message).to.include(
            "approve caller is not token owner or approved for all"
          );
        }
      });

      it("should throw an error if the token to be approved does not exist", async () => {
        const tokenId = 0;
        const tokenId1 = 1;
        await this.contract.mint(alice, tokenId, { from: alice });
        try {
          await this.contract.approve(bob, tokenId1, { from: alice });
        } catch (error) {
          expect(error.message).to.include("invalid token ID");
        }
      });
    });
  });

  // Transfers

  describe("Transfers", () => {
    it("should transfer a token", async () => {
      const tokenId = 0;
      await this.contract.mint(alice, tokenId, { from: alice });
      await this.contract.transferFrom(alice, bob, tokenId, {
        from: alice,
      });
      const newalice = await this.contract.ownerOf(tokenId);
      expect(newalice).to.equal(bob);
    });

    it("should transfer a token from an approved address", async () => {
      const tokenId = 0;
      await this.contract.mint(alice, tokenId, { from: alice });
      await this.contract.approve(bob, tokenId, { from: alice });
      await this.contract.transferFrom(alice, charlie, tokenId, { from: bob });
      const newOwner = await this.contract.ownerOf(tokenId);
      expect(newOwner).to.equal(charlie);
    });

    it("should transfer all tokens by an approved operator", async () => {
      const tokenId = 0;
      const tokenId1 = 1;
      await this.contract.mint(alice, tokenId, { from: alice });
      await this.contract.mint(alice, tokenId1, { from: alice });
      await this.contract.setApprovalForAll(bob, true, { from: alice });
      await this.contract.transferFrom(alice, charlie, tokenId, { from: bob });
      await this.contract.transferFrom(alice, charlie, tokenId1, { from: bob });
      const newOwner = await this.contract.ownerOf(tokenId);
      const newOwner1 = await this.contract.ownerOf(tokenId1);
      expect(newOwner).to.equal(charlie);
      expect(newOwner1).to.equal(charlie);
    });
  });
  describe("Safe Transfers", () => {
    it("should safely transfer a token", async () => {
      const tokenId = 0;
      await this.contract.mint(alice, tokenId, { from: alice });
      await this.contract.safeTransferFrom(alice, bob, tokenId, {
        from: alice,
      });
      const newalice = await this.contract.ownerOf(tokenId);
      expect(newalice).to.equal(bob);
    });

    it("should safely transfer a token from an approved address", async () => {
      const tokenId = 0;
      await this.contract.mint(alice, tokenId, { from: alice });
      await this.contract.approve(bob, tokenId, { from: alice });
      await this.contract.safeTransferFrom(alice, charlie, tokenId, {
        from: bob,
      });
      const newOwner = await this.contract.ownerOf(tokenId);
      expect(newOwner).to.equal(charlie);
    });

    it("should safely transfer all tokens by an approved operator", async () => {
      const tokenId = 0;
      const tokenId1 = 1;
      await this.contract.mint(alice, tokenId, { from: alice });
      await this.contract.mint(alice, tokenId1, { from: alice });
      await this.contract.setApprovalForAll(bob, true, { from: alice });
      await this.contract.safeTransferFrom(alice, charlie, tokenId, {
        from: bob,
      });
      await this.contract.safeTransferFrom(alice, charlie, tokenId1, {
        from: bob,
      });
      const newOwner = await this.contract.ownerOf(tokenId);
      const newOwner1 = await this.contract.ownerOf(tokenId1);
      expect(newOwner).to.equal(charlie);
      expect(newOwner1).to.equal(charlie);
    });
  });

  // Transfer Errors

  describe("Transfer Errors", () => {
    it("should throw an error if somebody other than the owner or approved tries to transfer a token", async () => {
      const tokenId = 0;
      await this.contract.mint(alice, tokenId, { from: alice });
      try {
        await this.contract.transferFrom(alice, bob, tokenId, {
          from: charlie,
        });
      } catch (error) {
        expect(error.message).to.include(
          "caller is not token owner or approved"
        );
      }
    });

    it("should throw an error if the token to be transferred does not exist", async () => {
      const tokenId = 0;
      const tokenId1 = 1;
      await this.contract.mint(alice, tokenId, { from: alice });
      try {
        await this.contract.transferFrom(alice, bob, tokenId1, {
          from: alice,
        });
        const newalice = await this.contract.ownerOf(tokenId);
        expect(newalice).to.equal(bob);
      } catch (error) {
        expect(error.message).to.include("invalid token ID");
      }
    });

    it("should throw an error if an approved operator gets disapproved and tries to transfer tokens", async () => {
      const tokenId = 0;
      const tokenId1 = 1;
      await this.contract.mint(alice, tokenId, { from: alice });
      await this.contract.mint(alice, tokenId1, { from: alice });
      await this.contract.setApprovalForAll(bob, true, { from: alice });
      await this.contract.transferFrom(alice, charlie, tokenId, {
        from: bob,
      });
      await this.contract.setApprovalForAll(bob, false, { from: alice });
      try {
        await this.contract.transferFrom(alice, charlie, tokenId1, {
          from: bob,
        });
      } catch (error) {
        expect(error.message).to.include(
          "caller is not token owner or approved"
        );
      }
    });
  });

  // Safe Transfer Errors

  describe("Safe Transfer Errors", () => {
    it("should throw an error if somebody other than the owner or approved tries to transfer a token", async () => {
      const tokenId = 0;
      await this.contract.mint(alice, tokenId, { from: alice });
      try {
        await this.contract.safeTransferFrom(alice, bob, tokenId, {
          from: charlie,
        });
      } catch (error) {
        expect(error.message).to.include(
          "caller is not token owner or approved"
        );
      }
    });

    it("should throw an error if the token to be transferred does not exist", async () => {
      const tokenId = 0;
      const tokenId1 = 1;
      await this.contract.mint(alice, tokenId, { from: alice });
      try {
        await this.contract.safeTransferFrom(alice, bob, tokenId1, {
          from: alice,
        });
        const newalice = await this.contract.ownerOf(tokenId);
        expect(newalice).to.equal(bob);
      } catch (error) {
        expect(error.message).to.include("invalid token ID");
      }
    });

    it("should throw an error if an approved operator gets disapproved and tries to transfer tokens", async () => {
      const tokenId = 0;
      const tokenId1 = 1;
      await this.contract.mint(alice, tokenId, { from: alice });
      await this.contract.mint(alice, tokenId1, { from: alice });
      await this.contract.setApprovalForAll(bob, true, { from: alice });
      await this.contract.safeTransferFrom(alice, charlie, tokenId, {
        from: bob,
      });
      await this.contract.setApprovalForAll(bob, false, { from: alice });
      try {
        await this.contract.safeTransferFrom(alice, charlie, tokenId1, {
          from: bob,
        });
      } catch (error) {
        expect(error.message).to.include(
          "caller is not token owner or approved"
        );
      }
    });
    it("should return true for supported interfaces", async () => {
      // Interface IDs für ERC721 und ERC165
      const erc721InterfaceId = "0x80ac58cd";
      const erc165InterfaceId = "0x01ffc9a7";

      const erc721Supported = await this.contract.supportsInterface(
        erc721InterfaceId
      );
      const erc165Supported = await this.contract.supportsInterface(
        erc165InterfaceId
      );

      expect(erc721Supported).to.equal(true);
      expect(erc165Supported).to.equal(true);
    });
    it("should return false for unsupported interfaces", async () => {
      // Eine willkürliche Interface-ID, die nicht unterstützt wird
      const unsupportedInterfaceId = "0xffffffff";

      const unsupported = await this.contract.supportsInterface(
        unsupportedInterfaceId
      );
      expect(unsupported).to.equal(false);
    });
  });
});
