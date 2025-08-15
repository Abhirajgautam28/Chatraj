import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    Link
} from '@mui/material';
import { FavoriteBorder } from '@mui/icons-material';

const BlogCard = ({ blog }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                    <Link component={RouterLink} to={`/blogs/${blog._id}`} color="inherit" underline="hover">
                        {blog.title}
                    </Link>
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    By {blog.author.firstName} {blog.author.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    {blog.content.substring(0, 100)}...
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                    <Button component={RouterLink} to={`/blogs/${blog._id}`} size="small">
                        Read More
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FavoriteBorder sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                            {blog.likes.length}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
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
