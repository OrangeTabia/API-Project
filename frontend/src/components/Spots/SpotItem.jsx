import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; 
import { useEffect } from 'react'; 
import { fetchSpotDetails } from '../../store/spot';
import { MdStarRate } from "react-icons/md";
import { PiDotOutlineFill } from "react-icons/pi";
import './SpotItem.css'; 

const SpotDetails = () => {
    const { spotId } = useParams();
    const dispatch = useDispatch();
    const ownerInfo = useSelector(state => state.spot.Owner); 
    const imagesInfo = useSelector(state => state.spot.SpotImages); 
    const spotInfo = useSelector(state => state.spot);  

    useEffect(() => {
        dispatch(fetchSpotDetails(spotId));
    }, [dispatch, spotId]);


    return (
        <>
            <h1>Spot Details</h1>
            <div className="spot-details-div">
                <div className="name-and-location">
                    <h1>{spotInfo.name}</h1>
                    <h3>{`${spotInfo.city}, ${spotInfo.state}, ${spotInfo.country}`}</h3>
                </div>
                <div className="spot-images">
                    <div className="left-image-div">
                        <img className="left-image" src="https://www.mountainliving.com/content/uploads/data-import/ae886c8e/DJI_0087bach-house.jpg" alt="tahoe-house"></img>
                    </div>
                    <div className="right-images-div">
                        <img className="right-image1" src="https://www.mountainliving.com/content/uploads/data-import/ae886c8e/DJI_0087bach-house.jpg" alt="tahoe-house"></img>
                        <img className="right-image2" src="https://www.mountainliving.com/content/uploads/data-import/ae886c8e/DJI_0087bach-house.jpg" alt="tahoe-house"></img>
                        <img className="right-image3" src="https://www.mountainliving.com/content/uploads/data-import/ae886c8e/DJI_0087bach-house.jpg" alt="tahoe-house"></img>
                        <img className="right-image4" src="https://www.mountainliving.com/content/uploads/data-import/ae886c8e/DJI_0087bach-house.jpg" alt="tahoe-house"></img>
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
                                <span className="star-rating-reviews"><MdStarRate />{`${spotInfo.avgRating}`} <PiDotOutlineFill /> {`${spotInfo.numReviews} reviews`}</span>
                            </div>
                            <button className="reserve-button">Reserve</button>
                        </div>
                    </div>
                    <hr></hr>
                    <div className="reviews">
                        <span><MdStarRate />{`${spotInfo.avgRating}`} <PiDotOutlineFill /> {`${spotInfo.numReviews} reviews`}</span>
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