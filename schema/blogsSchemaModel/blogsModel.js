import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  content: {
    introduction: String,
    sections: [
      {
        heading: String,
        body: String,
      },
    ],
    conclusion: String,
  },
  excerpt: String,
  author: {
    name: String,
    email: String,
  },
  categories: [String],
  tags: [String],
  coverImage: String,
  published: {
    type: Boolean,
    default: false,
  },
  publishedAt: Date,
  views: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const BlogModal = mongoose.model("Blog", blogSchema);

export default BlogModal;
