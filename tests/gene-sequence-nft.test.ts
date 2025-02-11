import { describe, it, expect, beforeEach } from "vitest";
import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity";

class GeneSequenceNFTContract {
  private static contractName = "gene-sequence-nft";
  private client: Client;
  
  constructor(provider: Provider) {
    this.client = new Client(GeneSequenceNFTContract.contractName, provider);
  }
  
  async mintGeneSequence(sequence: string, metadata: string, sender: string): Promise<Result> {
    const tx = this.client.createTransaction({
      method: { name: "mint-gene-sequence", args: [`"${sequence}"`, `"${metadata}"`] }
    });
    await tx.sign(sender);
    return await this.client.submitTransaction(tx);
  }
  
  async transferGeneSequence(tokenId: number, recipient: string, sender: string): Promise<Result> {
    const tx = this.client.createTransaction({
      method: { name: "transfer-gene-sequence", args: [`u${tokenId}`, `'${recipient}`] }
    });
    await tx.sign(sender);
    return await this.client.submitTransaction(tx);
  }
  
  async getGeneSequence(tokenId: number): Promise<Result> {
    return await this.client.callReadOnlyFunction({
      method: { name: "get-gene-sequence", args: [`u${tokenId}`] }
    });
  }
  
  async getOwner(tokenId: number): Promise<Result> {
    return await this.client.callReadOnlyFunction({
      method: { name: "get-owner", args: [`u${tokenId}`] }
    });
  }
  
  async getLastTokenId(): Promise<Result> {
    return await this.client.callReadOnlyFunction({
      method: { name: "get-last-token-id", args: [] }
    });
  }
}

describe("gene-sequence-nft contract test suite", () => {
  let provider: Provider;
  let geneSequenceNFTContract: GeneSequenceNFTContract;
  
  beforeEach(async () => {
    provider = await ProviderRegistry.createProvider();
    geneSequenceNFTContract = new GeneSequenceNFTContract(provider);
    await geneSequenceNFTContract.client.deployContract();
  });
  
  it("should mint a new gene sequence NFT", async () => {
    const sequence = "ATCG";
    const metadata = "Test Gene Sequence";
    const result = await geneSequenceNFTContract.mintGeneSequence(sequence, metadata, "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM");
    expect(result.success).toBe(true);
    const tokenId = parseInt(result.value);
    expect(tokenId).toBe(1);
  });
  
  it("should transfer a gene sequence NFT", async () => {
    const sequence = "ATCG";
    const metadata = "Test Gene Sequence";
    const mintResult = await geneSequenceNFTContract.mintGeneSequence(sequence, metadata, "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM");
    const tokenId = parseInt(mintResult.value);
    
    const transferResult = await geneSequenceNFTContract.transferGeneSequence(tokenId, "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM");
    expect(transferResult.success).toBe(true);
    
    const newOwner = await geneSequenceNFTContract.getOwner(tokenId);
    expect(newOwner.value).toBe("ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG");
  });
  
  it("should get gene sequence details", async () => {
    const sequence = "ATCG";
    const metadata = "Test Gene Sequence";
    const mintResult = await geneSequenceNFTContract.mintGeneSequence(sequence, metadata, "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM");
    const tokenId = parseInt(mintResult.value);
    
    const geneSequence = await geneSequenceNFTContract.getGeneSequence(tokenId);
    expect(geneSequence.value).toEqual({
      owner: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      sequence: "ATCG",
      metadata: "Test Gene Sequence"
    });
  });
  
  it("should get the last token ID", async () => {
    const sequence1 = "ATCG";
    const metadata1 = "Test Gene Sequence 1";
    await geneSequenceNFTContract.mintGeneSequence(sequence1, metadata1, "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM");
    
    const sequence2 = "GCTA";
    const metadata2 = "Test Gene Sequence 2";
    await geneSequenceNFTContract.mintGeneSequence(sequence2, metadata2, "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM");
    
    const lastTokenId = await geneSequenceNFTContract.getLastTokenId();
    expect(parseInt(lastTokenId.value)).toBe(2);
  });
});
