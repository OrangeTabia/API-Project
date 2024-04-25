import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; 
import { fetchAddReview } from '../../store/spot';
import { useModal } from '../../context/Modal';
import ReviewsRatingInput from './ReviewsRatingInput';

const ReviewForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch(); 
    const { spotId } = useParams(); 
    const [review, setReview] = useState('');
    const [stars, setStars] = useState(0); 
    const [errors, setErrors] = useState({}); 
    const [hasSubmitted, setHasSubmitted] = useState(false); 
    const { closeModal } = useModal(); 
    // Pull out the current user to pass to the review
    const currentUser = useSelector(state => state.session?.user); 


    useEffect(() => {
        const errors = {};
        if (review.length < 10) errors.review = "Please write at least 10 characters";
        if (stars == 0) errors.stars = "Please select a star rating";
        // if current user has already created a review, errors.existingReview = "Review already exists for this spot";
        setErrors(errors); 
    }, [review, stars]); 


    const handleSubmit = async (e) => {
        e.preventDefault();
        setHasSubmitted(true);

        if (Object.values(errors).length > 0) {
            console.log('Stay on form, errors are present!');
        } else {
            const newReview = {
                review,
                stars
            }

            const newReviews = await dispatch(fetchAddReview(newReview, spotId, currentUser));
            navigate(`/spots/${spotId}`); 
            return newReviews;
        }
    }; 

    return (
        <form onSubmit={handleSubmit}>
            <div className="review-form">
                <h1>How was your stay?</h1>
                <div className="errors">
                {hasSubmitted && errors.review}
                <br></br>
                {hasSubmitted && errors.stars}
                </div>
                <textarea 
                    className="review-area"
                    rows="6" 
                    cols="30"
                    placeholder="Just a quick review."
                    onChange={(e) => setReview(e.target.value)}
                >
                </textarea>
                <div className="star-ratings">
                    <ReviewsRatingInput
                        changeStars={setStars}
                        stars={stars}
                    />
                </div>
                <button className="submit-button" type="submit" onClick={(e) => { 
                    handleSubmit(e).then(closeModal());
                }} disabled={Object.values(errors).length > 0}>Submit Your Review</button>
            </div>
        </form>
    )
 }


export default ReviewForm;