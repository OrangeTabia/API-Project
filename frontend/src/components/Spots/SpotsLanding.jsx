import { useDispatch, useSelector } from 'react-redux'; 
import { useNavigate } from 'react-router-dom'; 
import { useEffect } from 'react'; 
import { fetchSpots } from '../../store/spot';
import { fetchSpotDetails } from '../../store/spot';
import { MdStarRate } from "react-icons/md";
import './SpotsLanding.css'; 

const DisplayAllSpots = () => {
    const navigate = useNavigate(); 
    const dispatch = useDispatch();
    const spotsInfo = useSelector(state => state.spot.Spots);  

    console.log("SPOTS INFO", spotsInfo)


    useEffect(() => {
        dispatch(fetchSpots());
    }, [dispatch]);

    // useEffect(() => {
    //     dispatch(fetchSpotDetails()); 
    // }, [dispatch]); 

    return (
        <>
            <div className="all-spots-div">
                {spotsInfo?.map((spotTile) => {
                const handleTileClick = () => {
                    navigate(`spots/${spotTile.id}`); 
                }
                return (
                        <div key={spotTile.id} className="spot-tile" onClick={handleTileClick}>
                            <div className="image-div">
                                <img className="spot-image" src={'https://www.shutterstock.com/shutterstock/photos/1626908620/display_1500/stock-photo-north-lake-tahoe-at-california-1626908620.jpg'} alt="image thumbnail"/>
                            </div>
                            <div className="city-state-ratings">
                                <span>{`${spotTile.city}, ${spotTile.state}`}</span>
                                <span><MdStarRate />{(spotTile.avgRating != 0)? `${spotTile.avgRating}` : 'New'}</span>
                            </div>
                            <p className="price">{`$${spotTile.price}`} night</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

export default DisplayAllSpots;