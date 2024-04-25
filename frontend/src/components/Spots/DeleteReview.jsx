import { useModal } from '../../context/Modal';
import { useDispatch } from 'react-redux';
import { fetchDeleteReview, fetchReviews, fetchSpotDetails } from '../../store/spot';

const DeleteReview = ({reviewId, spotId}) => {
    const { closeModal } = useModal();
    const dispatch = useDispatch(); 

    const handleDelete = async (e) => {
        e.preventDefault(); 
        await dispatch(fetchDeleteReview(reviewId)); 
        await dispatch(fetchReviews(spotId));
        await dispatch(fetchSpotDetails(spotId)); 
        await closeModal(); 
    }

    return (
        <div>
        <h1>Confirm Delete</h1>
        <p>Are you sure you want to delete this review?</p>
        <button type="submit" onClick={handleDelete}>Yes (Delete Review)</button>
        <button type="submit" onClick={() => closeModal()}>No (Keep Review)</button>
    </div>
    )
}

export default DeleteReview;