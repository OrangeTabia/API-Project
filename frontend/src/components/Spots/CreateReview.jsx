import ReviewFormModal from './ReviewFormModal'; 
import { useSelector } from 'react-redux';

const CreateReview = () => {
    const currentUser = useSelector(state => state.session?.user); 

    if (currentUser) {
        return (
            <ReviewFormModal 
            />
        )
    }
}

export default CreateReview;