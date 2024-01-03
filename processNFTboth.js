const { connectToMongoDB } = require("./db");

const { Web3 } = require("web3");
const axios = require("axios");
const { musicMetadata } = require("./model");

const transactionsCollectionName = "transactions";
const musicMetadataCollectionName = "musicMetadata";

async function processTransactions() {
  try {
    let count = 0;
    const db = await connectToMongoDB();

    const transactionsCollection = db.collection(transactionsCollectionName);
    const musicMetadataCollection = db.collection(musicMetadataCollectionName);

    const ethereumNodeUrl = "https://dofktr:dofktr2023@fktrnode1.nfthing.com/";
    const web3 = new Web3(new Web3.providers.HttpProvider(ethereumNodeUrl));

    async function getNFTMetadataERC721(contractAddress, tokenId) {
      try {
        const contractABI = [
          {
            inputs: [
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
            ],
            name: "tokenURI",
            outputs: [
              {
                internalType: "string",
                name: "",
                type: "string",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ];

        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const tokenURIRaw = await contract.methods.tokenURI(tokenId).call();
        console.log(tokenURIRaw);
        let response;
        if (tokenURIRaw.startsWith("ipfs://")) {
          const ipfsGatewayURL = "https://ipfs.io/ipfs/";
          const ipfsHash = tokenURIRaw.replace("ipfs://", "");
          const ipfsURL = `${ipfsGatewayURL}${ipfsHash}`;
          console.log(ipfsURL);
          response = await axios.get(ipfsURL);
        } else if (tokenURIRaw.startsWith("ar://")) {
          const arweaveGatewayURL = "https://arweave.net/";
          const arweaveHash = tokenURIRaw.replace("ar://", "");
          const arweaveURL = `${arweaveGatewayURL}${arweaveHash}`;
          console.log(arweaveURL);
          response = await axios.get(arweaveURL);
        } else {
          response = await axios.get(tokenURIRaw);
        }

        const metadata = response.data;
        // console.log(metadata);
        console.log("tokenURI:", tokenURIRaw);
        console.log("Artist:", metadata.artist);
        console.log("losslessAudio:", metadata.losslessAudio);
        console.log("duration:", metadata.duration);
        console.log("name:", metadata.name);
        const newMetadata = new musicMetadata({
          contract: contractAddress,
          tokenId: tokenId,
          name: metadata.name,
          tokenURI: tokenURIRaw,
          artist: metadata.artist,
          losslessAudio: metadata.losslessAudio,
          duration: metadata.duration,
        });
        console.log("newMetadata:", newMetadata);
        await musicMetadataCollection.insertOne(newMetadata);
      } catch (error) {
        console.error("Error retrieving NFT metadata:", error);
      }
    }
    async function getNFTMetadataERC1155(contractAddress, tokenId) {
      try {
        const contractABI = [
          {
            inputs: [
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
            ],
            name: "uri",
            outputs: [
              {
                internalType: "string",
                name: "",
                type: "string",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ];

        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const tokenURIRaw = await contract.methods.uri(tokenId).call();
        console.log(tokenURIRaw);
        let response;
        if (tokenURIRaw.startsWith("ipfs://")) {
          const ipfsGatewayURL = "https://ipfs.io/ipfs/";
          const ipfsHash = tokenURIRaw.replace("ipfs://", "");
          const ipfsURL = `${ipfsGatewayURL}${ipfsHash}`;
          console.log(ipfsURL);
          response = await axios.get(ipfsURL);
        } else if (tokenURIRaw.startsWith("ar://")) {
          const arweaveGatewayURL = "https://arweave.net/";
          const arweaveHash = tokenURIRaw.replace("ar://", "");
          const arweaveURL = `${arweaveGatewayURL}${arweaveHash}`;
          console.log(arweaveURL);
          response = await axios.get(arweaveURL);
        } else {
          response = await axios.get(tokenURIRaw);
        }

        const metadata = response.data;
        // console.log(metadata);
        console.log("tokenURI:", tokenURIRaw);
        console.log("Artist:", metadata.artist);
        console.log("losslessAudio:", metadata.losslessAudio);
        console.log("duration:", metadata.duration);
        console.log("name:", metadata.name);
        const newMetadata = new musicMetadata({
          contract: contractAddress,
          tokenId: tokenId,
          name: metadata.name,
          tokenURI: tokenURIRaw,
          artist: metadata.artist,
          losslessAudio: metadata.losslessAudio,
          duration: metadata.duration,
        });
        console.log("newMetadata:", newMetadata);
        await musicMetadataCollection.insertOne(newMetadata);
      } catch (error) {
        console.error("Error retrieving NFT metadata:", error);
      }
    }

    // const documents = await transactionsCollection
    //   .find({ type: "music" })
    //   .toArray();
    const documents1 = await transactionsCollection
      .aggregate([
        {
          $match: { type: "music" }, // Add a $match stage to filter documents with type "music"
        },
        {
          $group: {
            _id: {
              tokentype: "$tokentype",
              contract: "$contract",
              tokenId: "$tokenId",
            },
          },
        },
        {
          $project: {
            _id: 0,
            contract: "$_id.contract",
            tokenId: "$_id.tokenId",
            tokentype: "$_id.tokentype",
          },
        },
        {
          $group: {
            _id: null,
            combinations: {
              $addToSet: {
                contract: "$contract",
                tokenId: "$tokenId",
                tokentype: "$tokentype",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            combinations: 1,
          },
        },
      ])
      .toArray();

    //console.log(documents);

    //console.log(documents.length);
    const combinationsArray = documents1[0].combinations;

    // Flatten the array of objects
    const flattenedArray = combinationsArray.reduce(
      (acc, current) => acc.concat(current),
      []
    );

    // console.log(flattenedArray);

    // Create an empty array to store the result
    const documents = [];

    // Iterate over each item in the input array
    flattenedArray.forEach((item) => {
      // Iterate over each tokenId in the item
      item.tokenId.forEach((tokenId) => {
        // Push a new object with the current contract and tokenId to the result array
        documents.push({
          contract: item.contract,
          tokenId: tokenId,
          tokentype: item.tokentype,
        });
      });
    });

    // console.log(documents.length);
    //console.log(documents);

    for await (const document of documents) {
      const { contract, tokenId, tokentype } = document;

      try {
        //  for (const id of tokenId) {
        count++;
        console.log(count);
        //console.log(`Processing NFT ${contract} ${id}`);
        const exists = await musicMetadataCollection.findOne({
          contract,
          tokenId,
        });
        if (exists) {
          console.log(`NFT ${contract} ${tokenId} already exists`);
        } else if (!exists) {
          console.log(`Processing NFT ${contract} ${tokenId}`);
          if (tokentype === "ERC721") {
            await getNFTMetadataERC721(contract, tokenId);
          } else {
            await getNFTMetadataERC1155(contract, tokenId);
          }
        }
      } catch (error) {
        console.error(`Error processing tokenId`, error);
      }
    }

    //await client.close();
  } catch (error) {
    console.error("Error processing transactions", error);
  }
}

processTransactions();
