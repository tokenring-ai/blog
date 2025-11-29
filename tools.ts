import {default as createPost} from "./tools/createPost.ts";
import {default as generateImageForPost} from "./tools/generateImageForPost.ts";
import {default as getAllPosts} from "./tools/getAllPosts.ts";
import {default as getCurrentPost} from "./tools/getCurrentPost.ts";
import {default as updatePost} from "./tools/updatePost.ts";

export default {
  createPost,
  updatePost,
  getAllPosts,
  getCurrentPost,
  generateImageForPost,
}