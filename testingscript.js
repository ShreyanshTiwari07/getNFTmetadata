const { Web3 } = require("web3");
const axios = require("axios");
const { get } = require("mongoose");
const ethereumNodeUrl = "https://dofktr:dofktr2023@fktrnode1.nfthing.com/";
const web3 = new Web3(new Web3.providers.HttpProvider(ethereumNodeUrl));
async function getNFTMetadataERC20(contractAddress, tokenId) {
  const contractABI = [
    {
      inputs: [],
      name: "baseURI",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
  ];
  const contract = new web3.eth.Contract(contractABI, contractAddress);
  const tokenURIRaw = await contract.methods.baseURI().call();
  console.log(tokenURIRaw);
  let response;
  const arweaveGatewayURL = "https://arweave.net/";
  const arweaveHash = tokenURIRaw.replace("ar://", "");
  const arweaveURL = `${arweaveGatewayURL}${arweaveHash}${tokenId}`;
  console.log(arweaveURL);
  //response = await axios.get(arweaveURL);
  // console.log(response.data);
}

getNFTMetadataERC20("0xC54C6c76E7c68dE2546e0f4D4115b91AfB9a2bc9", 1971);
