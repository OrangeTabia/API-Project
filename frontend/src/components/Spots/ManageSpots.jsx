import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { fetchLoadCurrentUserSpots } from '../../store/spot';
import { useEffect } from 'react';
import OpenModalButton from '../OpenModalButton';
import DeleteSpot from './DeleteSpot';
import { MdStarRate } from "react-icons/md";
import { LiaCopyright } from "react-icons/lia";
import './ManageSpots.css'; 

const ManageSpots = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); 
    const currentUserSpots = useSelector(state => state.spot.Spots); 
    const currentUser = useSelector(state => state.session?.user)

    useEffect(() => {
        dispatch(fetchLoadCurrentUserSpots()); 
    }, [dispatch])
 
    // const noExistingSpots = currentUserSpots?.length <= 0;  

    return (
        <div className="manage-spots-div">
            <h1 className="manage-spots-title">Manage Spots</h1>

            {currentUser && 
            <NavLink to="/spots">
                <button className="create-new-spot-button">Create a New Spot</button>
            </NavLink>}

            <div className="current-spots-div">
                {currentUserSpots?.map((spotTile) => {
                    const handleTileClick = () => {
                        navigate(`/spots/${spotTile.id}`);
                    }

                    return (
                        <div key={spotTile.id} className="manage-spot-tile">
                            <div className="spot-tile-info" onClick={handleTileClick}>
                                <div className="image-div">
                                    <img className="spot-image" src={spotTile.previewImage} alt="image thumbnail"/>
                                </div>
                                <div className="city-state-ratings">
                                    <span>{`${spotTile.city}, ${spotTile.state}`}</span>
                                    <span><MdStarRate />{(spotTile.avgRating != 0)? `${(spotTile.avgRating).toFixed(1)}` : 'New'}</span>
                                </div>
                                <div className="price-per-night">    
                                    <span className="price">{`$${spotTile.price} `}</span>
                                    <span className="night">night</span>
                                </div>
                            </div>
                        
                            <div className="update-delete-buttons">   
                                <button onClick={() => navigate(`/spots/${spotTile.id}/edit`)} className="update-button">Update</button>
                                <OpenModalButton
                                buttonText="Delete"
                                modalComponent={<DeleteSpot spotId={spotTile.id}/>}
                                />
                            </div>
                        </div>
                    )
                })}

            </div>
            <hr className="footer-line"></hr>
            <footer>
                <span><LiaCopyright /> 2024 Tabia Ye</span>
            </footer>
        </div>

    )
}

export default ManageSpots;