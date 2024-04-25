import SpotForm from './SpotForm'; 
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom'; 
import { useEffect } from 'react'; 
import { fetchSpotDetails } from '../../store/spot';

const UpdateSpot = () => {
    const currentUser = useSelector(state => state.session?.user);
    const ownerInfo = useSelector(state => state.spot?.Owner); 
    let isOwner = currentUser?.id == ownerInfo?.id;
    
    const { spotId } = useParams(); 
    const dispatch = useDispatch(); 
    const spot = useSelector(state => state.spot); 

    useEffect(() => {
        dispatch(fetchSpotDetails(spotId)); 
    }, [dispatch, spotId]); 

    // Ensure current user is the spot ownerId
    if (!spot || !isOwner) return (<></>); 

    return (
        <>
            <SpotForm 
            spot={spot}
            formType={"Update Spot"}
            />
        </>
    )
}

export default UpdateSpot;