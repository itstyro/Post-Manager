const asyncMiddleware = require('../catchAsync');
const Post = require('../models/post');

exports.createPost = asyncMiddleware(async (req, res) => {
  const url = `${req.protocol}://${req.get('host')}`;
  const post = new Post({
    title: req.body.title,
    description: req.body.description,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });
  const postCreated = await post.save();
  if (postCreated) {
    res.status(201).json({
      message: 'Post added successfully',
      post: {
        id: post._id,
        title: post.title,
        description: post.description,
        imagePath: post.imagePath,
      }
    });
  } else {
    res.status(500).json({
      message: 'Creating a post failed!'
    });
  }
});

exports.getPost = asyncMiddleware(async (req, res) => {
  try {
    const post = await Post.findById({
      _id: req.params.id
    });
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(400).json('No post found');
    }
  } catch (err) {
    res.status(500).json({
      message: 'Fetching post failed!'
    });
  }
});

exports.updatePost = asyncMiddleware(async (req, res) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = `${req.protocol}://${req.get('host')}`;
    imagePath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.params.id,
    title: req.body.title,
    description: req.body.description,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  try {
    const updatedPost = await Post.updateOne({
      _id: req.params.id,
      creator: req.userData.userId
    }, post);
    console.log(updatedPost);
    if (updatedPost.nModified > 0) {
      res.status(200).json({
        message: 'Post updated successfully',
        post: post
      });
    } else {
      res.status(401).json({
        error: {
          message: 'Auth failed!'
        }
      });
    }
  } catch (err) {
    res.status(500).json({
      message: `Couldn't update post!`
    });
  }
});


exports.deletePost = asyncMiddleware(async (req, res) => {
  try {
    const postDeleted = await Post.deleteOne({
      _id: req.params.id,
      creator: req.userData.userId
    });
    if (postDeleted.n > 0) {
      console.log('post deleted successfully');
      res.status(200).json({
        message: 'Post deleted successfully'
      });
    } else {
      res.status(401).json({
        message: 'Auth failed!'
      });
    }
  } catch (err) {
    res.status(500).json({
      message: `Couldn't delete post!`
    });
  }
});


exports.getAllPosts = asyncMiddleware(async (req, res) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  try {
    const posts = await postQuery;
    const count = await Post.count();
    res.status(200).json({
      posts: posts,
      maxPosts: count,
      message: 'post fetched successfully'
    });
  } catch (err) {
    res.status(500).json({
      message: `Couldn't fetch posts!`
    });
  }
});
