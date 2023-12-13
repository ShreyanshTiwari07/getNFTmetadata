const mongoose = require("mongoose");

const musicMetadataSchema = new mongoose.Schema({
  contract: String,
  tokenId: Number,
  name: String,
  tokenURI: String,
  artist: String,
  losslessAudio: String,
  duration: Number,
});

const musicMetadata = mongoose.model("musicMetadata", musicMetadataSchema);

module.exports = { musicMetadata };
