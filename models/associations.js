import User from "./User.js";
import Post from "./Post.js";
import Comment from "./Comment.js";

User.hasMany(Post, {
  foreignKey: "userId",
  as: "posts",
});

Post.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(Comment, {
  foreignKey: "userId",
  as: "comments",
});

Post.hasMany(Comment, {
  foreignKey: "postId",
  as: "comments",
});

Comment.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Comment.belongsTo(Post, {
  foreignKey: "postId",
  as: "post",
});

export { User, Post, Comment };