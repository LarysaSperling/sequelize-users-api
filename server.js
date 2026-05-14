import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import { User, Post, Comment } from "./models/associations.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(express.json());

function handleValidationError(error, res) {
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: "Validation error",
      errors: error.errors.map((err) => err.message),
    });
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      message: "Unique constraint error",
      errors: error.errors.map((err) => err.message),
    });
  }

  return res.status(500).json({
    message: "Server error",
    error: error.message,
  });
}


app.post("/users", async (req, res) => {
  try {
    const { username, name, email, password, age } = req.body;

    const user = await User.create({
      username,
      name,
      email,
      password,
      age,
    });

    res.status(201).json(user);
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.get("/users", async (req, res) => {
  try {
    const { limit = 10, offset = 0, isActive } = req.query;

    const where = {};

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const users = await User.findAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
    });

    res.status(200).json(users);
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.get("/users/:id/posts", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "username", "email"],
      include: [
        {
          model: Post,
          as: "posts",
          include: [
            {
              model: Comment,
              as: "comments",
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["id", "username", "email"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user.posts);
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { username, name, email, password, age, isActive } = req.body;

    await user.update({
      username,
      name,
      email,
      password,
      age,
      isActive,
    });

    res.status(200).json(user);
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.patch("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.update(req.body);

    res.status(200).json(user);
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.destroy();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.post("/posts", async (req, res) => {
  try {
    const { title, content, userId, published } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const post = await Post.create({
      title,
      content,
      userId,
      published,
    });

    res.status(201).json(post);
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
    });

    res.status(200).json(posts);
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    await post.increment("views");

    const updatedPost = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username", "email"],
            },
          ],
        },
      ],
    });

    res.status(200).json(updatedPost);
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.put("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const { title, content, userId, published, views } = req.body;

    await post.update({
      title,
      content,
      userId,
      published,
      views,
    });

    res.status(200).json(post);
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.delete("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    await post.destroy();

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.post("/posts/:postId/comments", async (req, res) => {
  try {
    const { content, userId } = req.body;
    const { postId } = req.params;

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const comment = await Comment.create({
      content,
      userId,
      postId,
    });

    res.status(201).json(comment);
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.get("/stats", async (req, res) => {
  try {
    const totalPosts = await Post.count();

    const publishedPosts = await Post.count({
      where: {
        published: true,
      },
    });

    const totalComments = await Comment.count();

    const topPosts = await Post.findAll({
      order: [["views", "DESC"]],
      limit: 5,
      attributes: ["id", "title", "views"],
    });

    res.status(200).json({
      totalPosts,
      publishedPosts,
      totalComments,
      topPosts,
    });
  } catch (error) {
    handleValidationError(error, res);
  }
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
  }
}

startServer();