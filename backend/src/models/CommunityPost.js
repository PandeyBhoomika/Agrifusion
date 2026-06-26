// models/CommunityPost.js

const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    tag: {
      type: String,
      enum: ["Tip", "Question", "Update"],
      default: "Update",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Keep likesCount in sync automatically
communityPostSchema.pre("save", function (next) {
  this.likesCount = this.likes.length;
  next();
});

module.exports = mongoose.model("CommunityPost", communityPostSchema);
