import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; 
import { useEffect } from 'react'; 
import { fetchSpotDetails } from '../../store/spot';
import { fetchReviews } from '../../store/spot';
import { MdStarRate } from "react-icons/md";
import OpenModalButton from '../OpenModalButton';
import CreateReview from './CreateReview'; 
import DeleteReview from './DeleteReview';
import './SpotDetails.css'; 

const SpotDetails = () => {
    const { spotId } = useParams();
    const dispatch = useDispatch();
    const ownerInfo = useSelector(state => state.spot.Owner); 
    const imagesInfo = useSelector(state => state.spot.SpotImages); 
    const spotInfo = useSelector(state => state.spot); 
    const reviewsInfo = useSelector(state => state.spot.Reviews);
    const currentUser = useSelector(state => state.session?.user);
    const previewImage = imagesInfo?.find((image) => image.preview == true);
    const images = imagesInfo?.filter((image) => image.preview == false); 

    useEffect(() => {
        dispatch(fetchSpotDetails(spotId));
    }, [dispatch, spotId]);

    useEffect(() => {
        dispatch(fetchReviews(spotId));
    }, [dispatch, spotId]);


    // Date converter
    const convertDate = (date) => {
        const months = [ 
            '',
            'January', 
            'Feburary', 
            'March', 
            'April', 
            'May', 
            'June', 
            'July', 
            'August', 
            'September', 
            'October', 
            'November', 
            'December']
        const month = months[date.substring(6,7)]

        return `${month} ${date.substring(0,4)}`
    }

    const reserveClick = () => {
        alert('Feature coming soon!'); 
    }


    // A boolean to represent whether a current user has already created a review
    let canReview = reviewsInfo?.find((review) => review.userId == currentUser?.id) == undefined;
    // Create a boolean to represent whether a current user is the owner
    let notOwner = currentUser?.id !== ownerInfo?.id;
    let numRev = spotInfo.numReviews;

    return (
        <>
            <div className="spot-details-div">
                <div className="name-and-location">
                    <h1>{spotInfo.name}</h1>
                    <h3>{`${spotInfo.city}, ${spotInfo.state}, ${spotInfo.country}`}</h3>
                </div>
                <div className="spot-images">
                    <div className="left-image-div">
                        <img className="left-image" src={previewImage?.url} alt="tahoe-house"></img>
                    </div>
                    <div className="right-images-div">
                        {images?.map((image) => (
                            <img className="right-images" src={image?.url} alt="tahoe-house"></img>
                        ))}
                    </div>
                </div>
                <div className="spot-info-and-reviews">
                    <div className="host-description-reserve">
                        <div className="hostname-description">
                            <h2>{`Hosted by ${ownerInfo?.firstName} ${ownerInfo?.lastName}`}</h2>
                            <p>{spotInfo.description}</p>
                        </div>
                        <div className="reserve-div">
                            <div className="price-reviews">
                                <span className="price">{`$${spotInfo.price} night`}</span>
                                <span className="star-rating-reviews"><MdStarRate />{spotInfo.avgRating ? `${(spotInfo?.avgRating).toFixed(1)} · ${numRev} ${numRev > 1 ? 'reviews': 'review'}` : 'New'}</span>
                            </div>
                            <button className="reserve-button" onClick={reserveClick}>Reserve</button>
                        </div>
                    </div>
                    <hr></hr>
                    <div className="reviews">
                        <span><MdStarRate />{numRev ? `${(spotInfo?.avgRating).toFixed(1)} · ${numRev} ${numRev > 1 ? 'reviews': 'review'}` : `${(spotInfo?.avgRating)}`}</span>

                        <br></br>
                        {canReview && notOwner && currentUser && (<OpenModalButton 
                            buttonText= {spotInfo.numReviews == 0 ? 'Be the first to post a review!' : "Post Your Review"}
                            modalComponent={<CreateReview />}
                        />)}
                        {
                            reviewsInfo?.map((review) => {
                                // analyze each one to see if we can review!
                                // A boolean to represent whether a current user can delete their review
                                let canDeleteReview = review.userId == currentUser.id; 

                                return (
                                <div key={review.id}>
                                    <h4 className="reviewer-name">{review.User.firstName}</h4>
                                    <h4 className="review-date">{convertDate(review.createdAt)}</h4>
                                    <p className="review-description">{review.review}</p>
                                    {canDeleteReview && (
                                        <OpenModalButton
                                        buttonText="Delete"
                                        modalComponent={<DeleteReview reviewId={review.id} spotId={spotId}/>}
                                        />
                                    )}
                                </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    )
}


export default SpotDetails;