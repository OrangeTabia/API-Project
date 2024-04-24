import ReviewFormModal from './ReviewFormModal'; 
import { useSelector } from 'react-redux';

const CreateReview = () => {
    const currentUser = useSelector(state => state.session?.user); 

    if (currentUser) {
        const review = {
            review: '',
            stars: ''
        }
    
        return (
            <ReviewFormModal 
            review={review}
            formType={"Create Review"}
            />
        )
    }
}

export default CreateReview;