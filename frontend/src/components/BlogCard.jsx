import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Link,
  IconButton,
} from '@mui/material';
import { FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';

const BlogCard = ({ blog }) => {
  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          <Link component={RouterLink} to={`/blogs/${blog._id}`} color="inherit">
            {blog.title}
          </Link>
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          By {blog.author.firstName} {blog.author.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {blog.content.substring(0, 150)}...
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Button component={RouterLink} to={`/blogs/${blog._id}`} size="small">
          Read More
        </Button>
        <IconButton aria-label="add to favorites">
          <FavoriteBorderIcon />
          <Typography variant="body2" sx={{ ml: 1 }}>
            {blog.likes.length}
          </Typography>
        </IconButton>
      </CardActions>
    </Card>
  );
};

BlogCard.propTypes = {
  blog: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    author: PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
    }).isRequired,
    likes: PropTypes.array.isRequired,
  }).isRequired,
};

export default BlogCard;
