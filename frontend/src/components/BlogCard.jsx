import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
    Card,
    CardActionArea,
    CardContent,
    Typography,
    Box,
} from '@mui/material';
import { Favorite } from '@mui/icons-material';

const BlogCard = ({ blog }) => {
    const navigate = useNavigate();
    return (
        <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <CardActionArea onClick={() => navigate(`/blogs/${blog._id}`)}>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div" noWrap>
                        {blog.title}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        By {blog.author.firstName} {blog.author.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {blog.content.substring(0, 150)}...
                    </Typography>
                </CardContent>
            </CardActionArea>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="primary">
                    Read More &rarr;
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Favorite sx={{ color: 'red', mr: 0.5 }} />
                    <Typography variant="body2">{blog.likes.length}</Typography>
                </Box>
            </Box>
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
