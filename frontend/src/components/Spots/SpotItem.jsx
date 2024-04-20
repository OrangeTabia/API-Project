import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; 
import { useEffect } from 'react'; 
import { fetchSpotDetails } from '../../store/spot';
import { MdStarRate } from "react-icons/md";

const SpotDetails = () => {
    const { spotId } = useParams();
    const dispatch = useDispatch();
    const ownerInfo = useSelector(state => state.spot.Owner); 
    const imagesInfo = useSelector(state => state.spot.SpotImages); 
    const spotInfo = useSelector(state => state.spot); 

    console.log("CURRENT SPOT INFO", spotInfo); 

    useEffect(() => {
        dispatch(fetchSpotDetails(spotId));
    }, [dispatch, spotId]);


    return (
        <>
            <h1>Spot Details</h1>
            <div className="spot-details-div">
                <div className="name-and-location">
                    <h1>{spotInfo.name}</h1>
                    <h4>{`${spotInfo.city}, ${spotInfo.state}, ${spotInfo.country}`}</h4>
                </div>
                <div className="spot-images">
                    <div className="left-image-div">
                        <img className="left-image"></img>
                    </div>
                    <div className="right-images-div">
                        <img className="right-image1"></img>
                        <img className="right-image2"></img>
                        <img className="right-image3"></img>
                        <img className="right-image4"></img>
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
                                <span className='price'>{`$${spotInfo.price} night`}</span>
                                <span className='star-rating-reviews'><MdStarRate />{`${spotInfo.avgRating} | ${spotInfo.numReviews} reviews`}</span>
                            </div>
                            <button>Reserve</button>
                        </div>
                    </div>
                    <div className="reviews">
                        <span>{`${spotInfo.avgRating} | ${spotInfo.numReviews} reviews`}</span>
                        <h4>Reviewer's First Name</h4>
                        <h4>Review Date - Month Year</h4>
                        <p>Review Description</p>
                    </div>
                </div>
            </div>
        </>
    )
}


export default SpotDetails;